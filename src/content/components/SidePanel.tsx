import { useEffect, useState } from "react";
import { tokens } from "../../shared/tokens";
import { fmtVsp, shortAddr } from "../../shared/format";
import type { Claim, Edge } from "../../shared/types";
import { api } from "../../api";
import { records } from "../store";
import { VSBar, VSChip } from "./VS";
import { StakeWidget } from "./StakeWidget";
import { ClaimValidator } from "./ClaimValidator";
import { useWallet } from "../../wallet/useWallet";

/** The docked workbench panel. Read detail + evidence, stake, or create. */
export function SidePanel({ sentenceId, onClose }: { sentenceId: string; onClose: () => void }) {
  const rec = records.get(sentenceId);
  const { connected, address, connect, disconnect } = useWallet();
  const [claim, setClaim] = useState<Claim | undefined>(rec?.claim);
  const [edges, setEdges] = useState<{ incoming: Edge[]; outgoing: Edge[] }>({ incoming: [], outgoing: [] });
  const isCreate = rec?.status === "eligible" && !claim;

  useEffect(() => {
    if (claim) api.getEdges(claim.postId).then(setEdges).catch(() => {});
  }, [claim?.postId]);

  function applyClaim(c: Claim) {
    setClaim(c);
    const r = records.get(sentenceId);
    if (r) r.claim = c;
  }

  if (!rec) return null;

  return (
    <div style={panel}>
      {/* Branded header */}
      <div style={header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={logoDot} />
          <span style={{ fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.01em" }}>Verity</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {connected ? (
            <button onClick={() => disconnect()} style={walletPill} title="Disconnect">
              {shortAddr(address)}
            </button>
          ) : (
            <button onClick={() => connect()} style={walletPill}>Connect</button>
          )}
          <button onClick={onClose} style={closeBtn} aria-label="Close">×</button>
        </div>
      </div>

      <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
        {isCreate ? (
          <>
            <SourceQuote text={rec.text} />
            <ClaimValidator initialText={rec.text} onResolved={applyClaim} />
          </>
        ) : claim ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <VSChip evs={claim.evs} active={claim.active} />
              <span style={{ fontSize: 11, color: tokens.faint }}>claim #{claim.postId}</span>
            </div>

            <div style={{ fontSize: 15, lineHeight: 1.5, color: tokens.ink, fontWeight: 600, marginBottom: 12 }}>
              {claim.text}
            </div>

            {rec.status === "diverged" && (
              <div style={warn}>
                The article wording changed since this claim was staked. The score reflects the original claim text.
              </div>
            )}
            {rec.status === "low-liquidity" && (
              <div style={info}>
                Below the activity threshold — the score isn’t meaningful yet. Be the first to stake.
              </div>
            )}

            <div style={{ margin: "14px 0" }}>
              <VSBar evs={claim.active ? claim.evs : undefined} />
            </div>

            <div style={statsRow}>
              <Stat label="Support" value={`${fmtVsp(claim.supportStake)} VSP`} color={tokens.support} />
              <Stat label="Challenge" value={`${fmtVsp(claim.challengeStake)} VSP`} color={tokens.challenge} />
              <Stat label="Total" value={`${fmtVsp(claim.totalStake)} VSP`} color={tokens.ink} />
            </div>

            <div style={{ margin: "16px 0" }}>
              <StakeWidget claim={claim} onUpdated={applyClaim} />
            </div>

            <Evidence edges={edges} />
          </>
        ) : (
          <div style={{ fontSize: 13, color: tokens.muted }}>Loading…</div>
        )}
      </div>

      <div style={foot}>
        Verity scores are staked market positions, not authoritative fact rulings.
      </div>
    </div>
  );
}

function SourceQuote({ text }: { text: string }) {
  return (
    <div style={{ borderLeft: `3px solid ${tokens.brand}`, padding: "4px 0 4px 12px", margin: "0 0 14px", fontSize: 13, color: tokens.muted, fontStyle: "italic", lineHeight: 1.45 }}>
      “{text}”
    </div>
  );
}

function Evidence({ edges }: { edges: { incoming: Edge[]; outgoing: Edge[] } }) {
  const all = [...edges.incoming, ...edges.outgoing];
  if (all.length === 0) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: tokens.ink, marginBottom: 8 }}>Evidence</div>
      {all.map((e) => (
        <div key={e.linkPostId} style={{ display: "flex", gap: 8, padding: "8px 0", borderTop: `1px solid ${tokens.line}` }}>
          <span style={{ fontSize: 16 }}>{e.isChallenge ? "⚔️" : "🔗"}</span>
          <div>
            <div style={{ fontSize: 13, color: tokens.ink, lineHeight: 1.4 }}>{e.otherText}</div>
            <div style={{ fontSize: 11, color: e.isChallenge ? tokens.challenge : tokens.support }}>
              {e.isChallenge ? "challenges" : "supports"} · contributes {e.contribution > 0 ? "+" : ""}{e.contribution}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: tokens.faint }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

const PANEL_WIDTH = 380;
const panel: React.CSSProperties = {
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
  borderLeft: `1px solid ${tokens.line}`,
};
const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.brandInk})`,
};
const logoDot: React.CSSProperties = { width: 18, height: 18, borderRadius: 6, background: "#fff", opacity: 0.9 };
const walletPill: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.4)",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
const closeBtn: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 8,
  border: "none",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  fontSize: 18,
  lineHeight: "22px",
  cursor: "pointer",
};
const statsRow: React.CSSProperties = { display: "flex", gap: 8, padding: "10px 0", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` };
const warn: React.CSSProperties = { fontSize: 12, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 10px", marginBottom: 10 };
const info: React.CSSProperties = { fontSize: 12, color: tokens.brandInk, background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 8, padding: "8px 10px", marginBottom: 10 };
const foot: React.CSSProperties = { padding: "10px 14px", fontSize: 11, color: tokens.faint, borderTop: `1px solid ${tokens.line}`, background: tokens.surfaceAlt };
