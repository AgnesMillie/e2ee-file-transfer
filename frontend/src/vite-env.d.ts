/// <reference types="vite/client" />

// Informa ao TypeScript sobre as variáveis VITE_
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
