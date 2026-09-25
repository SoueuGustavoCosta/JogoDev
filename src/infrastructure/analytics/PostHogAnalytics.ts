import type { AnalyticsEventName, AnalyticsPort, AnalyticsProps } from '@/application/ports';

/** Mesmo formato do segundo argumento de `fetch`. */
export type FetchInit = NonNullable<Parameters<typeof fetch>[1]>;
type Fetch = (input: string, init: FetchInit) => Promise<unknown>;

export type PostHogOptions = {
  /** Chave pública do projeto (`phc_...`). */
  apiKey: string;
  /** Endereço de ingestão, ex.: `https://us.i.posthog.com`. */
  host: string;
  /** Injetável para teste. Padrão: `fetch` do navegador. */
  fetchFn?: Fetch;
  /** Injetável para teste. Padrão: um id aleatório novo a cada carregamento da página. */
  sessionId?: string;
};

function randomId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * Adaptador do PostHog (plano gratuito) sem a biblioteca oficial: um POST por evento na
 * API pública de captura. Escolha de propósito, para cumprir a seção 6 do CLAUDE.md sem
 * depender de configurar a biblioteca certo e sem somar peso ao bundle do celular:
 *
 * - **Sem cookies e sem armazenamento:** nada é gravado no navegador. O `distinct_id` é um
 *   id aleatório que só vive na memória desta aba (recarregou, é outro), então não dá para
 *   seguir uma pessoa entre visitas.
 * - **Sem perfil de pessoa** (`$process_person_profile: false`) e **sem localização por IP**
 *   (`$geoip_disable: true`). Descartar o IP em si é uma opção do projeto no painel do
 *   PostHog ("Discard client IP data"), que precisa estar ligada (ver README).
 * - **Sem autocapture, sem gravação de sessão**: só os eventos que o app manda explicitamente.
 * - Falha silenciosa: sem rede ou com o PostHog fora do ar, o app segue normal.
 *
 * `keepalive` deixa o evento sair mesmo se a aba estiver fechando (é o caso de
 * `module_left`), e `text/plain` evita a requisição extra de CORS (preflight).
 */
export class PostHogAnalytics implements AnalyticsPort {
  private readonly endpoint: string;
  private readonly fetchFn: Fetch;
  private readonly sessionId: string;

  constructor(private readonly options: PostHogOptions) {
    this.endpoint = `${options.host.replace(/\/+$/, '')}/i/v0/e/`;
    this.fetchFn = options.fetchFn ?? ((input, init) => fetch(input, init));
    this.sessionId = options.sessionId ?? randomId();
  }

  track(event: AnalyticsEventName, props?: AnalyticsProps): void {
    const body = JSON.stringify({
      api_key: this.options.apiKey,
      event,
      distinct_id: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        ...props,
        $process_person_profile: false,
        $geoip_disable: true,
        $lib: 'jogodev',
        // Só o caminho da rota (ex.: /trilhas/logica/modulos/variaveis): nunca query nem hash.
        $pathname: typeof location === 'undefined' ? undefined : location.pathname,
      },
    });
    try {
      void this.fetchFn(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body,
        keepalive: true,
        credentials: 'omit',
      }).catch(() => {
        // Métrica nunca derruba o app.
      });
    } catch {
      // Idem: navegador sem fetch, keepalive recusado etc.
    }
  }
}
