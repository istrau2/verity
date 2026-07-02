class MockWallet {
  state = { connected: false, address: null, balance: null };
  subs = /* @__PURE__ */ new Set();
  getState() {
    return this.state;
  }
  async connect() {
    this.state = {
      connected: true,
      address: "0xF00Dbabe0000000000000000000000000000CAFE",
      balance: 250
    };
    this.emit();
    return this.state;
  }
  async disconnect() {
    this.state = { connected: false, address: null, balance: null };
    this.emit();
  }
  async signTypedData(_payload) {
    if (!this.state.connected) throw new Error("Wallet not connected");
    await new Promise((r) => setTimeout(r, 500));
    return "0xmocksignature";
  }
  subscribe(cb) {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  }
  emit() {
    for (const cb of this.subs) cb(this.state);
  }
}
export const wallet = new MockWallet();
