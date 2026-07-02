import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./src/manifest";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  // CRXJS serves the content-script HMR client over a fixed port.
  server: { port: 5178, strictPort: true, hmr: { port: 5178 } },
});
