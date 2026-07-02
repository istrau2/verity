/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_BASE?: string;
  readonly VITE_VERITY_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
