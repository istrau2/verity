/**
 * Build-time environment config for the Verity extension.
 *
 * Values come from Vite env files (`.env.<mode>`) selected via `--env <name>`
 * (mapped to Vite's `--mode` by scripts/run.mjs) and inlined through
 * `import.meta.env` at build time. Fallbacks target a local dev setup.
 */
export const env = {
  mode: import.meta.env.MODE,
  /** Main Verisphere app backend: claims, relay, token, on-chain dedup. */
  appApiBase: import.meta.env.VITE_APP_API_BASE ?? "http://localhost:8070/api",
  /** verity-api: chain-independent atomicity/decomposition service. */
  verityApiUrl: import.meta.env.VITE_VERITY_API_URL ?? "http://localhost:8790",
} as const;
