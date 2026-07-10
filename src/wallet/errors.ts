/**
 * Turn a wallet/provider/relay error into a short, human-readable message.
 *
 * Injected wallets (MetaMask/Rabby) reject with EIP-1193 error *objects*
 * ({ code, message }) that stringify to "[object Object]", so we pull the
 * message/code out explicitly and special-case user rejection (4001).
 */
export function formatTxError(e: unknown): string {
  const err = e as { code?: unknown; message?: unknown; data?: { message?: unknown } } | undefined;
  const code = err?.code;

  const raw =
    (typeof err?.message === "string" && err.message) ||
    (typeof err?.data?.message === "string" && err.data.message) ||
    (typeof e === "string" ? e : "");

  if (code === 4001 || code === "4001" || /user rejected|user denied|rejected the request/i.test(raw)) {
    return "Transaction cancelled.";
  }
  if (!raw || raw === "[object Object]") return "Something went wrong. Please try again.";
  return raw.slice(0, 160);
}
