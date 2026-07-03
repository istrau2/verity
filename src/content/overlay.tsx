import { useEffect, useMemo, useRef, useState } from "react";
import { on, records } from "./store";
import { markRect } from "./highlighter";
import { HoverCard } from "./components/HoverCard";
import { SidePanel } from "./components/SidePanel";
import { Launcher } from "./components/Launcher";
import { expandToSentences } from "./sentenceSelection";
import { tokens } from "../shared/tokens";

/** Root React app living in the shadow root: launcher + hover card + panel. */
export function Overlay() {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [panelId, setPanelId] = useState<string | null>(null);
  const [, force] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [sel, setSel] = useState<{ text: string; rect: DOMRect } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Snapshot the selected text at mousedown so a selection-clear between
  // mousedown and click on the button can't drop it.
  const pendingText = useRef<string | null>(null);

  useEffect(() => {
    const offs = [
      on("hover", ({ sentenceId }) => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        setHoverId(sentenceId);
      }),
      on("hoverEnd", () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setHoverId(null), 120);
      }),
      on("open", ({ sentenceId }) => {
        setHoverId(null);
        setPanelId(sentenceId);
      }),
      on("create", ({ sentenceId }) => {
        setHoverId(null);
        setPanelId(sentenceId);
      }),
    ];
    const ready = () => force((n) => n + 1);
    document.addEventListener("verity:ready", ready);
    const toastHandler = (e: Event) => {
      setToast((e as CustomEvent).detail?.msg ?? null);
      setTimeout(() => setToast(null), 2600);
    };
    document.addEventListener("verity:toast", toastHandler);
    return () => {
      offs.forEach((o) => o());
      document.removeEventListener("verity:ready", ready);
      document.removeEventListener("verity:toast", toastHandler);
    };
  }, []);

  // Track text selections. With NO panel open we show a floating "+ Create
  // claim" button. With a panel open, finalizing a selection jumps the panel
  // straight into the create view seeded with that text (as if you'd clicked
  // the floating button).
  useEffect(() => {
    const qualify = (): { text: string; rect: DOMRect } | null => {
      const s = window.getSelection();
      if (!s || s.isCollapsed || s.rangeCount === 0) return null;
      const raw = s.toString().replace(/\s+/g, " ").trim();
      const anchor = s.anchorNode;
      // Ignore selections inside our own overlay (e.g. the validator textarea).
      const host = document.getElementById("verity-root");
      if (raw.length < 8 || !anchor || (host && host.contains(anchor))) return null;
      // Snap the selection out to whole sentences for the claim text.
      const text = expandToSentences(s) ?? raw;
      let rect = s.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        const el = anchor.nodeType === 1 ? (anchor as Element) : anchor.parentElement;
        if (el) rect = el.getBoundingClientRect();
      }
      return { text, rect };
    };
    const onChange = () => setSel(panelId ? null : qualify());
    const onFinalize = (e: Event) => {
      // Ignore interactions inside our own UI (e.g. clicking Connect / buttons
      // in the side panel) — otherwise a leftover page selection would spawn a
      // new create panel on every click.
      const host = document.getElementById("verity-root");
      if (host && e.target && host.contains(e.target as Node)) return;
      const q = qualify();
      if (!q) return;
      if (panelId) openCreate(q.text); // panel open → go straight to create view
      else setSel(q); // no panel → show the floating button
    };
    document.addEventListener("selectionchange", onChange);
    document.addEventListener("mouseup", onFinalize);
    document.addEventListener("keyup", onFinalize);
    return () => {
      document.removeEventListener("selectionchange", onChange);
      document.removeEventListener("mouseup", onFinalize);
      document.removeEventListener("keyup", onFinalize);
    };
  }, [panelId]);

  function openCreate(text: string) {
    if (!text) return;
    const id = `sel-${Date.now()}`;
    records.set(id, {
      sentenceId: id,
      text,
      status: "eligible",
      el: document.body,
      start: 0,
      end: 0,
    });
    pendingText.current = null;
    setSel(null);
    // Leave the user's selection highlighted on the page for context — don't
    // clear it (clearing was jarring and lost the visual reference).
    setPanelId(id);
  }

  const stats = useMemo(() => {
    let mapped = 0;
    let firstId: string | null = null;
    for (const [id, r] of records) {
      if (r.status === "mapped" || r.status === "low-liquidity" || r.status === "diverged") {
        mapped++;
        if (!firstId) firstId = id;
      }
    }
    return { mapped, firstId };
    // recompute when panel toggles or page becomes ready
  }, [panelId, hoverId, toast]);

  const hoverRec = hoverId ? records.get(hoverId) : null;
  const hoverRect = hoverId ? markRect(hoverId) : null;

  return (
    <>
      <Launcher
        count={stats.mapped}
        active={!!panelId}
        onClick={() => {
          if (panelId) setPanelId(null);
          else if (stats.firstId) setPanelId(stats.firstId);
          else
            document.dispatchEvent(
              new CustomEvent("verity:toast", {
                detail: { msg: "No claims here yet — select any sentence to create one." },
              }),
            );
        }}
      />

      {hoverRec && hoverRect && (
        <HoverCard rec={hoverRec} rect={hoverRect} panelOpen={!!panelId} />
      )}

      {sel && !panelId && (
        <button
          onMouseDown={(e) => {
            e.preventDefault(); /* keep the selection alive */
            pendingText.current = sel.text;
          }}
          onClick={() => openCreate(pendingText.current ?? sel?.text ?? "")}
          style={{
            position: "fixed",
            top: Math.max(8, sel.rect.top - 42),
            left: Math.min(sel.rect.left, window.innerWidth - 170),
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 12px",
            borderRadius: 999,
            border: "none",
            background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.brandInk})`,
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: tokens.shadow,
            cursor: "pointer",
            zIndex: tokens.z,
          }}
        >
          + Create claim
        </button>
      )}

      {panelId && (
        <SidePanel key={panelId} sentenceId={panelId} onClose={() => setPanelId(null)} />
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 76,
            right: panelId ? 396 : 20,
            background: tokens.ink,
            color: "#fff",
            fontSize: 13,
            padding: "8px 14px",
            borderRadius: 8,
            boxShadow: tokens.shadow,
            zIndex: tokens.z,
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
