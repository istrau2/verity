import { createHotContext as __vite__createHotContext } from "/vendor/vite-client.js";import.meta.hot = __vite__createHotContext("/src/content/components/HoverCard.tsx.js");import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--88ec8699.js"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/vendor/react-refresh.js";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
import { tokens } from "/src/shared/tokens.ts.js";
import { fmtVsp } from "/src/shared/format.ts.js";
import { VSChip } from "/src/content/components/VS.tsx.js";
export function HoverCard({ rec, rect }) {
  const top = rect.bottom + 8;
  const left = Math.min(rect.left, window.innerWidth - 380);
  const c = rec.claim;
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      style: {
        position: "fixed",
        top,
        left: Math.max(8, left),
        width: 360,
        background: tokens.surface,
        border: `1px solid ${tokens.line}`,
        borderRadius: tokens.radius,
        boxShadow: tokens.shadow,
        padding: 14,
        zIndex: tokens.z,
        pointerEvents: "none"
      },
      children: rec.status === "eligible" ? /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 700, color: tokens.brand, marginBottom: 6 }, children: "No claim yet" }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
          lineNumber: 49,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, color: tokens.ink, lineHeight: 1.45 }, children: rec.text }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
          lineNumber: 52,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: tokens.muted, marginTop: 8 }, children: "Click to create this claim and stake on it." }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
          lineNumber: 53,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
        lineNumber: 48,
        columnNumber: 7
      }, this) : c ? /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxDEV(VSChip, { evs: c.evs, active: c.active }, void 0, false, {
            fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
            lineNumber: 60,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 11, color: tokens.faint }, children: rec.status === "diverged" ? "wording changed" : rec.status === "low-liquidity" ? "low liquidity" : `#${c.postId}` }, void 0, false, {
            fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
            lineNumber: 61,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
          lineNumber: 59,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, color: tokens.ink, lineHeight: 1.45, marginBottom: 8 }, children: c.text }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
          lineNumber: 65,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 12, fontSize: 12, color: tokens.muted }, children: [
          /* @__PURE__ */ jsxDEV("span", { style: { color: tokens.support }, children: [
            "▲ ",
            fmtVsp(c.supportStake),
            " support"
          ] }, void 0, true, {
            fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
            lineNumber: 67,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("span", { style: { color: tokens.challenge }, children: [
            "▼ ",
            fmtVsp(c.challengeStake),
            " challenge"
          ] }, void 0, true, {
            fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
            lineNumber: 68,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
          lineNumber: 66,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 11, color: tokens.faint, marginTop: 8 }, children: "Click to open · stake · view evidence" }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
          lineNumber: 70,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
        lineNumber: 58,
        columnNumber: 7
      }, this) : null
    },
    void 0,
    false,
    {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx",
      lineNumber: 32,
      columnNumber: 5
    },
    this
  );
}
_c = HoverCard;
var _c;
$RefreshReg$(_c, "HoverCard");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/Users/ishai/code/verisphere/verity/src/content/components/HoverCard.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
