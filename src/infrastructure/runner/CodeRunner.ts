import type { CodeRunnerPort, CodeRunResult, PhpEnginePort } from '@/application/ports';
import { inputsPreamble, stripPhpOpenTag, type WorkshopLang, type WorkshopValue } from '@/domain/workshop';
import { jsSandboxMain } from './jsSandbox';

/** Limite de tempo por teste (laço sem fim não pode travar o celular). */
export const RUN_TIMEOUT_MS = 2000;

const TIME_UP = '__TEMPO_ESGOTADO__';

/**
 * Guarda de tempo do PHP: o php-wasm roda na página e não respeita `set_time_limit`, então o
 * código ganha um "tick" que para a execução depois do limite. Tudo numa linha só, para a
 * numeração das linhas do viajante não mudar. (Um laço com o corpo totalmente vazio não gera
 * tick; é raro em exercício e só trava até a pessoa recarregar a página.)
 */
function phpGuard(seconds: number): string {
  return `declare(ticks=1); $__inicio = microtime(true); register_tick_function(function () use ($__inicio) { if (microtime(true) - $__inicio > ${seconds}) { throw new Error('${TIME_UP}'); } });`;
}

/** Monta o programa PHP: guarda + entradas + código do viajante (sem o `<?php` dele). */
export function buildPhpProgram(code: string, inputs: Record<string, WorkshopValue>, seconds = RUN_TIMEOUT_MS / 1000): string {
  return `<?php ${phpGuard(seconds)} ${inputsPreamble('php', inputs)} ${stripPhpOpenTag(code)}`;
}

/** Monta o programa JS: entradas como `var` e o código do viajante num bloco (pode usar `let` com o mesmo nome). */
export function buildJsProgram(code: string, inputs: Record<string, WorkshopValue>): string {
  return `${inputsPreamble('js', inputs)}\n{\n${code}\n}`;
}

const PHP_ERROR = /\n?(?:PHP )?(Fatal error|Parse error|Warning|Notice|Deprecated): ([\s\S]*?) in php-wasm run script(?: on line |:)(\d+)[^\n]*(?:\nStack trace:[\s\S]*?thrown in php-wasm run script on line \d+)?\n?/g;

/** Separa a saída do PHP das mensagens de erro/aviso que ele imprime junto. */
export function parsePhpOutput(stdout: string, stderr: string): { output: string; error: string | null; timedOut: boolean } {
  let error: string | null = null;
  let warning: string | null = null;
  let timedOut = false;
  const text = `${stdout}${stderr ? `\n${stderr}` : ''}`;
  const output = text.replace(PHP_ERROR, (_all, kind: string, message: string, line: string) => {
    const clean = message.replace(/^Uncaught (\w+): /, '$1: ').trim();
    if (clean.includes(TIME_UP)) timedOut = true;
    else if (kind === 'Fatal error' || kind === 'Parse error') error ??= `${clean} (linha ${line})`;
    else warning ??= `${clean} (linha ${line})`;
    return '';
  });
  if (!error && !timedOut && warning && output.trim() === '') error = warning;
  return { output, error, timedOut };
}

type WorkerLike = {
  onmessage: ((e: { data: { output: string; error: string | null } }) => void) | null;
  onerror: ((e: { message?: string }) => void) | null;
  postMessage(data: string): void;
  terminate(): void;
};

let workerUrl: string | null = null;
function createSandboxWorker(): WorkerLike {
  if (!workerUrl) {
    const source = `(${jsSandboxMain.toString()})(self);`;
    workerUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  }
  return new Worker(workerUrl) as unknown as WorkerLike;
}

/**
 * Implementação de CodeRunnerPort: PHP no mesmo motor do laboratório (php-wasm), JavaScript
 * num Web Worker novo a cada teste (sem estado entre testes), encerrado se passar do tempo.
 */
export class CodeRunner implements CodeRunnerPort {
  constructor(
    private readonly php: PhpEnginePort,
    private readonly createWorker: () => WorkerLike = createSandboxWorker,
    private readonly timeoutMs = RUN_TIMEOUT_MS,
  ) {}

  supports(lang: WorkshopLang): boolean {
    // TODO(autor): Python com Pyodide carregado sob demanda (não incluído ainda: é pesado).
    return lang === 'php' || lang === 'js';
  }

  async prepare(lang: WorkshopLang): Promise<void> {
    if (lang === 'php') await this.php.init();
  }

  async run(lang: WorkshopLang, code: string, inputs: Record<string, WorkshopValue>): Promise<CodeRunResult> {
    const start = Date.now();
    if (lang === 'php') {
      try {
        const { stdout, stderr } = await this.php.run(buildPhpProgram(code, inputs, this.timeoutMs / 1000));
        return { ...parsePhpOutput(stdout, stderr), timeMs: Date.now() - start };
      } catch (e) {
        return { output: '', error: e instanceof Error ? e.message : String(e), timedOut: false, timeMs: Date.now() - start };
      }
    }
    if (lang === 'js') return this.runJs(buildJsProgram(code, inputs), start);
    return { output: '', error: 'Python ainda não roda na Oficina.', timedOut: false, timeMs: 0 };
  }

  private runJs(program: string, start: number): Promise<CodeRunResult> {
    return new Promise((resolve) => {
      let worker: WorkerLike;
      try {
        worker = this.createWorker();
      } catch (e) {
        resolve({ output: '', error: `Não deu para rodar JavaScript aqui: ${String(e)}`, timedOut: false, timeMs: 0 });
        return;
      }
      const finish = (result: Omit<CodeRunResult, 'timeMs'>) => {
        clearTimeout(timer);
        worker.terminate();
        resolve({ ...result, timeMs: Date.now() - start });
      };
      const timer = setTimeout(() => finish({ output: '', error: null, timedOut: true }), this.timeoutMs);
      worker.onmessage = (e) => finish({ output: e.data.output, error: e.data.error, timedOut: false });
      // Erro de sintaxe do código do viajante chega pelo catch do sandbox; aqui só falhas do próprio Worker.
      worker.onerror = (e) => finish({ output: '', error: e.message ?? 'Erro ao rodar o código.', timedOut: false });
      worker.postMessage(program);
    });
  }
}
