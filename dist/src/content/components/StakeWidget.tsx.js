import { createHotContext as __vite__createHotContext } from "/vendor/vite-client.js";import.meta.hot = __vite__createHotContext("/src/content/components/StakeWidget.tsx.js");import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--88ec8699.js"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/vendor/.vite-deps-react.js__v--88ec8699.js"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useState = __vite__cjsImport3_react["useState"];
import { tokens } from "/src/shared/tokens.ts.js";
import { fmtVsp } from "/src/shared/format.ts.js";
import { api } from "/src/api/index.ts.js";
import { useWallet } from "/src/wallet/useWallet.ts.js";
export function StakeWidget({ claim, onUpdated }) {
  _s();
  const { connected, address, balance, connect, signer } = useWallet();
  const [target, setTarget] = useState("0");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  useEffect(() => {
    if (!connected || !address) return;
    api.getUserStake(claim.postId, address).then((s) => {
      setTarget((s.userSupport - s.userChallenge).toFixed(2));
    });
  }, [connected, address, claim.postId]);
  const targetVal = parseFloat(target) || 0;
  const side = targetVal > 0 ? "support" : targetVal < 0 ? "challenge" : "none";
  const sideColor = targetVal > 0 ? tokens.support : targetVal < 0 ? tokens.challenge : tokens.muted;
  async function apply() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      if (!connected || !address) await connect();
      const addr = wallet_address(address);
      const updated = await api.setStake(claim.postId, targetVal, signer, addr);
      onUpdated(updated);
    } catch (e) {
      setErr(e?.message?.slice(0, 90) ?? "Stake failed");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxDEV("div", { style: { border: `1px solid ${tokens.line}`, borderRadius: 10, padding: 12 }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 700, color: tokens.ink, marginBottom: 8 }, children: "Your position" }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
      lineNumber: 67,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsxDEV("button", { onClick: () => setTarget((targetVal - 1).toFixed(2)), style: stepBtn, children: "−" }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
        lineNumber: 69,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          type: "number",
          value: target,
          onChange: (e) => setTarget(e.target.value),
          style: {
            width: 90,
            padding: "6px 8px",
            textAlign: "right",
            fontSize: 14,
            fontWeight: 700,
            color: tokens.ink,
            border: `1px solid ${tokens.line}`,
            borderRadius: 8
          }
        },
        void 0,
        false,
        {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
          lineNumber: 70,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("button", { onClick: () => setTarget((targetVal + 1).toFixed(2)), style: stepBtn, children: "+" }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
        lineNumber: 85,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 12, fontWeight: 700, color: sideColor, minWidth: 74 }, children: [
        "VSP · ",
        side
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
        lineNumber: 86,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("button", { onClick: apply, disabled: busy, style: { ...applyBtn, opacity: busy ? 0.6 : 1 }, children: busy ? "…" : connected ? "Apply" : "Connect & stake" }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
        lineNumber: 87,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
      lineNumber: 68,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: tokens.faint, marginTop: 8 }, children: [
      /* @__PURE__ */ jsxDEV("span", { children: "Positive supports · negative challenges · 0 withdraws" }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
        lineNumber: 92,
        columnNumber: 9
      }, this),
      connected && /* @__PURE__ */ jsxDEV("span", { children: [
        "Balance: ",
        fmtVsp(balance),
        " VSP"
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
        lineNumber: 93,
        columnNumber: 23
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
      lineNumber: 91,
      columnNumber: 7
    }, this),
    err && /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 8, fontSize: 12, color: tokens.challenge, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "6px 8px" }, children: err }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
      lineNumber: 96,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx",
    lineNumber: 66,
    columnNumber: 5
  }, this);
}
_s(StakeWidget, "XPa4kQFjIjFBzPwkk8Gp9/gJ+pY=", false, function() {
  return [useWallet];
});
_c = StakeWidget;
function wallet_address(a) {
  if (!a) throw new Error("Wallet not connected");
  return a;
}
const stepBtn = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: `1px solid ${tokens.line}`,
  background: tokens.surface,
  cursor: "pointer",
  fontSize: 16,
  color: tokens.ink
};
const applyBtn = {
  marginLeft: "auto",
  padding: "6px 14px",
  borderRadius: 8,
  border: "none",
  background: tokens.brand,
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer"
};
var _c;
$RefreshReg$(_c, "StakeWidget");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/Users/ishai/code/verisphere/verity/src/content/components/StakeWidget.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
