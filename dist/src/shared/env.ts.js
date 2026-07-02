import.meta.env = {"BASE_URL": "/", "DEV": true, "MODE": "dev", "PROD": false, "SSR": false, "VITE_APP_API_BASE": "https://test.verisphere.co/api", "VITE_VERITY_API_URL": "http://localhost:8790"};export const env = {
  mode: import.meta.env.MODE,
  /** Main Verisphere app backend: claims, relay, token, on-chain dedup. */
  appApiBase: import.meta.env.VITE_APP_API_BASE ?? "http://localhost:8070/api",
  /** verity-api: chain-independent atomicity/decomposition service. */
  verityApiUrl: import.meta.env.VITE_VERITY_API_URL ?? "http://localhost:8790"
};
