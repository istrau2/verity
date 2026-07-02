import { createHotContext as __vite__createHotContext } from "/vendor/vite-client.js";import.meta.hot = __vite__createHotContext("/src/content/components/ClaimValidator.tsx.js");import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--88ec8699.js"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/vendor/.vite-deps-react.js__v--88ec8699.js"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useState = __vite__cjsImport3_react["useState"];
import { tokens } from "/src/shared/tokens.ts.js";
import { api } from "/src/api/index.ts.js";
import { runLocalChecks } from "/src/shared/claimChecks.ts.js";
import { checkAtomicity, findDuplicates, moderateClaim } from "/src/api/checks.ts.js";
import { useWallet } from "/src/wallet/useWallet.ts.js";
import { VSChip } from "/src/content/components/VS.tsx.js";
const okRow = { status: "ok" };
const loadingRow = { status: "loading" };
export function ClaimValidator({
  initialText,
  onResolved
}) {
  _s();
  const { connected, address, connect, signer } = useWallet();
  const [text, setText] = useState(initialText);
  const [canonical, setCanonical] = useState(initialText);
  const [hasRun, setHasRun] = useState(false);
  const [wellFormed, setWellFormed] = useState(okRow);
  const [verifiable, setVerifiable] = useState(okRow);
  const [atomic, setAtomic] = useState(loadingRow);
  const [moderation, setModeration] = useState(loadingRow);
  const [dedup, setDedup] = useState(loadingRow);
  const [decomposition, setDecomposition] = useState(null);
  const [duplicateOf, setDuplicateOf] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [override, setOverride] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [err, setErr] = useState(null);
  function runValidate(t) {
    const local = runLocalChecks(t);
    setCanonical(local.canonicalText);
    setWellFormed(toRow(local.wellFormed));
    setVerifiable(toRow(local.verifiable));
    setAtomic(loadingRow);
    setModeration(loadingRow);
    setDedup(loadingRow);
    setDecomposition(null);
    setDuplicateOf(null);
    setSimilar([]);
    setOverride(false);
    setErr(null);
    setHasRun(true);
    const claimText = local.canonicalText;
    checkAtomicity(claimText).then((r) => {
      if (!r.ok) return setAtomic({ status: "warn", message: "Couldn’t verify (service offline)." });
      if (r.result.atomic) return setAtomic(okRow);
      setDecomposition(r.result.subClaims.length > 1 ? r.result.subClaims : null);
      setAtomic({ status: "warn", message: "Bundles multiple assertions." });
    });
    moderateClaim(claimText).then((r) => {
      if (!r.ok) return setModeration({ status: "warn", message: "Couldn’t verify (offline)." });
      if (r.allowed) return setModeration(okRow);
      setModeration({ status: "error", message: r.reason ?? "Content not allowed." });
    });
    findDuplicates(claimText).then((r) => {
      if (!r.ok) return setDedup({ status: "warn", message: "Couldn’t check duplicates (offline)." });
      setDuplicateOf(r.result.duplicateOf ?? null);
      setSimilar(r.result.similar);
      if (r.result.duplicateOf) setDedup({ status: "error", message: "This claim already exists." });
      else if (r.result.similar.length) setDedup({ status: "warn", message: `${r.result.similar.length} similar claim(s) exist.` });
      else
        setDedup(okRow);
    });
  }
  useEffect(() => {
    if (initialText.trim().length >= 3) runValidate(initialText);
  }, []);
  const rows = [wellFormed, verifiable, atomic, moderation, dedup];
  const anyLoading = rows.some((r) => r.status === "loading");
  const anyError = rows.some((r) => r.status === "error");
  const anyWarn = rows.some((r) => r.status === "warn");
  const verdict = duplicateOf ? "duplicate" : anyError ? "revise" : anyWarn ? "review" : "ok";
  const canSubmit = hasRun && !anyLoading && (verdict === "ok" || verdict === "review" && override);
  async function submit() {
    setPhase("submitting");
    setErr(null);
    try {
      if (!connected || !address) await connect();
      const addr = address ?? (await connect()).address;
      const { claim } = await api.createClaim(canonical, signer, addr);
      onResolved(claim);
    } catch (e) {
      setErr(e?.message?.slice(0, 90) ?? "Create failed");
      setPhase("idle");
    }
  }
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 700, color: tokens.brand, marginBottom: 8 }, children: "Create a claim" }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
      lineNumber: 146,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(
      "textarea",
      {
        value: text,
        onChange: (e) => setText(e.target.value),
        rows: 3,
        placeholder: "Type or edit a single, checkable assertion…",
        style: {
          width: "100%",
          padding: 10,
          fontSize: 13,
          lineHeight: 1.45,
          color: tokens.ink,
          border: `1px solid ${tokens.line}`,
          borderRadius: 8,
          resize: "vertical"
        }
      },
      void 0,
      false,
      {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 150,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 0 12px" }, children: [
      /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 11, color: tokens.faint }, children: "One atomic, objectively checkable claim." }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 167,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("button", { onClick: () => runValidate(text), style: ghostBtn, children: hasRun ? "Re-check" : "Check" }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 168,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
      lineNumber: 166,
      columnNumber: 7
    }, this),
    hasRun && /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV("div", { style: { border: `1px solid ${tokens.line}`, borderRadius: 8, padding: 10, marginBottom: 10 }, children: [
        /* @__PURE__ */ jsxDEV(Row, { label: "Coherent & complete", row: wellFormed }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 176,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Row, { label: "Objectively checkable", row: verifiable }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 177,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Row, { label: "Single assertion", row: atomic }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 178,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Row, { label: "Allowed content", row: moderation }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 179,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Row, { label: "Not a duplicate", row: dedup }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 180,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 175,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(
        VerdictSection,
        {
          verdict,
          duplicateOf,
          decomposition,
          similar,
          override,
          setOverride,
          onUse: (t) => {
            setText(t);
            runValidate(t);
          },
          onStakeExisting: onResolved
        },
        void 0,
        false,
        {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 183,
          columnNumber: 11
        },
        this
      ),
      err && /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 8, fontSize: 12, color: tokens.challenge }, children: err }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 194,
        columnNumber: 19
      }, this),
      verdict !== "duplicate" && /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: submit,
          disabled: !canSubmit || phase === "submitting",
          style: {
            width: "100%",
            marginTop: 12,
            padding: "9px 14px",
            borderRadius: 8,
            border: "none",
            background: canSubmit ? tokens.brand : tokens.line,
            color: canSubmit ? "#fff" : tokens.faint,
            fontWeight: 700,
            fontSize: 13,
            cursor: canSubmit ? "pointer" : "not-allowed"
          },
          children: phase === "submitting" ? "Creating…" : anyLoading ? "Checking…" : connected ? "Create claim" : "Connect & create"
        },
        void 0,
        false,
        {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 197,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
      lineNumber: 174,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
    lineNumber: 145,
    columnNumber: 5
  }, this);
}
_s(ClaimValidator, "K8MOjXHWXN/EYYdtGfH38dYa2r8=", false, function() {
  return [useWallet];
});
_c = ClaimValidator;
function Row({ label, row }) {
  return /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 8, alignItems: "flex-start", padding: "3px 0" }, children: [
    /* @__PURE__ */ jsxDEV(StatusIcon, { status: row.status }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
      lineNumber: 231,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12.5 }, children: [
      /* @__PURE__ */ jsxDEV("span", { style: { color: tokens.ink }, children: label }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 233,
        columnNumber: 9
      }, this),
      row.message && /* @__PURE__ */ jsxDEV("span", { style: { color: tokens.muted }, children: [
        " — ",
        row.message
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 234,
        columnNumber: 25
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
      lineNumber: 232,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
    lineNumber: 230,
    columnNumber: 5
  }, this);
}
_c2 = Row;
function StatusIcon({ status }) {
  if (status === "loading") {
    return /* @__PURE__ */ jsxDEV(
      "span",
      {
        style: {
          width: 14,
          height: 14,
          marginTop: 2,
          flexShrink: 0,
          borderRadius: "50%",
          border: `2px solid ${tokens.line}`,
          borderTopColor: tokens.brand,
          display: "inline-block",
          animation: "vr-spin 0.7s linear infinite"
        }
      },
      void 0,
      false,
      {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 243,
        columnNumber: 7
      },
      this
    );
  }
  const map = {
    ok: { c: tokens.support, t: "✓" },
    warn: { c: "#d97706", t: "!" },
    error: { c: tokens.challenge, t: "✕" }
  };
  const { c, t } = map[status];
  return /* @__PURE__ */ jsxDEV("span", { style: { width: 16, height: 16, marginTop: 1, flexShrink: 0, borderRadius: "50%", background: c, color: "#fff", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }, children: t }, void 0, false, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
    lineNumber: 265,
    columnNumber: 5
  }, this);
}
_c3 = StatusIcon;
function VerdictSection({
  verdict,
  duplicateOf,
  decomposition,
  similar,
  override,
  setOverride,
  onUse,
  onStakeExisting
}) {
  if (verdict === "duplicate" && duplicateOf) {
    return /* @__PURE__ */ jsxDEV("div", { style: banner("#eef2ff", "#c7d2fe"), children: [
      /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 700, color: tokens.brandInk, marginBottom: 6 }, children: "This claim already exists" }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 293,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
        /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 13, color: tokens.ink }, children: duplicateOf.text }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 297,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(VSChip, { evs: duplicateOf.evs, active: duplicateOf.active }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 298,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 296,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("button", { onClick: () => onStakeExisting(duplicateOf), style: primaryFull, children: "Stake on the existing claim instead" }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 300,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
      lineNumber: 292,
      columnNumber: 7
    }, this);
  }
  if (verdict === "revise") {
    return /* @__PURE__ */ jsxDEV("div", { style: banner("#fef2f2", "#fecaca"), children: [
      /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 700, color: "#991b1b" }, children: "Needs revision" }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 310,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "#991b1b", marginTop: 4 }, children: "Fix the flagged issue above, then re-check." }, void 0, false, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 311,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
      lineNumber: 309,
      columnNumber: 7
    }, this);
  }
  if (verdict === "review") {
    return /* @__PURE__ */ jsxDEV("div", { style: banner("#fffbeb", "#fde68a"), children: [
      decomposition && decomposition.length > 1 && /* @__PURE__ */ jsxDEV("div", { style: { marginBottom: 8 }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 6 }, children: "Split into atomic claims?" }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 323,
          columnNumber: 13
        }, this),
        decomposition.map(
          (p) => /* @__PURE__ */ jsxDEV("button", { onClick: () => onUse(p), style: chipBtn, children: p }, p, false, {
            fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
            lineNumber: 327,
            columnNumber: 11
          }, this)
        )
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 322,
        columnNumber: 9
      }, this),
      similar.length > 0 && /* @__PURE__ */ jsxDEV("div", { style: { marginBottom: 8 }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 6 }, children: "Similar existing claims" }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 333,
          columnNumber: 13
        }, this),
        similar.map(
          (s) => /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, padding: "4px 0" }, children: [
            /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 12.5, color: tokens.ink }, children: s.claim.text }, void 0, false, {
              fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
              lineNumber: 338,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("button", { onClick: () => onStakeExisting(s.claim), style: ghostBtn, children: "Use" }, void 0, false, {
              fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
              lineNumber: 339,
              columnNumber: 17
            }, this)
          ] }, s.claim.postId, true, {
            fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
            lineNumber: 337,
            columnNumber: 11
          }, this)
        )
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 332,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("label", { style: { display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "#92400e", cursor: "pointer" }, children: [
        /* @__PURE__ */ jsxDEV("input", { type: "checkbox", checked: override, onChange: (e) => setOverride(e.target.checked) }, void 0, false, {
          fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
          lineNumber: 345,
          columnNumber: 11
        }, this),
        "Create anyway — I understand the above."
      ] }, void 0, true, {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
        lineNumber: 344,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
      lineNumber: 320,
      columnNumber: 7
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("div", { style: banner("#ecfdf5", "#a7f3d0"), children: /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 700, color: "#065f46" }, children: "Looks good — ready to create." }, void 0, false, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
    lineNumber: 354,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx",
    lineNumber: 353,
    columnNumber: 5
  }, this);
}
_c4 = VerdictSection;
function toRow(c) {
  return { status: c.severity, message: c.message };
}
function banner(bg, border) {
  return { background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: 10 };
}
const ghostBtn = {
  padding: "3px 10px",
  borderRadius: 6,
  border: `1px solid ${tokens.line}`,
  background: tokens.surface,
  fontSize: 12,
  fontWeight: 600,
  color: tokens.brand,
  cursor: "pointer"
};
const chipBtn = {
  display: "block",
  width: "100%",
  textAlign: "left",
  margin: "0 0 4px",
  padding: "6px 8px",
  borderRadius: 6,
  border: `1px solid ${tokens.line}`,
  background: tokens.surface,
  fontSize: 12.5,
  color: tokens.ink,
  cursor: "pointer"
};
const primaryFull = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "none",
  background: tokens.brand,
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer"
};
var _c, _c2, _c3, _c4;
$RefreshReg$(_c, "ClaimValidator");
$RefreshReg$(_c2, "Row");
$RefreshReg$(_c3, "StatusIcon");
$RefreshReg$(_c4, "VerdictSection");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/Users/ishai/code/verisphere/verity/src/content/components/ClaimValidator.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
