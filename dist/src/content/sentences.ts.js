const MAX_SENTENCES = 140;
const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z0-9"“(])/;
export function extractSentences() {
  const paras = pickParagraphs();
  if (paras.length === 0) {
    console.warn("[Verity] extractor found no <p> elements to scan");
    return [];
  }
  const out = [];
  let pIndex = 0;
  for (const p of paras) {
    if (out.length >= MAX_SENTENCES) break;
    const text = p.textContent ?? "";
    if (text.trim().length < 30) {
      pIndex++;
      continue;
    }
    const flaggedPara = /\[(citation needed|disputed|dubious)\b/i.test(text);
    let cursor = 0;
    const parts = text.split(SENTENCE_SPLIT);
    let sIndex = 0;
    for (const raw of parts) {
      const start = text.indexOf(raw, cursor);
      if (start < 0) continue;
      const end = start + raw.length;
      cursor = end;
      const clean = raw.trim();
      if (clean.length < 25) {
        sIndex++;
        continue;
      }
      out.push({
        sentenceId: `p${pIndex}s${sIndex}`,
        text: stripRefs(clean),
        flagged: flaggedPara,
        el: p,
        start,
        end
      });
      sIndex++;
      if (out.length >= MAX_SENTENCES) break;
    }
    pIndex++;
  }
  return out;
}
function pickParagraphs() {
  const selectors = [
    "#mw-content-text .mw-parser-output p",
    ".mw-parser-output p",
    "#mw-content-text p",
    "#bodyContent p",
    "main p",
    "p"
  ];
  let best = [];
  const counts = {};
  for (const sel of selectors) {
    const found = Array.from(document.querySelectorAll(sel));
    counts[sel] = found.length;
    if (found.length > best.length) best = found;
    if (best.length > 0 && sel !== "p") break;
  }
  console.log("[Verity] paragraph selectors:", counts);
  return best;
}
function stripRefs(s) {
  return s.replace(/\[[^\]]*\]/g, "").replace(/\s{2,}/g, " ").trim();
}
