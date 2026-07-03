/**
 * Runs in the page's MAIN world (where `window.ethereum` lives). Bridges
 * EIP-1193 requests from the Verity content script (ISOLATED world) to the
 * injected wallet via window.postMessage. Both worlds share `window`, so a
 * posted message is received on the other side.
 *
 * Protocol (all tagged `__verity: true`):
 *   req  { dir:"req", id, method, params }   content → page
 *   res  { dir:"res", id, result | error }   page → content
 */
type Provider = { request(a: { method: string; params?: unknown[] }): Promise<unknown> };
// Look up the provider at REQUEST time, not module load — at document_start the
// wallet may not have injected window.ethereum yet.
const getProvider = (): Provider | undefined =>
  (window as unknown as { ethereum?: Provider }).ethereum;

window.addEventListener("message", async (event: MessageEvent) => {
  if (event.source !== window) return;
  const d = event.data as { __verity?: boolean; dir?: string; id?: number; method?: string; params?: unknown[] };
  if (!d || d.__verity !== true || d.dir !== "req") return;

  const reply = (payload: Record<string, unknown>) =>
    window.postMessage({ __verity: true, dir: "res", id: d.id, ...payload }, "*");

  const provider = getProvider();
  if (!provider) {
    reply({ error: "No injected wallet found. Install MetaMask (or similar) and reload." });
    return;
  }
  try {
    const result = await provider.request({ method: d.method!, params: d.params ?? [] });
    reply({ result });
  } catch (err) {
    reply({ error: err instanceof Error ? err.message : String(err) });
  }
});

export {};
