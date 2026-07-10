import { wallet, writeMode } from "./wallet";
import { relayCreateClaim, relaySetStake } from "./relay";
import { directCreateClaim, directSetStake } from "./direct";
import { setWriteStage } from "./progress";

/**
 * Routes an on-chain write by wallet mode:
 *   direct    → user pays gas (has AVAX)
 *   relay     → gasless meta-tx (VSP only)
 *   needs-vsp → block with a buy-VSP message
 *
 * The `finally` always clears the write-progress stage so a failed/cancelled
 * write can't leave a stale status on the UI.
 */
export async function writeSetStake(postId: number, targetVsp: number): Promise<void> {
  try {
    switch (writeMode(wallet.getState())) {
      case "direct":
        return await directSetStake(postId, targetVsp);
      case "relay":
        return await relaySetStake(postId, targetVsp);
      case "needs-vsp":
        throw new Error("You need VSP to stake — buy VSP first.");
      default:
        throw new Error("Connect your wallet first.");
    }
  } finally {
    setWriteStage(null);
  }
}

export async function writeCreateClaim(text: string): Promise<{ postId: number | null; deduped: boolean }> {
  try {
    switch (writeMode(wallet.getState())) {
      case "direct":
        return await directCreateClaim(text);
      case "relay":
        return await relayCreateClaim(text);
      case "needs-vsp":
        throw new Error("You need VSP to create a claim — buy VSP first.");
      default:
        throw new Error("Connect your wallet first.");
    }
  } finally {
    setWriteStage(null);
  }
}
