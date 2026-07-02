import { createHotContext as __vite__createHotContext } from "/vendor/vite-client.js";import.meta.hot = __vite__createHotContext("/src/content/overlay.tsx.js");import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--88ec8699.js"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/Users/ishai/code/verisphere/verity/src/content/overlay.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/vendor/.vite-deps-react.js__v--88ec8699.js"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useMemo = __vite__cjsImport3_react["useMemo"]; const useRef = __vite__cjsImport3_react["useRef"]; const useState = __vite__cjsImport3_react["useState"];
import { on, records } from "/src/content/store.ts.js";
import { markRect } from "/src/content/highlighter.ts.js";
import { HoverCard } from "/src/content/components/HoverCard.tsx.js";
import { SidePanel } from "/src/content/components/SidePanel.tsx.js";
import { Launcher } from "/src/content/components/Launcher.tsx.js";
import { expandToSentences } from "/src/content/sentenceSelection.ts.js";
import { tokens } from "/src/shared/tokens.ts.js";
export function Overlay() {
  _s();
  const [hoverId, setHoverId] = useState(null);
  const [panelId, setPanelId] = useState(null);
  const [, force] = useState(0);
  const [toast, setToast] = useState(null);
  const [sel, setSel] = useState(null);
  const hoverTimer = useRef(null);
  const pendingText = useRef(null);
  useEffect(() => {
    const offs = [
      on("hover", ({ sentenceId }) => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        setHoverId(sentenceId);
      }),
      on("hoverEnd", () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setHoverId(null), 120);
      }),
      on("open", ({ sentenceId }) => {
        setHoverId(null);
        setPanelId(sentenceId);
      }),
      on("create", ({ sentenceId }) => {
        setHoverId(null);
        setPanelId(sentenceId);
      })
    ];
    const ready = () => force((n) => n + 1);
    document.addEventListener("verity:ready", ready);
    const toastHandler = (e) => {
      setToast(e.detail?.msg ?? null);
      setTimeout(() => setToast(null), 2600);
    };
    document.addEventListener("verity:toast", toastHandler);
    return () => {
      offs.forEach((o) => o());
      document.removeEventListener("verity:ready", ready);
      document.removeEventListener("verity:toast", toastHandler);
    };
  }, []);
  useEffect(() => {
    const qualify = () => {
      const s = window.getSelection();
      if (!s || s.isCollapsed || s.rangeCount === 0) return null;
      const raw = s.toString().replace(/\s+/g, " ").trim();
      const anchor = s.anchorNode;
      const host = document.getElementById("verity-root");
      if (raw.length < 8 || !anchor || host && host.contains(anchor)) return null;
      const text = expandToSentences(s) ?? raw;
      let rect = s.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        const el = anchor.nodeType === 1 ? anchor : anchor.parentElement;
        if (el) rect = el.getBoundingClientRect();
      }
      return { text, rect };
    };
    const onChange = () => setSel(panelId ? null : qualify());
    const onFinalize = () => {
      const q = qualify();
      if (!q) return;
      if (panelId) openCreate(q.text);
      else setSel(q);
    };
    document.addEventListener("selectionchange", onChange);
    document.addEventListener("mouseup", onFinalize);
    document.addEventListener("keyup", onFinalize);
    return () => {
      document.removeEventListener("selectionchange", onChange);
      document.removeEventListener("mouseup", onFinalize);
      document.removeEventListener("keyup", onFinalize);
    };
  }, [panelId]);
  function openCreate(text) {
    if (!text) return;
    const id = `sel-${Date.now()}`;
    records.set(id, {
      sentenceId: id,
      text,
      status: "eligible",
      el: document.body,
      start: 0,
      end: 0
    });
    pendingText.current = null;
    setSel(null);
    setPanelId(id);
  }
  const stats = useMemo(() => {
    let mapped = 0;
    let firstId = null;
    for (const [id, r] of records) {
      if (r.status === "mapped" || r.status === "low-liquidity" || r.status === "diverged") {
        mapped++;
        if (!firstId) firstId = id;
      }
    }
    return { mapped, firstId };
  }, [panelId, hoverId, toast]);
  const hoverRec = hoverId ? records.get(hoverId) : null;
  const hoverRect = hoverId ? markRect(hoverId) : null;
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV(
      Launcher,
      {
        count: stats.mapped,
        active: !!panelId,
        onClick: () => {
          if (panelId) setPanelId(null);
          else if (stats.firstId) setPanelId(stats.firstId);
          else
            document.dispatchEvent(
              new CustomEvent("verity:toast", {
                detail: { msg: "No claims here yet — select any sentence to create one." }
              })
            );
        }
      },
      void 0,
      false,
      {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/overlay.tsx",
        lineNumber: 149,
        columnNumber: 7
      },
      this
    ),
    hoverRec && hoverRect && !panelId && /* @__PURE__ */ jsxDEV(HoverCard, { rec: hoverRec, rect: hoverRect }, void 0, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/overlay.tsx",
      lineNumber: 165,
      columnNumber: 7
    }, this),
    sel && !panelId && /* @__PURE__ */ jsxDEV(
      "button",
      {
        onMouseDown: (e) => {
          e.preventDefault();
          pendingText.current = sel.text;
        },
        onClick: () => openCreate(pendingText.current ?? sel?.text ?? ""),
        style: {
          position: "fixed",
          top: Math.max(8, sel.rect.top - 42),
          left: Math.min(sel.rect.left, window.innerWidth - 170),
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          borderRadius: 999,
          border: "none",
          background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.brandInk})`,
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          boxShadow: tokens.shadow,
          cursor: "pointer",
          zIndex: tokens.z
        },
        children: "+ Create claim"
      },
      void 0,
      false,
      {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/overlay.tsx",
        lineNumber: 169,
        columnNumber: 7
      },
      this
    ),
    panelId && /* @__PURE__ */ jsxDEV(SidePanel, { sentenceId: panelId, onClose: () => setPanelId(null) }, panelId, false, {
      fileName: "/Users/ishai/code/verisphere/verity/src/content/overlay.tsx",
      lineNumber: 199,
      columnNumber: 7
    }, this),
    toast && /* @__PURE__ */ jsxDEV(
      "div",
      {
        style: {
          position: "fixed",
          bottom: 76,
          right: panelId ? 396 : 20,
          background: tokens.ink,
          color: "#fff",
          fontSize: 13,
          padding: "8px 14px",
          borderRadius: 8,
          boxShadow: tokens.shadow,
          zIndex: tokens.z
        },
        children: toast
      },
      void 0,
      false,
      {
        fileName: "/Users/ishai/code/verisphere/verity/src/content/overlay.tsx",
        lineNumber: 203,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, true, {
    fileName: "/Users/ishai/code/verisphere/verity/src/content/overlay.tsx",
    lineNumber: 148,
    columnNumber: 5
  }, this);
}
_s(Overlay, "0gqaOWemRXi9vLr7qWTj6606EgA=");
_c = Overlay;
var _c;
$RefreshReg$(_c, "Overlay");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/Users/ishai/code/verisphere/verity/src/content/overlay.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/Users/ishai/code/verisphere/verity/src/content/overlay.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
