import type { TypedDataSigner } from "../api/contract";
import type { WalletState } from "../shared/types";
import { env } from "../shared/env";
import { bgFetch } from "../api/bgFetch";
import { providerRequest } from "./bridge";

/**
 * Wallet abstraction.
 *
 * All writes go through the Verisphere relay as EIP-712 meta-transactions
 * (see protocol/src/hooks/useMetaTx.ts), so the wallet never sends a gas
 * transaction — it only needs the address, balance, and typed-data signing.
 *
 * Implementation: an injected EIP-1193 wallet (MetaMask/Rabby) reached through
 * the MAIN-world bridge (src/inpage + wallet/bridge). Works only in the page
 * context (i.e. the side panel), not the popup, since the injected provider
 * lives on the page.
 */
export interface Wallet extends TypedDataSigner {
  getState(): WalletState;
  connect(): Promise<WalletState>;
  disconnect(): Promise<void>;
  subscribe(cb: (s: WalletState) => void): () => void;
}

class InjectedWallet implements Wallet {
  private state: WalletState = { connected: false, address: null, balance: null };
  private subs = new Set<(s: WalletState) => void>();

  getState() {
    return this.state;
  }

  async connect(): Promise<WalletState> {
    const accounts = await providerRequest<string[]>("eth_requestAccounts");
    const address = accounts?.[0] ?? null;
    if (!address) throw new Error("No account returned by the wallet.");
    this.state = { connected: true, address, balance: null };
    this.emit();
    void this.refreshBalance(address);
    return this.state;
  }

  async disconnect(): Promise<void> {
    // Injected wallets have no programmatic disconnect; drop our local session.
    this.state = { connected: false, address: null, balance: null };
    this.emit();
  }

  /**
   * Sign EIP-712 typed data via eth_signTypedData_v4. `typedData` must be a full
   * typed-data object ({domain, types, primaryType, message}); used by the relay
   * write flow (create/stake) once wired.
   */
  async signTypedData(typedData: unknown): Promise<string> {
    if (!this.state.address) throw new Error("Wallet not connected");
    return providerRequest<string>("eth_signTypedData_v4", [
      this.state.address,
      JSON.stringify(typedData),
    ]);
  }

  subscribe(cb: (s: WalletState) => void) {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  }

  private emit() {
    for (const cb of this.subs) cb(this.state);
  }

  private async refreshBalance(address: string) {
    try {
      const res = await bgFetch<{ balance?: string }>(`${env.appApiBase}/token/balance?address=${address}`);
      if (res.json?.balance != null) {
        this.state = { ...this.state, balance: Number(BigInt(res.json.balance)) / 1e18 };
        this.emit();
      }
    } catch {
      /* balance is best-effort */
    }
  }
}

export const wallet: Wallet = new InjectedWallet();
