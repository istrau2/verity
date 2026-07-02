import type { VerityAPI } from "./contract";
import { mockApi } from "./mock";

/**
 * Adapter selection for claim/staking DATA (not validation).
 *
 * Today we ship the mock so the FE is demoable standalone. When the app
 * endpoints are wired, add `http.ts` implementing VerityAPI against
 * `env.appApiBase` and switch here.
 *
 * Validation checks are NOT part of this adapter — see `api/checks.ts`
 * (moderation + dedup via app, atomicity via verity-api) and
 * `shared/claimChecks.ts` (local).
 */
export const api: VerityAPI = mockApi;

export type { VerityAPI };
