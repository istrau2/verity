export async function bgFetch(url, init) {
  try {
    const resp = await chrome.runtime.sendMessage({ type: "vr-fetch", url, init });
    if (!resp) return { ok: false, status: 0, json: null, error: "no response from worker" };
    let json = null;
    if (resp.body) {
      try {
        json = JSON.parse(resp.body);
      } catch {
      }
    }
    return { ok: resp.ok, status: resp.status, json, error: resp.error };
  } catch (e) {
    return { ok: false, status: 0, json: null, error: e instanceof Error ? e.message : String(e) };
  }
}
