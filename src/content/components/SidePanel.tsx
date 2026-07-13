import { useEffect, useRef, useState } from "react";
import { tokens } from "../../shared/tokens";
import { fmtVsp, shortAddr } from "../../shared/format";
import type { Claim, Edge } from "../../shared/types";
import { api } from "../../api";
import { records, groups, createIntents, applyClaimToGroup, emit, pageStatus, type SentenceRecord } from "../store";
import { repaintSentence, repaintGroup } from "../highlighter";
import { VSBar, VSChip } from "./VS";
import { StakeWidget } from "./StakeWidget";
import { ClaimValidator } from "./ClaimValidator";
import { Dots } from "./Dots";
import { useWallet } from "../../wallet/useWallet";

/** The docked workbench panel. Read detail + evidence, stake, or create. */
export function SidePanel({ sentenceId, onClose }: { sentenceId: string; onClose: () => void }) {
  const rec = records.get(sentenceId);
  const { connected, address, connect, disconnect } = useWallet();
  const [claim, setClaim] = useState<Claim | undefined>(rec?.claim);
  const [edges, setEdges] = useState<{ incoming: Edge[]; outgoing: Edge[] }>({ incoming: [], outgoing: [] });
  const isCreate = rec?.status === "eligible" && !claim;
  const intent = createIntents.get(sentenceId);

  useEffect(() => {
    if (claim) api.getEdges(claim.postId).then(setEdges).catch(() => {});
  }, [claim?.postId]);

  // Placeholder claims (dedup chips, chooser routes) carry guessed stats.
  // Refresh once from the real summary so stake totals / active state (and
  // therefore the underline style) are truthful.
  const refreshed = useRef(false);
  useEffect(() => {
    if (!claim || claim.postId <= 0 || refreshed.current) return;
    if (claim.totalStake > 0) return; // already has real-looking data
    refreshed.current = true;
    api.getClaim(claim.postId).then(applyClaim).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claim?.postId]);

  function applyClaim(c: Claim) {
    setClaim(c);
    const r = records.get(sentenceId);
    if (r?.groupId) {
      // Claim groups update as a unit: every sentence expressing this claim
      // gets the new state and repaints together.
      applyClaimToGroup(r.groupId, c);
      repaintGroup(r.groupId);
    } else if (r) {
      r.claim = c;
      // A brand-new claim upgrades the sentence to a live mark; paint it in
      // place so the underline shows without a page reload.
      if (r.status === "eligible") {
        r.status = c.active ? "mapped" : "low-liquidity";
        repaintSentence(sentenceId);
      }
    }
    createIntents.delete(sentenceId);
  }

  if (!rec) return null;

  return (
    <div style={panel}>
      {/* Branded header */}
      <div style={header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={chrome.runtime.getURL("icons/icon-32.png")} alt="" style={logoImg} />
          <span style={{ fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.01em" }}>Verity</span>
          {/* Page analysis still running (the launcher pill is hidden while the panel is open). */}
          {pageStatus.loading && <Dots />}
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
        {rec.choices && rec.choices.length > 0 ? (
          <ClaimChooser rec={rec} />
        ) : isCreate ? (
          <>
            {rec.fluffNotice && <FluffNotice rec={rec} />}
            <SourceQuote text={rec.text} />
            {rec.canonicalText && rec.canonicalText !== rec.text && (
              <div style={{ fontSize: 11, color: tokens.faint, margin: "-8px 0 12px" }}>
                Rewritten as a standalone claim — edit below if needed.
              </div>
            )}
            <ClaimValidator initialText={rec.canonicalText ?? rec.text} intentSide={intent} onResolved={applyClaim} />
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
              <StakeWidget claim={claim} initialSide={intent} onUpdated={applyClaim} />
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

/**
 * A list of claims to pick from. Two modes:
 *  - selection chooser: the selection touched several claims (best match first)
 *  - page list (listAll): every claim found on the page, via the launcher
 */
function ClaimChooser({ rec }: { rec: SentenceRecord }) {
  const choices = (rec.choices ?? [])
    .map((gid) => groups.get(gid))
    .filter((g): g is NonNullable<typeof g> => !!g);

  function pick(g: (typeof choices)[number]) {
    // Same synthetic-record routing the overlay uses: the new record carries
    // the chosen group's identity; opening it swaps this panel's content.
    const id = `sel-${Date.now()}`;
    records.set(id, {
      sentenceId: id,
      text: rec.text,
      status: g.status,
      claim: g.claim,
      matchScore: g.matchScore,
      groupId: g.groupId,
      canonicalText: g.canonicalText,
      el: rec.el,
      start: rec.start,
      end: rec.end,
    });
    const intent = createIntents.get(rec.sentenceId);
    if (intent) createIntents.set(id, intent);
    emit("open", { sentenceId: id });
  }

  return (
    <div>
      {!rec.listAll && <SourceQuote text={rec.text} />}
      <div style={{ fontSize: 12, fontWeight: 700, color: tokens.brand, marginBottom: 4 }}>
        {rec.listAll
          ? `${choices.length} claim${choices.length === 1 ? "" : "s"} on this page`
          : `Your selection touches ${choices.length} claims`}
      </div>
      <div style={{ fontSize: 12, color: tokens.muted, marginBottom: 10 }}>
        {rec.listAll
          ? "Click one to view and stake. To create a new claim, select any sentence in the article."
          : "Pick the one you mean:"}
      </div>
      {choices.map((g) => (
        <button
          key={g.groupId}
          onClick={() => pick(g)}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
            width: "100%", textAlign: "left", margin: "0 0 8px", padding: "10px 12px",
            borderRadius: 8, border: `1px solid ${tokens.line}`, background: tokens.surface,
            fontSize: 13, lineHeight: 1.45, color: tokens.ink, cursor: "pointer",
          }}
        >
          <span>{g.canonicalText}</span>
          {g.claim ? (
            <VSChip evs={g.claim.evs} active={g.claim.active} />
          ) : (
            <span style={{ fontSize: 11, color: tokens.faint, whiteSpace: "nowrap" }}>not staked yet</span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Shown when a selection touched no claim-bearing sentence: explains why, and
 * offers the paragraph's real claims (if any) as one-click alternatives, while
 * the validator below still lets the user formulate a claim themselves.
 */
function FluffNotice({ rec }: { rec: { el: HTMLElement } }) {
  // Claim groups present in the same paragraph as the selection.
  const nearby: { sentenceId: string; canonicalText: string; claim?: Claim }[] = [];
  const seen = new Set<string>();
  for (const [id, r] of records) {
    if (r.el !== rec.el || !r.groupId || seen.has(r.groupId)) continue;
    seen.add(r.groupId);
    const g = groups.get(r.groupId);
    if (g) nearby.push({ sentenceId: id, canonicalText: g.canonicalText, claim: g.claim });
    if (nearby.length >= 3) break;
  }

  return (
    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 10, marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>
        ⚠ No checkable claim found here
      </div>
      <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.45 }}>
        This text reads as narrative or connective prose rather than a standalone factual assertion.
        {nearby.length > 0 ? " Nearby claims in this paragraph:" : " You can still write a claim of your own below."}
      </div>
      {nearby.map((n) => (
        <button
          key={n.sentenceId}
          onClick={() => emit("open", { sentenceId: n.sentenceId })}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
            width: "100%", textAlign: "left", margin: "6px 0 0", padding: "6px 8px",
            borderRadius: 6, border: `1px solid ${tokens.line}`, background: tokens.surface,
            fontSize: 12.5, color: tokens.ink, cursor: "pointer",
          }}
        >
          <span>{n.canonicalText}</span>
          {n.claim && <VSChip evs={n.claim.evs} active={n.claim.active} />}
        </button>
      ))}
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
  // Dark end sits under the (indigo) icon so it stands out against the header.
  background: `linear-gradient(90deg, ${tokens.brandInk}, ${tokens.brand})`,
};
const logoImg: React.CSSProperties = { width: 20, height: 20, borderRadius: 6 };
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
