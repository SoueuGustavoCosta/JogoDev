// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import type { PhpEnginePort } from '@/application/ports';
import { buildJsProgram, buildPhpProgram, CodeRunner, parsePhpOutput } from './CodeRunner';
import { jsSandboxMain } from './jsSandbox';

type PhpNodeInstance = {
  addEventListener(type: 'output' | 'error', cb: (e: { detail: string[] }) => void): void;
  removeEventListener(type: 'output' | 'error', cb: (e: { detail: string[] }) => void): void;
  run(code: string): Promise<number>;
};

/** O mesmo PHP 8.3 em WebAssembly do laboratório, na versão para Node. */
function nodePhp(): PhpEnginePort {
  let php: PhpNodeInstance | null = null;
  return {
    async init() {
      if (php) return;
      const { PhpNode } = await import('php-wasm/PhpNode');
      php = new PhpNode({ version: '8.3' }) as unknown as PhpNodeInstance;
      await php.run('<?php');
    },
    async run(code: string) {
      await this.init();
      let stdout = '';
      let stderr = '';
      const o = (e: { detail: string[] }) => (stdout += e.detail.join(''));
      const er = (e: { detail: string[] }) => (stderr += e.detail.join(''));
      php!.addEventListener('output', o);
      php!.addEventListener('error', er);
      try {
        await php!.run(code);
      } finally {
        php!.removeEventListener('output', o);
        php!.removeEventListener('error', er);
      }
      return { stdout, stderr };
    },
  };
}

/** "Worker" de mentira: roda o sandbox de verdade na mesma thread (sem isolamento). */
function fakeWorker(respond = true) {
  return () => {
    const scope: Record<string, unknown> = {};
    const worker = {
      onmessage: null as null | ((e: { data: { output: string; error: string | null } }) => void),
      onerror: null,
      terminated: false,
      postMessage(program: string) {
        if (!respond) return;
        (scope.onmessage as (e: { data: string }) => void)({ data: program });
      },
      terminate() {
        worker.terminated = true;
      },
    };
    scope.postMessage = (data: { output: string; error: string | null }) => worker.onmessage?.({ data });
    jsSandboxMain(scope);
    return worker;
  };
}

describe('CodeRunner: PHP (php-wasm)', () => {
  const runner = new CodeRunner(nodePhp(), fakeWorker());
  beforeAll(async () => runner.prepare('php'), 60000);

  it('injeta as entradas antes do código e devolve a saída', async () => {
    const r = await runner.run('php', '<?php\necho $a + $b;', { a: 2, b: 3 });
    expect(r).toMatchObject({ output: '5', error: null, timedOut: false });
    expect((await runner.run('php', 'echo "[$op]";', { op: '*' })).output).toBe('[*]');
  });

  it('erro de sintaxe e erro fatal viram `error` com a linha do viajante', async () => {
    const parse = await runner.run('php', '<?php\necho "a"', {});
    expect(parse.error).toMatch(/syntax error.*\(linha 2\)/);
    const fatal = await runner.run('php', 'echo 1;\necho intdiv(1, 0);', {});
    expect(fatal.output).toBe('1');
    expect(fatal.error).toMatch(/DivisionByZeroError: Division by zero \(linha 2\)/);
  });

  it('laço sem fim para no limite de tempo', async () => {
    const quick = new CodeRunner(nodePhp(), fakeWorker(), 500);
    const r = await quick.run('php', '$i = 0; while (true) { $i++; }', {});
    expect(r.timedOut).toBe(true);
  }, 20000);

  it('aviso sem saída vira erro; com saída, some da saída', () => {
    expect(parsePhpOutput('\nWarning: Undefined variable $x in php-wasm run script on line 1\n', '')).toMatchObject({
      output: '',
      error: 'Undefined variable $x (linha 1)',
    });
    expect(parsePhpOutput('\nWarning: Undefined variable $x in php-wasm run script on line 1\n5', '').output).toBe('5');
  });

  it('o programa fica numa linha antes do código do viajante', () => {
    expect(buildPhpProgram('<?php\necho 1;', { a: 1 }).split('\n')).toHaveLength(2);
    expect(buildJsProgram('console.log(a)', { a: 1 })).toBe('var a = 1;\n{\nconsole.log(a)\n}');
  });
});

describe('CodeRunner: JavaScript (sandbox do Worker)', () => {
  it('console.log vira a saída; entradas como variáveis; pode redeclarar com let', async () => {
    const runner = new CodeRunner(nodePhp(), fakeWorker());
    expect((await runner.run('js', 'console.log(a * b)', { a: 6, b: 7 })).output).toBe('42');
    expect((await runner.run('js', 'let a = 1; console.log(a, [1, 2], { x: 1 })', { a: 9 })).output).toBe('1 [1,2] {"x":1}');
  });

  it('erro do código vira `error`, com o que saiu antes', async () => {
    const runner = new CodeRunner(nodePhp(), fakeWorker());
    const r = await runner.run('js', 'console.log("oi"); naoExiste();', {});
    expect(r).toMatchObject({ output: 'oi', error: 'ReferenceError: naoExiste is not defined', timedOut: false });
    expect((await runner.run('js', 'console.log(', {})).error).toMatch(/^SyntaxError/);
  });

  it('sem rede nem armazenamento dentro do sandbox', async () => {
    const runner = new CodeRunner(nodePhp(), fakeWorker());
    const r = await runner.run('js', 'console.log(typeof fetch, typeof indexedDB, typeof XMLHttpRequest)', {});
    // No teste o sandbox não é um Worker de verdade: as globais do Node continuam; no Worker
    // do navegador, o sandbox apaga as do escopo dele (conferido no navegador).
    expect(r.error).toBeNull();
    const scope: Record<string, unknown> = { postMessage: () => undefined, fetch: () => 1 };
    jsSandboxMain(scope);
    expect(scope.fetch).toBeUndefined();
    expect(scope.postMessage).toBeUndefined();
  });

  it('laço sem fim: o Worker é encerrado no limite de tempo', async () => {
    const runner = new CodeRunner(nodePhp(), fakeWorker(false), 50);
    const r = await runner.run('js', 'while (true) {}', {});
    expect(r).toMatchObject({ timedOut: true, output: '' });
  });

  it('Python ainda não é oferecido', () => {
    expect(new CodeRunner(nodePhp()).supports('python')).toBe(false);
    expect(new CodeRunner(nodePhp()).supports('js')).toBe(true);
  });
});
