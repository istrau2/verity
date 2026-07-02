import type {
  Claim,
  Edge,
  ResolveRequest,
  ResolveResponse,
  UserStake,
} from "../shared/types";

/**
 * VerityAPI — the contract for the Verisphere `app` backend (claim data, staking
 * relay). Most methods map onto endpoints that already exist in the app README
 * (`/api/claims/*`, `/relay`, `/token/balance`); `resolveSentences` is the one
 * genuinely new endpoint Verity needs (batch Wikipedia sentence → claim).
 *
 * NOTE: claim *validation* checks do not live here — they are split by source
 * (local heuristics, app moderation/dedup, and the verity-api atomicity service)
 * and orchestrated in `api/checks.ts` + `shared/claimChecks.ts`.
 */
export interface VerityAPI {
  /** Batch-resolve a page's sentences to claims (semantic dedup on the server). */
  resolveSentences(req: ResolveRequest): Promise<ResolveResponse>;

  /** Full claim detail for the side panel. */
  getClaim(postId: number): Promise<Claim>;

  /** Incoming + outgoing evidence edges for a claim. */
  getEdges(postId: number): Promise<{ incoming: Edge[]; outgoing: Edge[] }>;

  /** The connected user's live position on a claim. */
  getUserStake(postId: number, address: string): Promise<UserStake>;

  /**
   * Stake to a target net position (VSP). Positive = support, negative =
   * challenge, 0 = withdraw. Mirrors StakeEngine.setStake via the relay.
   */
  setStake(
    postId: number,
    targetVsp: number,
    signer: TypedDataSigner,
    address: string,
  ): Promise<Claim>;

  /**
   * Create a claim. The caller is expected to have already validated it (see
   * checks). Returns an existing claim with deduped=true if one matches.
   */
  createClaim(
    text: string,
    signer: TypedDataSigner,
    address: string,
  ): Promise<{ claim: Claim; deduped: boolean }>;
}

/** Minimal EIP-712 signer the API needs — implemented by the wallet layer. */
export interface TypedDataSigner {
  signTypedData(payload: unknown): Promise<string>;
}
