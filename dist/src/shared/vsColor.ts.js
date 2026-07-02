export function evsToBackground(evs) {
  if (evs === void 0 || Number.isNaN(evs)) return "#ffffff";
  const v = Math.max(-100, Math.min(100, evs)) / 100;
  const red = v < 0 ? 255 : Math.round(255 * (1 - v));
  const green = v > 0 ? 255 : Math.round(255 * (1 + v));
  const blue = 255;
  return `rgb(${red}, ${green}, ${blue})`;
}
export function evsToUnderline(evs) {
  if (evs === void 0 || Number.isNaN(evs)) return "#9ca3af";
  const v = Math.max(-100, Math.min(100, evs)) / 100;
  if (v > 0.05) return "#16a34a";
  if (v < -0.05) return "#dc2626";
  return "#9ca3af";
}
export function evsLabel(evs, active = true) {
  if (!active) return "unsettled";
  if (evs === void 0 || Number.isNaN(evs)) return "no score";
  if (evs > 5) return `+${Math.round(evs)} supported`;
  if (evs < -5) return `${Math.round(evs)} challenged`;
  return "contested";
}
