import { tokens } from "../../shared/tokens";

/** Floating brand launcher, bottom-right. Shows how many claims were found. */
export function Launcher({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: 20,
        right: active ? 396 : 20,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 999,
        border: "none",
        background: `linear-gradient(90deg, ${tokens.brand}, ${tokens.brandInk})`,
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        boxShadow: tokens.shadow,
        cursor: "pointer",
        zIndex: tokens.z,
        transition: "right 0.18s ease",
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: 5, background: "#fff", opacity: 0.9 }} />
      Verity
      {count > 0 && (
        <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 999, padding: "1px 8px", fontSize: 12 }}>
          {count}
        </span>
      )}
    </button>
  );
}
