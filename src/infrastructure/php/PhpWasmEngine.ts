import type { PhpEnginePort, PhpRunResult } from '@/application/ports';

type PhpOutputEvent = { detail: string[] };

type PhpWebInstance = {
  addEventListener(type: 'output' | 'error', cb: (e: PhpOutputEvent) => void): void;
  removeEventListener(type: 'output' | 'error', cb: (e: PhpOutputEvent) => void): void;
  run(code: string): Promise<number>;
};

/**
 * Implementação de PhpEnginePort sobre o `php-wasm` (PHP 8.3 em WebAssembly, rodando
 * inteiramente no navegador, sem back-end). Carregado só sob demanda (dynamic import),
 * nunca no bundle inicial — mesmo padrão de PgliteEngine (que faz o mesmo com o
 * PostgreSQL). A primeira execução já força o carregamento do binário (~13 MB, como o
 * PGlite), para as próximas rodarem instantâneas.
 */
export class PhpWasmEngine implements PhpEnginePort {
  private php: PhpWebInstance | null = null;
  private loading: Promise<PhpWebInstance> | null = null;

  async init(): Promise<void> {
    await this.ensurePhp();
  }

  private ensurePhp(): Promise<PhpWebInstance> {
    if (this.php) return Promise.resolve(this.php);
    if (!this.loading) {
      this.loading = (async () => {
        const { PhpWeb } = await import('php-wasm/PhpWeb');
        const php = new PhpWeb({ version: '8.3' }) as unknown as PhpWebInstance;
        await php.run('<?php'); // força o carregamento do binário na hora certa (barra de progresso)
        this.php = php;
        return php;
      })();
    }
    return this.loading;
  }

  async run(code: string): Promise<PhpRunResult> {
    const php = await this.ensurePhp();
    let stdout = '';
    let stderr = '';
    const onOutput = (e: PhpOutputEvent) => {
      stdout += e.detail.join('');
    };
    const onError = (e: PhpOutputEvent) => {
      stderr += e.detail.join('');
    };
    php.addEventListener('output', onOutput);
    php.addEventListener('error', onError);
    try {
      await php.run(code);
    } finally {
      php.removeEventListener('output', onOutput);
      php.removeEventListener('error', onError);
    }
    return { stdout, stderr };
  }
}
