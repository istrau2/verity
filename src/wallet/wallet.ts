import type { TypedDataSigner } from "../api/contract";
import type { WalletState } from "../shared/types";

/**
 * Wallet abstraction.
 *
 * Because ALL writes go through the Verisphere relay as EIP-712
 * meta-transactions (see protocol/src/hooks/useMetaTx.ts), the extension never
 * needs to send a gas transaction — it only needs to (a) know the address and
 * balance and (b) sign typed data. That makes the wallet a tiny interface,
 * which is exactly what we want inside a content script.
 *
 * The real implementation will be a WalletConnect v2 signer (works from an
 * extension context without an injected provider). For now a mock signer lets
 * the full loop run end-to-end.
 */
export interface Wallet extends TypedDataSigner {
  getState(): WalletState;
  connect(): Promise<WalletState>;
  disconnect(): Promise<void>;
  subscribe(cb: (s: WalletState) => void): () => void;
}

class MockWallet implements Wallet {
  private state: WalletState = { connected: false, address: null, balance: null };
  private subs = new Set<(s: WalletState) => void>();

  getState() {
    return this.state;
  }

  async connect() {
    this.state = {
      connected: true,
      address: "0xF00Dbabe0000000000000000000000000000CAFE",
      balance: 250,
    };
    this.emit();
    return this.state;
  }

  async disconnect() {
    this.state = { connected: false, address: null, balance: null };
    this.emit();
  }

  async signTypedData(_payload: unknown): Promise<string> {
    if (!this.state.connected) throw new Error("Wallet not connected");
    // Simulate the wallet prompt + user approval latency.
    await new Promise((r) => setTimeout(r, 500));
    return "0xmocksignature";
  }

  subscribe(cb: (s: WalletState) => void) {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  }

  private emit() {
    for (const cb of this.subs) cb(this.state);
  }
}

export const wallet: Wallet = new MockWallet();
