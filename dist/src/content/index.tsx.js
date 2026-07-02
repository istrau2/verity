import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--88ec8699.js"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_reactDom_client from "/vendor/.vite-deps-react-dom_client.js__v--88ec8699.js"; const createRoot = __vite__cjsImport1_reactDom_client["createRoot"];
import { api } from "/src/api/index.ts.js";
import { extractSentences } from "/src/content/sentences.ts.js";
import { injectMarkStyles, paint } from "/src/content/highlighter.ts.js";
import { page, records } from "/src/content/store.ts.js";
import { Overlay } from "/src/content/overlay.tsx.js";
import { tokens } from "/src/shared/tokens.ts.js";
async function boot() {
  console.log("[Verity] content script loaded on", location.href);
  injectMarkStyles();
  mountOverlay();
  const raw = extractSentences();
  console.log(`[Verity] extracted ${raw.length} sentences`);
  if (raw.length === 0) return;
  const res = await api.resolveSentences({
    url: page.url,
    title: page.title.replace(/ - Wikipedia$/, ""),
    sentences: raw.map((r) => ({
      sentenceId: r.sentenceId,
      text: r.text,
      flagged: r.flagged
    }))
  });
  const byId = new Map(res.matches.map((m) => [m.sentenceId, m]));
  const recs = raw.map((r) => {
    const m = byId.get(r.sentenceId);
    return { ...r, status: m?.status ?? "none", claim: m?.claim, matchScore: m?.matchScore };
  });
  for (const rec of recs) records.set(rec.sentenceId, rec);
  paint(recs);
  const painted = recs.filter((r) => r.status !== "none").length;
  console.log(`[Verity] painted ${painted} marks`);
  document.dispatchEvent(new CustomEvent("verity:ready"));
}
function mountOverlay() {
  const host = document.createElement("div");
  host.id = "verity-root";
  host.style.all = "initial";
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: ${tokens.font}; }
    button { font-family: inherit; }
    @keyframes vr-spin { to { transform: rotate(360deg); } }
  `;
  shadow.appendChild(style);
  const container = document.createElement("div");
  shadow.appendChild(container);
  createRoot(container).render(/* @__PURE__ */ jsxDEV(Overlay, {}, void 0, false, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/index.tsx",
    lineNumber: 65,
    columnNumber: 32
  }, this));
}
boot();
