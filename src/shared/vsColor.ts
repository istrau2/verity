/**
 * Verity Score → color. Ported from `frontend/src/ui/vsColor.ts` so the overlay
 * speaks the same visual language as the web app.
 *
 * `evs` is the effective Verity Score expressed on a [-100, +100] scale
 * (−100 = fully challenged, 0 = contested/neutral, +100 = fully supported).
 */
export function evsToBackground(evs?: number): string {
  if (evs === undefined || Number.isNaN(evs)) return "#ffffff";
  const v = Math.max(-100, Math.min(100, evs)) / 100;
  const red = v < 0 ? 255 : Math.round(255 * (1 - v));
  const green = v > 0 ? 255 : Math.round(255 * (1 + v));
  const blue = 255;
  return `rgb(${red}, ${green}, ${blue})`;
}

/** Underline tint for an in-page claim mark (a saturated take on the VS color). */
export function evsToUnderline(evs?: number): string {
  if (evs === undefined || Number.isNaN(evs)) return "#9ca3af";
  const v = Math.max(-100, Math.min(100, evs)) / 100;
  if (v > 0.05) return "#16a34a";
  if (v < -0.05) return "#dc2626";
  return "#9ca3af";
}

/** Short human label for a score, e.g. "+73 supported" / "contested". */
export function evsLabel(evs?: number, active = true): string {
  if (!active) return "unsettled";
  if (evs === undefined || Number.isNaN(evs)) return "no score";
  if (evs > 5) return `+${Math.round(evs)} supported`;
  if (evs < -5) return `${Math.round(evs)} challenged`;
  return "contested";
}
