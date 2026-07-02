export function fmtVsp(n, dp = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString(void 0, {
    minimumFractionDigits: 0,
    maximumFractionDigits: dp
  });
}
export function shortAddr(a) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
