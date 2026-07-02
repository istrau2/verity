const TRAILERS = String.raw`(?:\[[^\]]*\]|["'”’)\]])*`;
const BACK_BOUNDARY = new RegExp(`[.!?]${TRAILERS}\\s+`, "g");
const FWD_BOUNDARY = new RegExp(`[.!?]${TRAILERS}(?=\\s|$)`, "g");
const MAX_EXPANDED = 800;
export function expandToSentences(sel) {
  if (!sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  let node = range.commonAncestorContainer;
  const el = node.nodeType === 3 ? node.parentElement : node;
  if (!el) return null;
  const block = el.closest?.(
    "p, li, dd, dt, td, th, blockquote, figcaption, h1, h2, h3, h4, h5, h6"
  ) ?? el;
  const full = block.textContent ?? "";
  if (!full) return null;
  const pre = document.createRange();
  pre.selectNodeContents(block);
  try {
    pre.setEnd(range.startContainer, range.startOffset);
  } catch {
    return null;
  }
  const startOffset = pre.toString().length;
  const endOffset = Math.min(startOffset + range.toString().length, full.length);
  let start = 0;
  const before = full.slice(0, startOffset);
  BACK_BOUNDARY.lastIndex = 0;
  let m;
  while ((m = BACK_BOUNDARY.exec(before)) !== null) {
    start = m.index + m[0].length;
  }
  let end = full.length;
  FWD_BOUNDARY.lastIndex = Math.max(0, endOffset - 1);
  const m2 = FWD_BOUNDARY.exec(full);
  if (m2) end = m2.index + m2[0].length;
  if (end - start > MAX_EXPANDED) return null;
  const text = full.slice(start, end).replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
  return text || null;
}
