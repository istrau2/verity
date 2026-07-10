import { useSyncExternalStore } from "react";

/**
 * A tiny channel for surfacing on-chain write progress to the UI. The write
 * layer (direct/relay) publishes coarse stages; components render them on their
 * action button so a multi-step submit reads as a sequence rather than a single
 * frozen "Creating…".
 */
export type WriteStage =
  | "approving" // sending/confirming a one-time VSP allowance approval
  | "awaiting-wallet" // waiting for the user to sign/confirm in their wallet
  | "confirming" // waiting for the transaction to be mined
  | "submitting" // relay: posting the signed meta-transaction
  | null;

let stage: WriteStage = null;
const subs = new Set<() => void>();

export function setWriteStage(s: WriteStage) {
  stage = s;
  subs.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}

export function useWriteStage(): WriteStage {
  return useSyncExternalStore(subscribe, () => stage);
}

export function writeStageLabel(s: WriteStage): string | null {
  switch (s) {
    case "approving":
      return "Approving VSP…";
    case "awaiting-wallet":
      return "Confirm in wallet…";
    case "confirming":
      return "Confirming…";
    case "submitting":
      return "Submitting…";
    default:
      return null;
  }
}
