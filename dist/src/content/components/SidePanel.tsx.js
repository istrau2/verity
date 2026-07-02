import { createHotContext as __vite__createHotContext } from "/vendor/vite-client.js";import.meta.hot = __vite__createHotContext("/src/content/components/SidePanel.tsx.js");import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--88ec8699.js"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/vendor/.vite-deps-react.js__v--88ec8699.js"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useState = __vite__cjsImport3_react["useState"];
import { tokens } from "/src/shared/tokens.ts.js";
import { fmtVsp, shortAddr } from "/src/shared/format.ts.js";
import { api } from "/src/api/index.ts.js";
import { records } from "/src/content/store.ts.js";
import { VSBar, VSChip } from "/src/content/components/VS.tsx.js";
import { StakeWidget } from "/src/content/components/StakeWidget.tsx.js";
import { ClaimValidator } from "/src/content/components/ClaimValidator.tsx.js";
import { useWallet } from "/src/wallet/useWallet.ts.js";
export function SidePanel({ sentenceId, onClose }) {
  _s();
  const rec = records.get(sentenceId);
  const { connected, address, connect, disconnect } = useWallet();
  const [claim, setClaim] = useState(rec?.claim);
  const [edges, setEdges] = useState({ incoming: [], outgoing: [] });
  const isCreate = rec?.status === "eligible" && !claim;
  useEffect(() => {
    if (claim) api.getEdges(claim.postId).then(setEdges).catch(() => {
    });
  }, [claim?.postId]);
  function applyClaim(c) {
    setClaim(c);
    const r = records.get(sentenceId);
    if (r) r.claim = c;
  }
  if (!rec) return null;
  return /* @__PURE__ */ jsxDEV("div", { style: panel, children: [
    /* @__PURE__ */ jsxDEV("div", { style: header, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: logoDot }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 56,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("span", { style: { fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.01em" }, children: "Verity" }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 57,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 55,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        connected ? /* @__PURE__ */ jsxDEV("button", { onClick: () => disconnect(), style: walletPill, title: "Disconnect", children: shortAddr(address) }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 61,
          columnNumber: 11
        }, this) : /* @__PURE__ */ jsxDEV("button", { onClick: () => connect(), style: walletPill, children: "Connect" }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 65,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("button", { onClick: onClose, style: closeBtn, "aria-label": "Close", children: "×" }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 67,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 59,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
      lineNumber: 54,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { padding: 16, overflowY: "auto", flex: 1 }, children: isCreate ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(SourceQuote, { text: rec.text }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 74,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV(ClaimValidator, { initialText: rec.text, onResolved: applyClaim }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 75,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
      lineNumber: 73,
      columnNumber: 9
    }, this) : claim ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
        /* @__PURE__ */ jsxDEV(VSChip, { evs: claim.evs, active: claim.active }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 80,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 11, color: tokens.faint }, children: [
          "claim #",
          claim.postId
        ] }, void 0, true, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 81,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 79,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 15, lineHeight: 1.5, color: tokens.ink, fontWeight: 600, marginBottom: 12 }, children: claim.text }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 84,
        columnNumber: 13
      }, this),
      rec.status === "diverged" && /* @__PURE__ */ jsxDEV("div", { style: warn, children: "The article wording changed since this claim was staked. The score reflects the original claim text." }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 89,
        columnNumber: 11
      }, this),
      rec.status === "low-liquidity" && /* @__PURE__ */ jsxDEV("div", { style: info, children: "Below the activity threshold — the score isn’t meaningful yet. Be the first to stake." }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 94,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { margin: "14px 0" }, children: /* @__PURE__ */ jsxDEV(VSBar, { evs: claim.active ? claim.evs : void 0 }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 100,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 99,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: statsRow, children: [
        /* @__PURE__ */ jsxDEV(Stat, { label: "Support", value: `${fmtVsp(claim.supportStake)} VSP`, color: tokens.support }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 104,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV(Stat, { label: "Challenge", value: `${fmtVsp(claim.challengeStake)} VSP`, color: tokens.challenge }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 105,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV(Stat, { label: "Total", value: `${fmtVsp(claim.totalStake)} VSP`, color: tokens.ink }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 106,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 103,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { margin: "16px 0" }, children: /* @__PURE__ */ jsxDEV(StakeWidget, { claim, onUpdated: applyClaim }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 110,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 109,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV(Evidence, { edges }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 113,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
      lineNumber: 78,
      columnNumber: 9
    }, this) : /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, color: tokens.muted }, children: "Loading…" }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
      lineNumber: 116,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
      lineNumber: 71,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: foot, children: "Verity scores are staked market positions, not authoritative fact rulings." }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
      lineNumber: 120,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
    lineNumber: 52,
    columnNumber: 5
  }, this);
}
_s(SidePanel, "5AAlRmprJvmXmwCIMmf1VlrKmE0=", false, function() {
  return [useWallet];
});
_c = SidePanel;
function SourceQuote({ text }) {
  return /* @__PURE__ */ jsxDEV("div", { style: { borderLeft: `3px solid ${tokens.brand}`, padding: "4px 0 4px 12px", margin: "0 0 14px", fontSize: 13, color: tokens.muted, fontStyle: "italic", lineHeight: 1.45 }, children: [
    "“",
    text,
    "”"
  ] }, void 0, true, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
    lineNumber: 129,
    columnNumber: 5
  }, this);
}
_c2 = SourceQuote;
function Evidence({ edges }) {
  const all = [...edges.incoming, ...edges.outgoing];
  if (all.length === 0) return null;
  return /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 8 }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 700, color: tokens.ink, marginBottom: 8 }, children: "Evidence" }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
      lineNumber: 140,
      columnNumber: 7
    }, this),
    all.map(
      (e) => /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 8, padding: "8px 0", borderTop: `1px solid ${tokens.line}` }, children: [
        /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 16 }, children: e.isChallenge ? "⚔️" : "🔗" }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 143,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, color: tokens.ink, lineHeight: 1.4 }, children: e.otherText }, void 0, false, {
            fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
            lineNumber: 145,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 11, color: e.isChallenge ? tokens.challenge : tokens.support }, children: [
            e.isChallenge ? "challenges" : "supports",
            " · contributes ",
            e.contribution > 0 ? "+" : "",
            e.contribution
          ] }, void 0, true, {
            fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
            lineNumber: 146,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
          lineNumber: 144,
          columnNumber: 11
        }, this)
      ] }, e.linkPostId, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
        lineNumber: 142,
        columnNumber: 7
      }, this)
    )
  ] }, void 0, true, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
    lineNumber: 139,
    columnNumber: 5
  }, this);
}
_c3 = Evidence;
function Stat({ label, value, color }) {
  return /* @__PURE__ */ jsxDEV("div", { style: { flex: 1 }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 11, color: tokens.faint }, children: label }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
      lineNumber: 159,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, fontWeight: 700, color }, children: value }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
      lineNumber: 160,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx",
    lineNumber: 158,
    columnNumber: 5
  }, this);
}
_c4 = Stat;
const PANEL_WIDTH = 380;
const panel = {
  position: "fixed",
  top: 0,
  right: 0,
  width: PANEL_WIDTH,
  height: "100vh",
  background: tokens.surface,
  boxShadow: tokens.shadow,
  zIndex: tokens.z,
  display: "flex",
  flexDirection: "column",
  borderLeft: `1px solid ${tokens.line}`
};
const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.brandInk})`
};
const logoDot = { width: 18, height: 18, borderRadius: 6, background: "#fff", opacity: 0.9 };
const walletPill = {
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.4)",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer"
};
const closeBtn = {
  width: 26,
  height: 26,
  borderRadius: 8,
  border: "none",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  fontSize: 18,
  lineHeight: "22px",
  cursor: "pointer"
};
const statsRow = { display: "flex", gap: 8, padding: "10px 0", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` };
const warn = { fontSize: 12, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 10px", marginBottom: 10 };
const info = { fontSize: 12, color: tokens.brandInk, background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 8, padding: "8px 10px", marginBottom: 10 };
const foot = { padding: "10px 14px", fontSize: 11, color: tokens.faint, borderTop: `1px solid ${tokens.line}`, background: tokens.surfaceAlt };
var _c, _c2, _c3, _c4;
$RefreshReg$(_c, "SidePanel");
$RefreshReg$(_c2, "SourceQuote");
$RefreshReg$(_c3, "Evidence");
$RefreshReg$(_c4, "Stat");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/Users/ishai/code/verisphere/verity/src/content/components/SidePanel.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
