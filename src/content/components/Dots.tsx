/** Three pulsing dots — a compact loader for buttons while async work resolves. */
export function Dots({ color = "#fff" }: { color?: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }} aria-label="loading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
            animation: `vr-pulse 1.2s ${i * 0.16}s ease-in-out infinite`,
          }}
        />
      ))}
    </span>
  );
}
