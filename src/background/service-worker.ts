/**
 * Background service worker (MV3).
 *
 * Runs in the extension's own privileged origin. Its main job is to proxy the
 * validation-check fetches for the content script: a fetch made here uses the
 * extension's host_permissions and is NOT subject to page CORS/preflight, so
 * POSTs to the app / verity-api work without those servers configuring CORS.
 *
 * The target host MUST be listed in `host_permissions` (see manifest.ts).
 */

interface VrFetchMsg {
  type: "vr-fetch";
  url: string;
  init?: { method?: string; headers?: Record<string, string>; body?: string };
}

interface VrFetchResp {
  ok: boolean;
  status: number;
  body?: string;
  error?: string;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("enabled").then((v) => {
    if (typeof v.enabled !== "boolean") chrome.storage.local.set({ enabled: true });
  });
});

chrome.runtime.onMessage.addListener((msg: VrFetchMsg, _sender, sendResponse) => {
  if (msg?.type !== "vr-fetch") return; // not ours

  (async () => {
    try {
      const res = await fetch(msg.url, msg.init);
      const body = await res.text();
      sendResponse({ ok: res.ok, status: res.status, body } satisfies VrFetchResp);
    } catch (e) {
      sendResponse({ ok: false, status: 0, error: e instanceof Error ? e.message : String(e) } satisfies VrFetchResp);
    }
  })();

  return true; // keep the message channel open for the async sendResponse
});
