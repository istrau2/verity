import { createRoot } from "react-dom/client";
import { api } from "../api";
import { extractSentences } from "./sentences";
import { injectMarkStyles, paint } from "./highlighter";
import { page, records, type SentenceRecord } from "./store";
import { Overlay } from "./overlay";
import { tokens } from "../shared/tokens";

/**
 * Content-script entry. Runs on Wikipedia article pages:
 *   1. extract sentences → 2. resolve them to claims → 3. paint in-page marks
 *   → 4. mount the shadow-DOM React overlay (launcher + hover card + panel).
 */
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

  const raw = extractSentences();
  console.log(`[Verity] extracted ${raw.length} sentences`);
  if (raw.length === 0) return;

  const res = await api.resolveSentences({
    url: page.url,
    title: page.title.replace(/ - Wikipedia$/, ""),
    sentences: raw.map((r) => ({
      sentenceId: r.sentenceId,
      text: r.text,
      flagged: r.flagged,
    })),
  });

  const byId = new Map(res.matches.map((m) => [m.sentenceId, m]));
  const recs: SentenceRecord[] = raw.map((r) => {
    const m = byId.get(r.sentenceId);
    return { ...r, status: m?.status ?? "none", claim: m?.claim, matchScore: m?.matchScore };
  });
  for (const rec of recs) records.set(rec.sentenceId, rec);
  paint(recs);
  const painted = recs.filter((r) => r.status !== "none").length;
  console.log(`[Verity] painted ${painted} marks`);
  document.dispatchEvent(new CustomEvent("verity:ready"));
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
  `;
  shadow.appendChild(style);

  const container = document.createElement("div");
  shadow.appendChild(container);
  createRoot(container).render(<Overlay />);
}

boot();
