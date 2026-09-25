/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Chave pública do projeto PostHog (eventos). Ausente = eventos desligados. Ver `config/analytics.ts`. */
  readonly VITE_POSTHOG_KEY?: string;
  /** Endereço de ingestão do PostHog (região do projeto). Ver `config/analytics.ts`. */
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
