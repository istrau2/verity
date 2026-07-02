/**
 * Shared types for Verity. These mirror the shapes the Verisphere `app`
 * backend already returns (see app README: /api/claims/*), plus a few
 * Verity-specific shapes for the Wikipedia sentence→claim mapping.
 *
 * Since we are building the FE first and the backend "backwards", these types
 * ARE the contract the backend must satisfy.
 */

/** A factual claim as tracked on-chain + indexed by the backend. */
export interface Claim {
  postId: number;
  text: string;
  /** Effective Verity Score on a [-100,+100] scale. */
  evs: number;
  /** Base (local) Verity Score on a [-100,+100] scale. */
  baseVs: number;
  supportStake: number;
  challengeStake: number;
  totalStake: number;
  /** True once total stake clears the activity threshold (posting fee). */
  active: boolean;
  incomingCount: number;
  outgoingCount: number;
}

/** The signed-in user's current position on a claim (human VSP units). */
export interface UserStake {
  postId: number;
  userSupport: number;
  userChallenge: number;
}

/** One evidence edge in/out of a claim. */
export interface Edge {
  linkPostId: number;
  otherPostId: number;
  otherText: string;
  isChallenge: boolean;
  /** Signed contribution to the target's effective VS, [-100,+100]. */
  contribution: number;
}

/**
 * The result of resolving a single Wikipedia sentence against the claim graph.
 * `status` drives the in-page rendering (see ClaimMark states in the design).
 */
export type SentenceStatus =
  | "mapped" // an active claim exists for this sentence
  | "low-liquidity" // a claim exists but is below the activity threshold
  | "diverged" // the sentence text changed since the claim was staked
  | "eligible" // no claim yet, but this is a good candidate (e.g. [citation needed])
  | "none"; // nothing to show

export interface SentenceMatch {
  /** Stable id for this sentence occurrence on the page (paragraph#+index). */
  sentenceId: string;
  text: string;
  status: SentenceStatus;
  claim?: Claim;
  /** Confidence of the sentence→claim match (0..1), from semantic dedup. */
  matchScore?: number;
  /** True if the source paragraph carried a [citation needed]/disputed tag. */
  flagged?: boolean;
}

/** Payload sent to resolve a page's sentences in one batch. */
export interface ResolveRequest {
  url: string;
  title: string;
  sentences: { sentenceId: string; text: string; flagged?: boolean }[];
}

export interface ResolveResponse {
  matches: SentenceMatch[];
}

/** Wallet connection state exposed to the UI. */
export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number | null; // VSP, human units
}

// ── Claim validation (the create-flow gate) ─────────────────────────────

export type CheckSeverity = "ok" | "warn" | "error";

export interface CheckResult {
  pass: boolean;
  severity: CheckSeverity;
  message?: string;
}

export interface ValidationIssue {
  severity: CheckSeverity;
  message: string;
}

/**
 * The overall verdict for a proposed claim:
 *  - ok        → clean; submit enabled
 *  - review    → soft issues (compound / subjective / near-duplicate); overridable
 *  - revise    → hard errors (gibberish / incomplete / not-an-assertion); blocked
 *  - duplicate → an equivalent claim exists; redirect to staking it
 */
export type ClaimVerdict = "ok" | "review" | "revise" | "duplicate";

export interface ClaimValidation {
  verdict: ClaimVerdict;
  /** Normalized/cleaned text that would actually be submitted. */
  canonicalText: string;
  checks: {
    moderation: CheckResult;
    wellFormed: CheckResult;
    verifiable: CheckResult;
    atomic: CheckResult;
  };
  issues: ValidationIssue[];
  /** If compound, the suggested atomic sub-claims. */
  decomposition?: string[];
  /** Exact/high-confidence existing match — stake on it instead of forking. */
  duplicateOf?: Claim;
  /** Near-duplicates the user should consider before creating a new claim. */
  similar?: { claim: Claim; similarity: number }[];
}
