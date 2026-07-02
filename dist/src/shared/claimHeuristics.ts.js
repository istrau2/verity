const DANGLING = /* @__PURE__ */ new Set([
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "the",
  "a",
  "an",
  "of",
  "to",
  "and",
  "but",
  "or",
  "that",
  "which",
  "in",
  "on",
  "for",
  "with",
  "as",
  "by",
  "at",
  "from",
  "this",
  "these",
  "those",
  "its",
  "their",
  "his",
  "her"
]);
export function words(t) {
  return t.trim().split(/\s+/).filter(Boolean);
}
export function normalizeClaim(t) {
  let s = (t || "").replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
  if (s) s = s[0].toUpperCase() + s.slice(1);
  return s;
}
export function isQuestion(t) {
  return /\?\s*$/.test(t.trim());
}
export function looksGibberish(t) {
  const ws = words(t);
  if (ws.length === 0) return true;
  let wordy = 0;
  for (const w of ws) {
    const letters = w.replace(/[^a-zA-Z]/g, "");
    if (letters.length >= 2 && letters.length <= 18 && /[aeiou]/i.test(letters)) {
      wordy++;
    }
  }
  return wordy / ws.length < 0.5;
}
export function isDangling(t) {
  const ws = words(t);
  if (ws.length === 0) return true;
  const last = ws[ws.length - 1].toLowerCase().replace(/[^a-z]/g, "");
  return DANGLING.has(last);
}
