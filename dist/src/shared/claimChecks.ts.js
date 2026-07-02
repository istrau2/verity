import nlp from "/vendor/.vite-deps-compromise.js__v--88ec8699.js";
import { isDangling, isQuestion, looksGibberish, normalizeClaim, words } from "/src/shared/claimHeuristics.ts.js";
const SUBJECTIVE_WORDS = /\b(best|worst|beautiful|ugly|delicious|tasty|amazing|awesome|terrible|horrible|overrated|underrated|should|ought|must|greatest|nicest|coolest|boring|fun|prefer|favou?rite|stunning|gorgeous)\b/i;
const ok = () => ({ pass: true, severity: "ok" });
const warn = (message) => ({ pass: true, severity: "warn", message });
const err = (message) => ({ pass: false, severity: "error", message });
export function runLocalChecks(text) {
  const canonicalText = normalizeClaim(text);
  const doc = nlp(canonicalText);
  const wordCount = words(canonicalText).length;
  let wellFormed;
  if (looksGibberish(canonicalText)) {
    wellFormed = err("Doesn't read as a coherent statement.");
  } else if (wordCount < 3) {
    wellFormed = err("Too short to be a complete claim.");
  } else if (isDangling(canonicalText)) {
    wellFormed = err('Looks incomplete — it trails off (e.g. "The sky is …").');
  } else if (doc.verbs().out("array").length === 0) {
    wellFormed = err("Doesn't look like a complete sentence (no verb).");
  } else {
    wellFormed = ok();
  }
  let verifiable;
  if (isQuestion(canonicalText)) {
    verifiable = err("Claims must be statements, not questions.");
  } else if (isSubjective(doc, canonicalText)) {
    verifiable = warn("May be subjective/opinion rather than objectively checkable.");
  } else {
    verifiable = ok();
  }
  return { wellFormed, verifiable, canonicalText };
}
function isSubjective(doc, text) {
  if (SUBJECTIVE_WORDS.test(text)) return true;
  return doc.has("#Superlative") || doc.has("#Comparative");
}
