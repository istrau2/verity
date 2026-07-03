import type { VerityAPI, TypedDataSigner } from "./contract";
import type { Claim, Edge, ResolveRequest, ResolveResponse, SentenceMatch, UserStake } from "../shared/types";
import { env } from "../shared/env";
import { bgFetch } from "./bgFetch";
import { mockApi } from "./mock";

/**
 * Real backend adapter. READS hit the Verisphere `app` (via the background
 * worker, so CORS/preflight is bypassed). WRITES (setStake/createClaim) are
 * temporarily delegated to the mock until the WalletConnect signer + relay flow
 * land — see TODO.md §1.
 */

const base = env.appApiBase;

/** Map the app's snake_case claim summary → the extension's Claim. */
function toClaim(j: any): Claim {
  return {
    postId: j.post_id,
    text: j.text ?? "",
    evs: j.verity_score ?? 0,
    baseVs: j.base_vs ?? 0,
    supportStake: j.stake_support ?? 0,
    challengeStake: j.stake_challenge ?? 0,
    totalStake: j.total_stake ?? 0,
    active: j.is_active ?? false,
    incomingCount: j.incoming_count ?? 0,
    outgoingCount: j.outgoing_count ?? 0,
  };
}

export const httpApi: VerityAPI = {
  async resolveSentences(req: ResolveRequest): Promise<ResolveResponse> {
    const res = await bgFetch<{ matches: any[] }>(`${base}/claims/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok || !res.json) return { matches: [] }; // graceful: no underlines
    const matches: SentenceMatch[] = res.json.matches.map((m) => ({
      sentenceId: m.sentence_id,
      text: m.text,
      status: m.status,
      matchScore: m.match_score,
      claim: m.claim ? toClaim(m.claim) : undefined,
    }));
    return { matches };
  },

  async getClaim(postId: number): Promise<Claim> {
    const res = await bgFetch<any>(`${base}/claims/${postId}/summary`);
    if (!res.ok || !res.json) throw new Error(res.error ?? `getClaim ${res.status}`);
    return toClaim(res.json);
  },

  async getEdges(postId: number): Promise<{ incoming: Edge[]; outgoing: Edge[] }> {
    const res = await bgFetch<{ incoming: any[]; outgoing: any[] }>(`${base}/claims/${postId}/edges`);
    if (!res.ok || !res.json) return { incoming: [], outgoing: [] };
    const map = (e: any): Edge => ({
      linkPostId: e.link_post_id,
      otherPostId: e.claim_post_id,
      otherText: e.claim_text ?? "",
      isChallenge: !!e.is_challenge,
      contribution: e.edge_contribution ?? 0,
    });
    return { incoming: res.json.incoming.map(map), outgoing: res.json.outgoing.map(map) };
  },

  async getUserStake(postId: number, address: string): Promise<UserStake> {
    const res = await bgFetch<{ user_support?: number; user_challenge?: number }>(
      `${base}/claims/${postId}/user-stake?user=${address}`,
    );
    return {
      postId,
      userSupport: res.json?.user_support ?? 0,
      userChallenge: res.json?.user_challenge ?? 0,
    };
  },

  // Writes need EIP-712 signing via a real wallet + the relay flow (TODO.md §1).
  // Delegated to the mock for now so the create/stake UX still demos.
  setStake(postId: number, targetVsp: number, signer: TypedDataSigner, address: string) {
    return mockApi.setStake(postId, targetVsp, signer, address);
  },
  createClaim(text: string, signer: TypedDataSigner, address: string) {
    return mockApi.createClaim(text, signer, address);
  },
};
