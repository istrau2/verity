import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Verity — Truth-staking for Wikipedia",
  version: "0.1.0",
  description:
    "Highlights stakeable factual claims on Wikipedia, shows their on-chain Verity Score, and lets you stake or create claims.",
  action: {
    default_title: "Verity",
    default_popup: "src/popup/index.html",
  },
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["*://*.wikipedia.org/wiki/*"],
      js: ["src/content/index.tsx"],
      run_at: "document_idle",
    },
    {
      // MAIN-world bridge to the page's injected wallet (window.ethereum).
      matches: ["*://*.wikipedia.org/wiki/*"],
      js: ["src/inpage/index.ts"],
      run_at: "document_start",
      world: "MAIN",
    },
  ],
  // Pages the overlay runs on, plus the backends it calls (app API + verity-api).
  // Includes both local dev and prod hosts so a single build works per env;
  // replace the *.verisphere.example placeholders with your real domains.
  host_permissions: [
    "*://*.wikipedia.org/*",
    "http://localhost:8070/*",
    "http://localhost:8790/*",
    "https://api.verisphere.example/*",
    "https://verity-api.verisphere.example/*",
    "https://verisphere.co/api/*",
    "https://test.verisphere.co/api/*",
  ],
  permissions: ["storage", "activeTab"],
});
