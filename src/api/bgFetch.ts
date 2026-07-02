/**
 * Fetch via the background service worker to bypass page CORS/preflight.
 *
 * The content script can't fetch cross-origin POSTs without the target server
 * sending CORS headers; the worker can (its fetch uses the extension's
 * host_permissions). This helper hides the message round-trip behind a
 * fetch-like call that returns parsed JSON.
 */
export interface BgResponse<T> {
  ok: boolean;
  status: number;
  json: T | null;
  error?: string;
}

export async function bgFetch<T = unknown>(
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
): Promise<BgResponse<T>> {
  try {
    const resp = (await chrome.runtime.sendMessage({ type: "vr-fetch", url, init })) as
      | { ok: boolean; status: number; body?: string; error?: string }
      | undefined;
    if (!resp) return { ok: false, status: 0, json: null, error: "no response from worker" };
    let json: T | null = null;
    if (resp.body) {
      try {
        json = JSON.parse(resp.body) as T;
      } catch {
        /* non-JSON body */
      }
    }
    return { ok: resp.ok, status: resp.status, json, error: resp.error };
  } catch (e) {
    return { ok: false, status: 0, json: null, error: e instanceof Error ? e.message : String(e) };
  }
}
