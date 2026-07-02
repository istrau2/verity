import { createHotContext as __vite__createHotContext } from "/vendor/vite-client.js";import.meta.hot = __vite__createHotContext("/src/content/components/VS.tsx.js");import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--88ec8699.js"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/Users/ishai/code/verisphere/verity/src/content/components/VS.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
import { evsToBackground, evsLabel } from "/src/shared/vsColor.ts.js";
import { tokens } from "/src/shared/tokens.ts.js";
export function VSChip({ evs, active = true }) {
  const bg = active ? evsToBackground(evs) : "#f3f4f6";
  return /* @__PURE__ */ jsxDEV(
    "span",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        borderRadius: 999,
        border: `1px solid ${tokens.line}`,
        background: bg,
        fontSize: 12,
        fontWeight: 600,
        color: tokens.ink,
        whiteSpace: "nowrap"
      },
      children: evsLabel(evs, active)
    },
    void 0,
    false,
    {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/VS.tsx",
      lineNumber: 27,
      columnNumber: 5
    },
    this
  );
}
_c = VSChip;
export function VSBar({ evs }) {
  const value = evs ?? 0;
  const pct = (value + 100) / 200 * 100;
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: tokens.muted, marginBottom: 4 }, children: [
      /* @__PURE__ */ jsxDEV("span", { children: "challenged" }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/VS.tsx",
        lineNumber: 54,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("span", { style: { fontWeight: 700, color: tokens.ink }, children: [
        "eVS ",
        value.toFixed(0)
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/VS.tsx",
        lineNumber: 55,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("span", { children: "supported" }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/VS.tsx",
        lineNumber: 56,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/VS.tsx",
      lineNumber: 53,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { height: 8, background: "linear-gradient(90deg,#dc2626,#ffffff,#16a34a)", borderRadius: 999, position: "relative" }, children: /* @__PURE__ */ jsxDEV(
      "div",
      {
        style: {
          position: "absolute",
          top: -2,
          left: `calc(${pct}% - 6px)`,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "#fff",
          border: `2px solid ${tokens.ink}`
        }
      },
      void 0,
      false,
      {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/VS.tsx",
        lineNumber: 59,
        columnNumber: 9
      },
      this
    ) }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/VS.tsx",
      lineNumber: 58,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/components/VS.tsx",
    lineNumber: 52,
    columnNumber: 5
  }, this);
}
_c2 = VSBar;
var _c, _c2;
$RefreshReg$(_c, "VSChip");
$RefreshReg$(_c2, "VSBar");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/Users/ishai/code/verisphere/verity/src/content/components/VS.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/Users/ishai/code/verisphere/verity/src/content/components/VS.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
