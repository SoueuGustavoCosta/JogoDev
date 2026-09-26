/**
 * Código que roda DENTRO do Web Worker da Oficina (JavaScript do viajante). Fica numa função
 * para poder ser testado fora do navegador; o Worker recebe `(${jsSandboxMain})(self)`.
 * Sem DOM (é um Worker), e sem rede nem armazenamento: essas APIs são apagadas antes de
 * rodar o código. O `console.log` vira a saída.
 */
export function jsSandboxMain(scope: Record<string, unknown>): void {
  const out: string[] = [];
  const format = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value === undefined) return 'undefined';
    if (typeof value === 'object' && value !== null) {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };
  const log = (...args: unknown[]) => {
    out.push(args.map(format).join(' '));
  };
  const post = (scope.postMessage as (data: unknown) => void).bind(scope);
  const sandboxConsole = { log, info: log, warn: log, error: log, debug: log, table: log };
  scope.console = sandboxConsole;
  const blocked = [
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'WebTransport',
    'EventSource',
    'importScripts',
    'indexedDB',
    'caches',
    'BroadcastChannel',
    'Worker',
    'SharedWorker',
    'Request',
    'Response',
    'Headers',
    'navigator',
    'location',
    'localStorage',
    'sessionStorage',
    'postMessage',
  ];
  for (const name of blocked) {
    try {
      Object.defineProperty(scope, name, { value: undefined, writable: false, configurable: false });
    } catch {
      // Se não der para apagar (propriedade travada), segue: continua sem DOM e sem armazenamento de página.
    }
  }
  scope.onmessage = (event: { data: string }) => {
    out.length = 0;
    try {
      // `console` também entra como parâmetro: o código do viajante sempre usa o do sandbox.
      new Function('console', event.data)(sandboxConsole);
      post({ output: out.join('\n'), error: null });
    } catch (err) {
      const e = err as { name?: string; message?: string };
      post({ output: out.join('\n'), error: e && e.message ? `${e.name ?? 'Erro'}: ${e.message}` : String(err) });
    }
  };
}
