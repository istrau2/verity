import { useEffect, useState } from "react";
import { tokens } from "../../shared/tokens";
import { fmtVsp } from "../../shared/format";
import type { Claim } from "../../shared/types";
import { api } from "../../api";
import { useWallet } from "../../wallet/useWallet";

/**
 * Target-based stake control mirroring frontend/src/components/StakeControl.tsx:
 * the user sets a net position (positive = support, negative = challenge) and we
 * call setStake once. Writes go through the relay (wallet only signs).
 */
export function StakeWidget({ claim, onUpdated }: { claim: Claim; onUpdated: (c: Claim) => void }) {
  const { connected, address, balance, connect, signer } = useWallet();
  const [target, setTarget] = useState("0");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
      // Use the address connect() RETURNS — the `address` closure var is stale
      // right after connecting (state updates don't update locals).
      let addr = address;
      if (!addr) addr = (await connect()).address;
      if (!addr) throw new Error("Connect your wallet to stake.");
      const updated = await api.setStake(claim.postId, targetVal, signer, addr);
      onUpdated(updated);
    } catch (e: any) {
      setErr(e?.message?.slice(0, 90) ?? "Stake failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: `1px solid ${tokens.line}`, borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: tokens.ink, marginBottom: 8 }}>Your position</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => setTarget((targetVal - 1).toFixed(2))} style={stepBtn}>−</button>
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          style={{
            width: 90,
            padding: "6px 8px",
            textAlign: "right",
            fontSize: 14,
            fontWeight: 700,
            color: tokens.ink,
            border: `1px solid ${tokens.line}`,
            borderRadius: 8,
          }}
        />
        <button onClick={() => setTarget((targetVal + 1).toFixed(2))} style={stepBtn}>+</button>
        <span style={{ fontSize: 12, fontWeight: 700, color: sideColor, minWidth: 74 }}>VSP · {side}</span>
        <button onClick={apply} disabled={busy} style={{ ...applyBtn, opacity: busy ? 0.6 : 1 }}>
          {busy ? "…" : connected ? "Apply" : "Connect & stake"}
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: tokens.faint, marginTop: 8 }}>
        <span>Positive supports · negative challenges · 0 withdraws</span>
        {connected && <span>Balance: {fmtVsp(balance)} VSP</span>}
      </div>
      {err && (
        <div style={{ marginTop: 8, fontSize: 12, color: tokens.challenge, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "6px 8px" }}>
          {err}
        </div>
      )}
    </div>
  );
}

const stepBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: `1px solid ${tokens.line}`,
  background: tokens.surface,
  cursor: "pointer",
  fontSize: 16,
  color: tokens.ink,
};

const applyBtn: React.CSSProperties = {
  marginLeft: "auto",
  padding: "6px 14px",
  borderRadius: 8,
  border: "none",
  background: tokens.brand,
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};
