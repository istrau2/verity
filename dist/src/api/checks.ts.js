import { env } from "/src/shared/env.ts.js";
import { bgFetch } from "/src/api/bgFetch.ts.js";
const JSON_HEADERS = { "Content-Type": "application/json" };
export async function checkAtomicity(text) {
  const res = await bgFetch(`${env.verityApiUrl}/atomicity`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ text })
  });
  if (!res.ok || !res.json) return { ok: false, error: res.error ?? `verity-api ${res.status}` };
  return { ok: true, result: res.json };
}
export async function moderateClaim(text) {
  const res = await bgFetch(`${env.appApiBase}/moderate`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ text })
  });
  if (!res.ok || !res.json) return { ok: false, error: res.error ?? `app ${res.status}` };
  return { ok: true, allowed: res.json.allowed !== false, reason: res.json.reason };
}
export async function findDuplicates(text) {
  const base = env.appApiBase;
  const q = encodeURIComponent(text);
  const exact = await bgFetch(
    `${base}/claims/check-onchain?text=${q}`
  );
  const sim = await bgFetch(
    `${base}/claims/check-similar?text=${q}`
  );
  if (!exact.ok && !sim.ok) return { ok: false, error: exact.error ?? sim.error ?? "dedup unavailable" };
  let duplicateOf;
  if (exact.json?.exists && exact.json.post_id != null) {
    duplicateOf = minimalClaim(exact.json.post_id, text);
  }
  const matches = sim.json?.matches ?? [];
  if (!duplicateOf && matches[0] && matches[0].similarity >= 0.95) {
    duplicateOf = minimalClaim(matches[0].post_id, matches[0].text);
  }
  const similar = matches.filter((m) => !duplicateOf || m.post_id !== duplicateOf.postId).slice(0, 3).map((m) => ({ claim: minimalClaim(m.post_id, m.text), similarity: m.similarity }));
  return { ok: true, result: { duplicateOf, similar } };
}
function minimalClaim(postId, text) {
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
    outgoingCount: 0
  };
}
