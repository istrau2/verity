import { evsToUnderline } from "/src/shared/vsColor.ts.js";
import { tokens } from "/src/shared/tokens.ts.js";
import { emit, records } from "/src/content/store.ts.js";
const MARK_ATTR = "data-vr-sentence";
export function injectMarkStyles() {
  if (document.getElementById("vr-mark-styles")) return;
  const style = document.createElement("style");
  style.id = "vr-mark-styles";
  style.textContent = `
    .vr-mark {
      cursor: pointer;
      border-bottom: 2px solid var(--vr-color, ${tokens.brand});
      background: linear-gradient(transparent 60%, var(--vr-tint, rgba(79,70,229,0.10)) 0);
      transition: background 0.12s ease;
    }
    .vr-mark:hover { background: var(--vr-tint, rgba(79,70,229,0.18)); }
    .vr-mark--low { border-bottom-style: dashed; opacity: 0.9; }
    .vr-mark--diverged { border-bottom-color: #d97706; border-bottom-style: dotted; }
    .vr-mark--eligible {
      border-bottom: 1px dashed ${tokens.faint};
      background: none;
    }
    .vr-mark--eligible:hover { background: rgba(79,70,229,0.10); }
    .vr-badge {
      font: 600 10px ${tokens.font};
      vertical-align: super;
      margin-left: 2px;
      padding: 0 4px;
      border-radius: 8px;
      color: #fff;
      background: var(--vr-color, ${tokens.brand});
      user-select: none;
    }
  `;
  document.head.appendChild(style);
}
export function paint(recs) {
  for (const rec of recs) {
    records.set(rec.sentenceId, rec);
    if (rec.status === "none") continue;
    try {
      wrapRange(rec);
    } catch {
    }
  }
  wireEvents();
}
function classFor(rec) {
  switch (rec.status) {
    case "low-liquidity":
      return "vr-mark vr-mark--low";
    case "diverged":
      return "vr-mark vr-mark--diverged";
    case "eligible":
      return "vr-mark vr-mark--eligible";
    default:
      return "vr-mark";
  }
}
function wrapRange(rec) {
  const color = rec.claim ? evsToUnderline(rec.claim.evs) : tokens.brand;
  const cls = classFor(rec);
  let offset = 0;
  const walker = document.createTreeWalker(rec.el, NodeFilter.SHOW_TEXT);
  const toWrap = [];
  let node = walker.nextNode();
  while (node) {
    const len = node.data.length;
    const nodeStart = offset;
    const nodeEnd = offset + len;
    const from = Math.max(rec.start, nodeStart);
    const to = Math.min(rec.end, nodeEnd);
    if (from < to) {
      toWrap.push({ node, from: from - nodeStart, to: to - nodeStart });
    }
    offset = nodeEnd;
    if (nodeStart >= rec.end) break;
    node = walker.nextNode();
  }
  for (const { node: node2, from, to } of toWrap) {
    let target = node2;
    if (from > 0) target = target.splitText(from);
    if (to - from < target.data.length) target.splitText(to - from);
    const span = document.createElement("span");
    span.className = cls;
    span.setAttribute(MARK_ATTR, rec.sentenceId);
    span.style.setProperty("--vr-color", color);
    target.replaceWith(span);
    span.appendChild(target);
  }
  const frags = rec.el.querySelectorAll(`[${MARK_ATTR}="${cssEscape(rec.sentenceId)}"]`);
  const last = frags[frags.length - 1];
  if (last && rec.claim && rec.status === "mapped") {
    const badge = document.createElement("span");
    badge.className = "vr-badge";
    badge.style.setProperty("--vr-color", color);
    badge.textContent = rec.claim.evs > 0 ? `+${Math.round(rec.claim.evs)}` : `${Math.round(rec.claim.evs)}`;
    last.appendChild(badge);
  }
}
let wired = false;
function wireEvents() {
  if (wired) return;
  wired = true;
  document.addEventListener("mouseover", (e) => {
    const mark = e.target?.closest?.(`[${MARK_ATTR}]`);
    if (mark) emit("hover", { sentenceId: mark.getAttribute(MARK_ATTR) });
  });
  document.addEventListener("mouseout", (e) => {
    const mark = e.target?.closest?.(`[${MARK_ATTR}]`);
    if (mark) emit("hoverEnd", {});
  });
  document.addEventListener("click", (e) => {
    const mark = e.target?.closest?.(`[${MARK_ATTR}]`);
    if (!mark) return;
    const id = mark.getAttribute(MARK_ATTR);
    const rec = records.get(id);
    if (!rec) return;
    e.preventDefault();
    if (rec.status === "eligible") emit("create", { sentenceId: id, text: rec.text });
    else emit("open", { sentenceId: id });
  });
}
export function markRect(sentenceId) {
  const el = document.querySelector(`[${MARK_ATTR}="${cssEscape(sentenceId)}"]`);
  return el ? el.getBoundingClientRect() : null;
}
function cssEscape(s) {
  return s.replace(/"/g, '\\"');
}
