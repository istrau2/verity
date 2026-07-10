import { createRoot } from "react-dom/client";
import { api } from "../api";
import { extractSentences } from "./sentences";
import { injectMarkStyles, paint } from "./highlighter";
import { groups, hooks, page, pageStatus, records, type SentenceRecord } from "./store";
import type { ArticleResolveResult, ParagraphInput } from "../shared/types";
import { wallet } from "../wallet/wallet";
import { Overlay } from "./overlay";
import { tokens } from "../shared/tokens";

/**
 * Content-script entry. Runs on Wikipedia article pages.
 *
 * Resolution is LAZY and paragraph-batched: we extract every sentence up
 * front (cheap, local), then analyze paragraphs as they scroll into view —
 * an IntersectionObserver queues visible paragraphs and a settle debounce
 * flushes them to the gateway, which caches decomposition per paragraph
 * (viewport-independent, shared by all users of a revision). Marks paint
 * additively as batches resolve; claim groups merge across batches because
 * groupIds are content hashes of the canonical text.
 */

interface Paragraph {
  paragraphId: string;
  el: HTMLElement;
  sentences: { sentenceId: string; text: string; flagged?: boolean; el: HTMLElement; start: number; end: number }[];
  state: "idle" | "requested" | "done";
}

// Wait for the viewport to stop moving before flushing. Generous on purpose:
// slow scrolling would otherwise fire a request per paragraph and trip the
// LLM provider's tokens-per-minute limit.
const SETTLE_MS = 1000;
const MAX_BATCH_SENTENCES = 80; // keep each gateway request snappy

async function boot() {
  // Honor the popup on/off toggle.
  const { enabled } = await chrome.storage.local.get("enabled");
  if (enabled === false) {
    console.log("[Verity] overlay disabled via popup");
    return;
  }
  console.log("[Verity] content script loaded on", location.href);
  // Mount the overlay unconditionally so the launcher is always a proof of
  // life, even if this page's markup yields no extractable sentences.
  injectMarkStyles();
  mountOverlay();
  // Silently restore a prior wallet session (no prompt) so a page refresh
  // doesn't demand a reconnect.
  void wallet.restore();

  const raw = extractSentences();
  console.log(`[Verity] extracted ${raw.length} sentences`);
  if (raw.length === 0) return;

  // Group sentences by paragraph — the lazy-load + server-cache unit.
  const paragraphs: Paragraph[] = [];
  const byEl = new Map<HTMLElement, Paragraph>();
  for (const s of raw) {
    let p = byEl.get(s.el);
    if (!p) {
      p = { paragraphId: s.sentenceId.replace(/s\d+$/, ""), el: s.el, sentences: [], state: "idle" };
      byEl.set(s.el, p);
      paragraphs.push(p);
    }
    p.sentences.push(s);
  }
  const orderOf = new Map(paragraphs.map((p, i) => [p, i]));
  const revisionId = extractRevisionId();

  let inflight = 0;
  function setStatus(error: string | null = pageStatus.error) {
    pageStatus.loading = inflight > 0;
    pageStatus.error = error;
    document.dispatchEvent(new CustomEvent("verity:ready"));
  }

  /** Last sentences of the preceding paragraph — pronoun-resolution context. */
  function contextFor(p: Paragraph): string[] {
    const prev = paragraphs[(orderOf.get(p) ?? 0) - 1];
    return prev ? prev.sentences.slice(-2).map((s) => s.text) : [];
  }

  // Per-paragraph in-flight promises so the on-demand path can await a batch
  // that's already running instead of falling back to the raw-text flow.
  const inflightBatches = new Map<Paragraph, Promise<void>>();

  function requestBatch(batch: Paragraph[]): Promise<void> {
    const promise = runBatch(batch);
    batch.forEach((p) => inflightBatches.set(p, promise));
    void promise.finally(() => batch.forEach((p) => inflightBatches.delete(p)));
    return promise;
  }

  async function runBatch(batch: Paragraph[]): Promise<void> {
    batch.forEach((p) => (p.state = "requested"));
    inflight++;
    setStatus(null);
    try {
      const payload: ParagraphInput[] = batch.map((p) => ({
        paragraphId: p.paragraphId,
        context: contextFor(p),
        sentences: p.sentences.map((s) => ({ sentenceId: s.sentenceId, text: s.text })),
      }));
      const res = await api.resolveArticle({
        url: page.url,
        title: page.title.replace(/ - Wikipedia$/, ""),
        revisionId,
        paragraphs: payload,
      });
      ingest(res, batch);
      batch.forEach((p) => {
        p.state = "done";
        io.unobserve(p.el);
      });
    } catch (e) {
      // Back to idle: the paragraphs re-queue on the next scroll/settle.
      batch.forEach((p) => (p.state = "idle"));
      console.warn("[Verity] paragraph batch failed:", e);
      setStatus(e instanceof Error ? e.message : "Analysis failed");
      return;
    } finally {
      inflight--;
      setStatus();
    }
  }

  /** Merge a batch's groups into the store and paint its sentences. */
  function ingest(res: ArticleResolveResult, batch: Paragraph[]) {
    for (const g of res.groups) {
      const existing = groups.get(g.groupId);
      if (!existing) {
        groups.set(g.groupId, { ...g });
      } else {
        for (const id of g.sentenceIds) {
          if (!existing.sentenceIds.includes(id)) existing.sentenceIds.push(id);
        }
        // Fresher on-chain data wins (scores move between batches).
        if (g.claim) {
          existing.claim = g.claim;
          existing.status = g.status;
          existing.matchScore = g.matchScore;
        }
      }
    }

    // One group per sentence for painting; prefer one that's on-chain.
    const groupBySentence = new Map<string, string>();
    for (const g of res.groups) {
      for (const id of g.sentenceIds) {
        const cur = groupBySentence.get(id);
        const curOnChain = cur ? groups.get(cur)?.status !== "eligible" : false;
        if (!cur || (!curOnChain && g.status !== "eligible")) groupBySentence.set(id, g.groupId);
      }
    }

    const recs: SentenceRecord[] = [];
    for (const p of batch) {
      for (const s of p.sentences) {
        const gid = groupBySentence.get(s.sentenceId);
        const g = gid ? groups.get(gid) : undefined;
        recs.push(
          g
            ? { ...s, status: g.status, claim: g.claim, matchScore: g.matchScore, groupId: g.groupId, canonicalText: g.canonicalText }
            : { ...s, status: "none" }, // fluff
        );
      }
    }
    for (const rec of recs) records.set(rec.sentenceId, rec);
    paint(recs);
  }

  // ── Viewport loop: queue visible paragraphs, flush on settle ─────────────
  const queue = new Set<Paragraph>();
  let settleTimer: ReturnType<typeof setTimeout> | null = null;

  function flush() {
    const pending = [...queue].filter((p) => p.state === "idle");
    queue.clear();
    // Chunk so one flush can't produce an oversized request.
    let batch: Paragraph[] = [];
    let count = 0;
    for (const p of pending) {
      if (count + p.sentences.length > MAX_BATCH_SENTENCES && batch.length > 0) {
        void requestBatch(batch);
        batch = [];
        count = 0;
      }
      batch.push(p);
      count += p.sentences.length;
    }
    if (batch.length > 0) void requestBatch(batch);
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const p = byEl.get(e.target as HTMLElement);
        if (p && p.state === "idle") queue.add(p);
      }
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(flush, SETTLE_MS);
    },
    // Prefetch the paragraph just below the fold before the reader reaches it.
    { rootMargin: "600px 0px" },
  );
  paragraphs.forEach((p) => io.observe(p.el));

  // On-demand path: a selection landed in a paragraph the lazy loader hasn't
  // reached (or one that's mid-flight). Analyze it now / wait for it.
  hooks.analyzeParagraph = async (el: HTMLElement) => {
    const p = byEl.get(el);
    if (!p) return;
    if (p.state === "requested") return inflightBatches.get(p);
    if (p.state === "idle") return requestBatch([p]);
  };
}

/** Wikipedia embeds the revision id in an inline RLCONF script in <head>. */
function extractRevisionId(): string | null {
  for (const script of Array.from(document.scripts)) {
    const m = /"wgRevisionId":\s*(\d+)/.exec(script.textContent ?? "");
    if (m) return m[1];
  }
  return null;
}

function mountOverlay() {
  const host = document.createElement("div");
  host.id = "verity-root";
  host.style.all = "initial";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: ${tokens.font}; }
    button { font-family: inherit; }
    @keyframes vr-spin { to { transform: rotate(360deg); } }
    @keyframes vr-pulse { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
  `;
  shadow.appendChild(style);

  const container = document.createElement("div");
  shadow.appendChild(container);
  createRoot(container).render(<Overlay />);
}

boot();
