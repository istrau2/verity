import { createHotContext as __vite__createHotContext } from "/vendor/vite-client.js";import.meta.hot = __vite__createHotContext("/src/content/components/Launcher.tsx.js");import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--88ec8699.js"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/Users/ishai/code/verisphere/verity/src/content/components/Launcher.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
import { tokens } from "/src/shared/tokens.ts.js";
export function Launcher({ count, active, onClick }) {
  return /* @__PURE__ */ jsxDEV(
    "button",
    {
      onClick,
      style: {
        position: "fixed",
        bottom: 20,
        right: active ? 396 : 20,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 999,
        border: "none",
        background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.brandInk})`,
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        boxShadow: tokens.shadow,
        cursor: "pointer",
        zIndex: tokens.z,
        transition: "right 0.18s ease"
      },
      children: [
        /* @__PURE__ */ jsxDEV("span", { style: { width: 16, height: 16, borderRadius: 5, background: "#fff", opacity: 0.9 } }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/Launcher.tsx",
          lineNumber: 47,
          columnNumber: 7
        }, this),
        "Verity",
        count > 0 && /* @__PURE__ */ jsxDEV("span", { style: { background: "rgba(255,255,255,0.25)", borderRadius: 999, padding: "1px 8px", fontSize: 12 }, children: count }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/Launcher.tsx",
          lineNumber: 50,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/Launcher.tsx",
      lineNumber: 25,
      columnNumber: 5
    },
    this
  );
}
_c = Launcher;
var _c;
$RefreshReg$(_c, "Launcher");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/Users/ishai/code/verisphere/verity/src/content/components/Launcher.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/Users/ishai/code/verisphere/verity/src/content/components/Launcher.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
