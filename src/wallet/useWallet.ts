import { useSyncExternalStore } from "react";
import { wallet, writeMode } from "./wallet";

/** React binding for the wallet singleton. */
export function useWallet() {
  const state = useSyncExternalStore(
    (cb) => wallet.subscribe(cb),
    () => wallet.getState(),
  );
  return {
    ...state,
    mode: writeMode(state),
    connect: () => wallet.connect(),
    disconnect: () => wallet.disconnect(),
    signer: wallet,
  };
}
