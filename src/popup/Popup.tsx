import { useEffect, useState } from "react";
import { tokens } from "../shared/tokens";
import { fmtVsp, shortAddr } from "../shared/format";
import { useWallet } from "../wallet/useWallet";

/**
 * Toolbar popup: wallet connect + a global on/off toggle for the overlay.
 * The on/off state is persisted to chrome.storage and read by the content
 * script (wiring left as a follow-up; the toggle is functional in storage).
 */
export function Popup() {
  const { connected, address, balance, connect, disconnect } = useWallet();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    chrome.storage?.local.get("enabled").then((v) => {
      if (typeof v.enabled === "boolean") setEnabled(v.enabled);
    });
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    chrome.storage?.local.set({ enabled: next });
  }

  return (
    <div style={{ font: `14px ${tokens.font}`, color: tokens.ink }}>
      <div style={{ background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.brandInk})`, color: "#fff", padding: "14px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>Verity</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>Verisphere truth layer for Wikipedia</div>
      </div>

      <div style={{ padding: 16 }}>
        <Row label="Overlay">
          <button onClick={toggle} style={{ ...toggleBtn, background: enabled ? tokens.support : tokens.line, color: enabled ? "#fff" : tokens.muted }}>
            {enabled ? "On" : "Off"}
          </button>
        </Row>

        <Row label="Wallet">
          {connected ? (
            <button onClick={() => disconnect()} style={pill}>{shortAddr(address)}</button>
          ) : (
            <button onClick={() => connect()} style={{ ...pill, background: tokens.brand, color: "#fff", border: "none" }}>
              Connect
            </button>
          )}
        </Row>

        {connected && (
          <Row label="Balance">
            <span style={{ fontWeight: 700 }}>{fmtVsp(balance)} VSP</span>
          </Row>
        )}

        <div style={{ marginTop: 14, fontSize: 12, color: tokens.muted, lineHeight: 1.5 }}>
          Open any Wikipedia article — claims are highlighted by their on-chain
          Verity Score. Hover to preview, click to stake or create.
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${tokens.line}` }}>
      <span style={{ color: tokens.muted, fontSize: 13 }}>{label}</span>
      {children}
    </div>
  );
}

const pill: React.CSSProperties = {
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${tokens.line}`,
  background: tokens.surface,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  color: tokens.ink,
};
const toggleBtn: React.CSSProperties = {
  padding: "5px 16px",
  borderRadius: 999,
  border: "none",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};
