/**
 * Pure, dependency-free string heuristics used by the local checks. These are
 * the cheap, instant judgments (gibberish / incomplete / question). Atomicity is
 * deliberately NOT here — that's an LLM judgment (see api/checks.ts).
 */

const DANGLING = new Set([
  "is", "are", "was", "were", "be", "been", "being",
  "the", "a", "an", "of", "to", "and", "but", "or", "that", "which",
  "in", "on", "for", "with", "as", "by", "at", "from", "this", "these",
  "those", "its", "their", "his", "her",
]);

export function words(t: string): string[] {
  return t.trim().split(/\s+/).filter(Boolean);
}

/** Trim, strip citation markers, collapse whitespace, sentence-case. */
export function normalizeClaim(t: string): string {
  let s = (t || "").replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
  if (s) s = s[0].toUpperCase() + s.slice(1);
  return s;
}

export function isQuestion(t: string): boolean {
  return /\?\s*$/.test(t.trim());
}

/** Too few real "words" (has a vowel, alphabetic, sane length) → gibberish. */
export function looksGibberish(t: string): boolean {
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

/** Trails off on a dangling connective/article (e.g. "The sky is"). */
export function isDangling(t: string): boolean {
  const ws = words(t);
  if (ws.length === 0) return true;
  const last = ws[ws.length - 1].toLowerCase().replace(/[^a-z]/g, "");
  return DANGLING.has(last);
}
