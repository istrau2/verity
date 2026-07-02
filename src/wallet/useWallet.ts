import { useSyncExternalStore } from "react";
import { wallet } from "./wallet";

/** React binding for the wallet singleton. */
export function useWallet() {
  const state = useSyncExternalStore(
    (cb) => wallet.subscribe(cb),
    () => wallet.getState(),
  );
  return {
    ...state,
    connect: () => wallet.connect(),
    disconnect: () => wallet.disconnect(),
    signer: wallet,
  };
}
