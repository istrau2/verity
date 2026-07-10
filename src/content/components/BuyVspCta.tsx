import { tokens } from "../../shared/tokens";
import { env } from "../../shared/env";

/** Shown when a connected wallet has no VSP. Links out to buy/get VSP. */
export function BuyVspCta({ action }: { action: string }) {
  return (
    <div style={{ background: "#eef2ff", border: `1px solid #c7d2fe`, borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: tokens.brandInk, marginBottom: 4 }}>
        You need VSP to {action}
      </div>
      <div style={{ fontSize: 12, color: tokens.muted, marginBottom: 10 }}>
        Your wallet holds no VSP. Get some, then come back to {action}.
      </div>
      <a
        href={env.buyVspUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "7px 14px",
          borderRadius: 8,
          background: tokens.brand,
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          textDecoration: "none",
        }}
      >
        Buy VSP →
      </a>
    </div>
  );
}
