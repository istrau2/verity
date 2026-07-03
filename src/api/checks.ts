import { env } from "../shared/env";
import type { Claim } from "../shared/types";
import { bgFetch } from "./bgFetch";

/**
 * Remote validation checks, split by source per the design:
 *   - atomicity/decomposition → verity-api (LLM)         [chain-independent]
 *   - moderation              → app  /api/moderate       [existing]
 *   - duplicate/near-duplicate → app /api/claims/check-* [existing]
 *
 * All requests go through the background service worker (bgFetch) so they
 * bypass page CORS/preflight. Every call fails *soft*: on error it returns
 * `{ ok: false }` so the validator shows "couldn't verify" rather than
 * blocking. No regex fallback for atomicity.
 */

const JSON_HEADERS = { "Content-Type": "application/json" };

export interface AtomicityResult {
  atomic: boolean;
  subClaims: string[];
  wellFormed?: boolean;
  verifiable?: boolean;
  reason?: string;
}

export async function checkAtomicity(
  text: string,
): Promise<{ ok: true; result: AtomicityResult } | { ok: false; error: string }> {
  const res = await bgFetch<AtomicityResult>(`${env.verityApiUrl}/atomicity`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ text }),
  });
  if (!res.ok || !res.json) return { ok: false, error: res.error ?? `verity-api ${res.status}` };
  return { ok: true, result: res.json };
}

export async function moderateClaim(
  text: string,
): Promise<{ ok: true; allowed: boolean; reason?: string } | { ok: false; error: string }> {
  const res = await bgFetch<{ allowed?: boolean; reason?: string }>(`${env.appApiBase}/moderate`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ text }),
  });
  if (!res.ok || !res.json) return { ok: false, error: res.error ?? `app ${res.status}` };
  const allowed = res.json.allowed !== false;
  // The app fails CLOSED when the moderation LLM is down (allowed=false +
  // "unavailable" reason). Treat that as a soft "couldn't verify" (warn), not a
  // hard block — the relay still fail-closes server-side on submit.
  if (!allowed && /unavailable/i.test(res.json.reason ?? "")) {
    return { ok: false, error: "Moderation temporarily unavailable" };
  }
  return { ok: true, allowed, reason: res.json.reason };
}

export interface DedupResult {
  duplicateOf?: Claim;
  similar: { claim: Claim; similarity: number }[];
}

export async function findDuplicates(
  text: string,
): Promise<{ ok: true; result: DedupResult } | { ok: false; error: string }> {
  const base = env.appApiBase;
  const q = encodeURIComponent(text);

  const exact = await bgFetch<{ exists?: boolean; post_id?: number | null }>(
    `${base}/claims/check-onchain?text=${q}`,
  );
  const sim = await bgFetch<{ matches?: { post_id: number; text: string; similarity: number }[] }>(
    `${base}/claims/check-similar?text=${q}`,
  );

  // If both round-trips failed at the transport level, report soft failure.
  if (!exact.ok && !sim.ok) return { ok: false, error: exact.error ?? sim.error ?? "dedup unavailable" };

  let duplicateOf: Claim | undefined;
  if (exact.json?.exists && exact.json.post_id != null) {
    duplicateOf = minimalClaim(exact.json.post_id, text);
  }

  const matches = sim.json?.matches ?? [];
  if (!duplicateOf && matches[0] && matches[0].similarity >= 0.95) {
    duplicateOf = minimalClaim(matches[0].post_id, matches[0].text);
  }

  const similar = matches
    .filter((m) => !duplicateOf || m.post_id !== duplicateOf.postId)
    .slice(0, 3)
    .map((m) => ({ claim: minimalClaim(m.post_id, m.text), similarity: m.similarity }));

  return { ok: true, result: { duplicateOf, similar } };
}

/** A placeholder Claim from dedup data; full stats load when the panel opens it. */
function minimalClaim(postId: number, text: string): Claim {
  return {
    postId,
    text,
    evs: 0,
    baseVs: 0,
    supportStake: 0,
    challengeStake: 0,
    totalStake: 0,
    active: true,
    incomingCount: 0,
    outgoingCount: 0,
  };
}
