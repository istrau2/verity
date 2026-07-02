const store = /* @__PURE__ */ new Map();
const userStakes = /* @__PURE__ */ new Map();
let nextId = 1e3;
function makeClaim(text, evs, active = true) {
  const support = active ? Math.round(20 + Math.abs(evs)) : 0.4;
  const challenge = active ? Math.round(20 + Math.max(0, -evs)) : 0.2;
  const claim = {
    postId: nextId++,
    text,
    evs,
    baseVs: evs,
    supportStake: support,
    challengeStake: challenge,
    totalStake: support + challenge,
    active,
    incomingCount: Math.floor(Math.random() * 4),
    outgoingCount: Math.floor(Math.random() * 3)
  };
  store.set(claim.postId, claim);
  return claim;
}
const RULES = [
  { re: /\b(founded|established|born|died|located)\b/i, evs: 78 },
  { re: /\b(largest|smallest|first|oldest|highest)\b/i, evs: 41 },
  { re: /\b(believed|reportedly|alleged|controversial|disputed)\b/i, evs: -34 },
  { re: /\b(estimated|approximately|about)\b/i, evs: 12, active: false }
];
function delay(v, ms = 180) {
  return new Promise((r) => setTimeout(() => r(v), ms));
}
export const mockApi = {
  async resolveSentences(req) {
    const matches = req.sentences.map((s) => {
      const rule = RULES.find((r) => r.re.test(s.text));
      if (rule) {
        const active = rule.active !== false;
        const claim = makeClaim(s.text, rule.evs, active);
        return {
          sentenceId: s.sentenceId,
          text: s.text,
          status: active ? "mapped" : "low-liquidity",
          claim,
          matchScore: 0.92,
          flagged: s.flagged
        };
      }
      if (s.flagged) {
        return { sentenceId: s.sentenceId, text: s.text, status: "eligible", flagged: true };
      }
      const eligible = hash(s.sentenceId) % 6 === 0 && s.text.length > 60;
      return {
        sentenceId: s.sentenceId,
        text: s.text,
        status: eligible ? "eligible" : "none"
      };
    });
    return delay({ matches });
  },
  async getClaim(postId) {
    const c = store.get(postId);
    if (!c) throw new Error("claim not found");
    return delay(c);
  },
  async getEdges(postId) {
    const c = store.get(postId);
    const incoming = c && c.incomingCount > 0 ? [{ linkPostId: postId + 1, otherPostId: postId + 2, otherText: "Supporting source claim", isChallenge: false, contribution: 14 }] : [];
    const outgoing = [];
    return delay({ incoming, outgoing });
  },
  async getUserStake(postId, address) {
    return delay(
      userStakes.get(`${address}:${postId}`) ?? {
        postId,
        userSupport: 0,
        userChallenge: 0
      }
    );
  },
  async setStake(postId, targetVsp, signer, address) {
    await signer.signTypedData({ kind: "ForwardRequest", postId, targetVsp });
    const c = store.get(postId);
    if (!c) throw new Error("claim not found");
    userStakes.set(`${address}:${postId}`, {
      postId,
      userSupport: targetVsp > 0 ? targetVsp : 0,
      userChallenge: targetVsp < 0 ? -targetVsp : 0
    });
    if (targetVsp > 0) c.supportStake += targetVsp;
    else if (targetVsp < 0) c.challengeStake += -targetVsp;
    c.totalStake = c.supportStake + c.challengeStake;
    c.evs = c.totalStake ? Math.round((c.supportStake - c.challengeStake) / c.totalStake * 100) : 0;
    c.active = c.totalStake >= 1;
    return delay(c, 400);
  },
  async createClaim(text, signer, _address) {
    await signer.signTypedData({ kind: "ForwardRequest", op: "createClaim", text });
    const existing = [...store.values()].find(
      (c) => c.text.trim().toLowerCase() === text.trim().toLowerCase()
    );
    if (existing) return delay({ claim: existing, deduped: true }, 400);
    return delay({ claim: makeClaim(text, 0, false), deduped: false }, 400);
  }
};
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
  return Math.abs(h);
}
