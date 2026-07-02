import nlp from "compromise";
import type { CheckResult } from "./types";
import { isDangling, isQuestion, looksGibberish, normalizeClaim, words } from "./claimHeuristics";

/**
 * Local, instant checks (no network, no model download beyond compromise's
 * ~200KB). Covers the cheap linguistic judgments:
 *   - well-formed: not gibberish, complete sentence (has a verb), doesn't trail off
 *   - verifiable: a statement (not a question), and not obviously subjective
 * Atomicity is intentionally excluded — that's the LLM's job.
 */

const SUBJECTIVE_WORDS =
  /\b(best|worst|beautiful|ugly|delicious|tasty|amazing|awesome|terrible|horrible|overrated|underrated|should|ought|must|greatest|nicest|coolest|boring|fun|prefer|favou?rite|stunning|gorgeous)\b/i;

export interface LocalChecks {
  wellFormed: CheckResult;
  verifiable: CheckResult;
  canonicalText: string;
}

const ok = (): CheckResult => ({ pass: true, severity: "ok" });
const warn = (message: string): CheckResult => ({ pass: true, severity: "warn", message });
const err = (message: string): CheckResult => ({ pass: false, severity: "error", message });

export function runLocalChecks(text: string): LocalChecks {
  const canonicalText = normalizeClaim(text);
  const doc = nlp(canonicalText);
  const wordCount = words(canonicalText).length;

  let wellFormed: CheckResult;
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

  let verifiable: CheckResult;
  if (isQuestion(canonicalText)) {
    verifiable = err("Claims must be statements, not questions.");
  } else if (isSubjective(doc, canonicalText)) {
    verifiable = warn("May be subjective/opinion rather than objectively checkable.");
  } else {
    verifiable = ok();
  }

  return { wellFormed, verifiable, canonicalText };
}

/** Keyword + POS: superlatives/comparatives and obligation modals signal opinion. */
function isSubjective(doc: ReturnType<typeof nlp>, text: string): boolean {
  if (SUBJECTIVE_WORDS.test(text)) return true;
  return doc.has("#Superlative") || doc.has("#Comparative");
}
