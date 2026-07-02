import __vite__cjsImport0_react from "/vendor/.vite-deps-react.js__v--88ec8699.js"; const useSyncExternalStore = __vite__cjsImport0_react["useSyncExternalStore"];
import { wallet } from "/src/wallet/wallet.ts.js";
export function useWallet() {
  const state = useSyncExternalStore(
    (cb) => wallet.subscribe(cb),
    () => wallet.getState()
  );
  return {
    ...state,
    connect: () => wallet.connect(),
    disconnect: () => wallet.disconnect(),
    signer: wallet
  };
}
