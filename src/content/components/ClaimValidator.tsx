import { useEffect, useState } from "react";
import { tokens } from "../../shared/tokens";
import type { Claim } from "../../shared/types";
import { api } from "../../api";
import { runLocalChecks } from "../../shared/claimChecks";
import { checkAtomicity, findDuplicates, moderateClaim } from "../../api/checks";
import { useWallet } from "../../wallet/useWallet";
import { VSChip } from "./VS";

/**
 * The create-claim validation gate. Each check runs independently and resolves
 * on its own row (green/yellow/red, with a spinner while pending):
 *   - Coherent & complete  → LOCAL (instant)
 *   - Objectively checkable → LOCAL (instant)
 *   - Single assertion      → verity-api (LLM)
 *   - Allowed content       → app /api/moderate
 *   - Not a duplicate       → app /api/claims/check-*
 *
 * The aggregate verdict gates submission; duplicates redirect to staking the
 * existing claim.
 */

type RowStatus = "loading" | "ok" | "warn" | "error";
interface RowState {
  status: RowStatus;
  message?: string;
}

const okRow: RowState = { status: "ok" };
const loadingRow: RowState = { status: "loading" };

export function ClaimValidator({
  initialText,
  onResolved,
}: {
  initialText: string;
  onResolved: (claim: Claim) => void;
}) {
  const { connected, address, connect, signer } = useWallet();
  const [text, setText] = useState(initialText);
  const [canonical, setCanonical] = useState(initialText);
  const [hasRun, setHasRun] = useState(false);

  const [wellFormed, setWellFormed] = useState<RowState>(okRow);
  const [verifiable, setVerifiable] = useState<RowState>(okRow);
  const [atomic, setAtomic] = useState<RowState>(loadingRow);
  const [moderation, setModeration] = useState<RowState>(loadingRow);
  const [dedup, setDedup] = useState<RowState>(loadingRow);

  const [decomposition, setDecomposition] = useState<string[] | null>(null);
  const [duplicateOf, setDuplicateOf] = useState<Claim | null>(null);
  const [similar, setSimilar] = useState<{ claim: Claim; similarity: number }[]>([]);

  const [override, setOverride] = useState(false);
  const [phase, setPhase] = useState<"idle" | "submitting">("idle");
  const [err, setErr] = useState<string | null>(null);

  function runValidate(t: string) {
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
      else setDedup(okRow);
    });
  }

  useEffect(() => {
    if (initialText.trim().length >= 3) runValidate(initialText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = [wellFormed, verifiable, atomic, moderation, dedup];
  const anyLoading = rows.some((r) => r.status === "loading");
  const anyError = rows.some((r) => r.status === "error");
  const anyWarn = rows.some((r) => r.status === "warn");
  const verdict = duplicateOf ? "duplicate" : anyError ? "revise" : anyWarn ? "review" : "ok";
  const canSubmit =
    hasRun && !anyLoading && (verdict === "ok" || (verdict === "review" && override));

  async function submit() {
    setPhase("submitting");
    setErr(null);
    try {
      if (!connected || !address) await connect();
      const addr = address ?? (await connect()).address!;
      const { claim } = await api.createClaim(canonical, signer, addr);
      onResolved(claim);
    } catch (e: any) {
      setErr(e?.message?.slice(0, 90) ?? "Create failed");
      setPhase("idle");
    }
  }

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: tokens.brand, marginBottom: 8 }}>
        Create a claim
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Type or edit a single, checkable assertion…"
        style={{
          width: "100%",
          padding: 10,
          fontSize: 13,
          lineHeight: 1.45,
          color: tokens.ink,
          border: `1px solid ${tokens.line}`,
          borderRadius: 8,
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 0 12px" }}>
        <span style={{ fontSize: 11, color: tokens.faint }}>One atomic, objectively checkable claim.</span>
        <button onClick={() => runValidate(text)} style={ghostBtn}>
          {hasRun ? "Re-check" : "Check"}
        </button>
      </div>

      {hasRun && (
        <>
          <div style={{ border: `1px solid ${tokens.line}`, borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <Row label="Coherent & complete" row={wellFormed} />
            <Row label="Objectively checkable" row={verifiable} />
            <Row label="Single assertion" row={atomic} />
            <Row label="Allowed content" row={moderation} />
            <Row label="Not a duplicate" row={dedup} />
          </div>

          <VerdictSection
            verdict={verdict}
            duplicateOf={duplicateOf}
            decomposition={decomposition}
            similar={similar}
            override={override}
            setOverride={setOverride}
            onUse={(t) => { setText(t); runValidate(t); }}
            onStakeExisting={onResolved}
          />

          {err && <div style={{ marginTop: 8, fontSize: 12, color: tokens.challenge }}>{err}</div>}

          {verdict !== "duplicate" && (
            <button
              onClick={submit}
              disabled={!canSubmit || phase === "submitting"}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "9px 14px",
                borderRadius: 8,
                border: "none",
                background: canSubmit ? tokens.brand : tokens.line,
                color: canSubmit ? "#fff" : tokens.faint,
                fontWeight: 700,
                fontSize: 13,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {phase === "submitting"
                ? "Creating…"
                : anyLoading
                ? "Checking…"
                : connected
                ? "Create claim"
                : "Connect & create"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, row }: { label: string; row: RowState }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "3px 0" }}>
      <StatusIcon status={row.status} />
      <div style={{ fontSize: 12.5 }}>
        <span style={{ color: tokens.ink }}>{label}</span>
        {row.message && <span style={{ color: tokens.muted }}> — {row.message}</span>}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: RowStatus }) {
  if (status === "loading") {
    return (
      <span
        style={{
          width: 14,
          height: 14,
          marginTop: 2,
          flexShrink: 0,
          borderRadius: "50%",
          border: `2px solid ${tokens.line}`,
          borderTopColor: tokens.brand,
          display: "inline-block",
          animation: "vr-spin 0.7s linear infinite",
        }}
      />
    );
  }
  const map = {
    ok: { c: tokens.support, t: "✓" },
    warn: { c: "#d97706", t: "!" },
    error: { c: tokens.challenge, t: "✕" },
  } as const;
  const { c, t } = map[status];
  return (
    <span style={{ width: 16, height: 16, marginTop: 1, flexShrink: 0, borderRadius: "50%", background: c, color: "#fff", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      {t}
    </span>
  );
}

function VerdictSection({
  verdict,
  duplicateOf,
  decomposition,
  similar,
  override,
  setOverride,
  onUse,
  onStakeExisting,
}: {
  verdict: string;
  duplicateOf: Claim | null;
  decomposition: string[] | null;
  similar: { claim: Claim; similarity: number }[];
  override: boolean;
  setOverride: (b: boolean) => void;
  onUse: (t: string) => void;
  onStakeExisting: (c: Claim) => void;
}) {
  if (verdict === "duplicate" && duplicateOf) {
    return (
      <div style={banner("#eef2ff", "#c7d2fe")}>
        <div style={{ fontSize: 12, fontWeight: 700, color: tokens.brandInk, marginBottom: 6 }}>
          This claim already exists
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: tokens.ink }}>{duplicateOf.text}</span>
          <VSChip evs={duplicateOf.evs} active={duplicateOf.active} />
        </div>
        <button onClick={() => onStakeExisting(duplicateOf)} style={primaryFull}>
          Stake on the existing claim instead
        </button>
      </div>
    );
  }

  if (verdict === "revise") {
    return (
      <div style={banner("#fef2f2", "#fecaca")}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b" }}>Needs revision</div>
        <div style={{ fontSize: 12, color: "#991b1b", marginTop: 4 }}>
          Fix the flagged issue above, then re-check.
        </div>
      </div>
    );
  }

  if (verdict === "review") {
    return (
      <div style={banner("#fffbeb", "#fde68a")}>
        {decomposition && decomposition.length > 1 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>
              Split into atomic claims?
            </div>
            {decomposition.map((p) => (
              <button key={p} onClick={() => onUse(p)} style={chipBtn}>{p}</button>
            ))}
          </div>
        )}
        {similar.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>
              Similar existing claims
            </div>
            {similar.map((s) => (
              <div key={s.claim.postId} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "4px 0" }}>
                <span style={{ fontSize: 12.5, color: tokens.ink }}>{s.claim.text}</span>
                <button onClick={() => onStakeExisting(s.claim)} style={ghostBtn}>Use</button>
              </div>
            ))}
          </div>
        )}
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "#92400e", cursor: "pointer" }}>
          <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} />
          Create anyway — I understand the above.
        </label>
      </div>
    );
  }

  return (
    <div style={banner("#ecfdf5", "#a7f3d0")}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>Looks good — ready to create.</div>
    </div>
  );
}

function toRow(c: { severity: "ok" | "warn" | "error"; message?: string }): RowState {
  return { status: c.severity, message: c.message };
}

function banner(bg: string, border: string): React.CSSProperties {
  return { background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: 10 };
}
const ghostBtn: React.CSSProperties = {
  padding: "3px 10px", borderRadius: 6, border: `1px solid ${tokens.line}`,
  background: tokens.surface, fontSize: 12, fontWeight: 600, color: tokens.brand, cursor: "pointer",
};
const chipBtn: React.CSSProperties = {
  display: "block", width: "100%", textAlign: "left", margin: "0 0 4px",
  padding: "6px 8px", borderRadius: 6, border: `1px solid ${tokens.line}`,
  background: tokens.surface, fontSize: 12.5, color: tokens.ink, cursor: "pointer",
};
const primaryFull: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8, border: "none",
  background: tokens.brand, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
};
