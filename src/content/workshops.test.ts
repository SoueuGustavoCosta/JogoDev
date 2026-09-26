// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import type { PhpEnginePort } from '@/application/ports';
import { blocksToCode, codeToBlocks, outputMatches, testsToRun, workshopSchema, type WorkshopLang } from '@/domain/workshop';
import { CodeRunner } from '@/infrastructure/runner';
import { jsSandboxMain } from '@/infrastructure/runner/jsSandbox';
import { trailRegistry } from './registry';
import { workshops } from './workshops';

type PhpNodeInstance = {
  addEventListener(type: 'output' | 'error', cb: (e: { detail: string[] }) => void): void;
  removeEventListener(type: 'output' | 'error', cb: (e: { detail: string[] }) => void): void;
  run(code: string): Promise<number>;
  refresh(): Promise<unknown>;
};

/** O mesmo PHP do laboratório (versão Node) e o sandbox de JS da Oficina, rodando aqui. */
function nodePhp(): PhpEnginePort {
  let php: PhpNodeInstance | null = null;
  const engine: PhpEnginePort = {
    async init() {
      if (php) return;
      const { PhpNode } = await import('php-wasm/PhpNode');
      php = new PhpNode({ version: '8.3' }) as unknown as PhpNodeInstance;
      await php.run('<?php');
    },
    async reset() {
      await engine.init();
      await (php as PhpNodeInstance).refresh();
    },
    async run(code: string) {
      await engine.init();
      const p = php as PhpNodeInstance;
      let stdout = '';
      const o = (e: { detail: string[] }) => (stdout += e.detail.join(''));
      p.addEventListener('output', o);
      try {
        await p.run(code);
      } finally {
        p.removeEventListener('output', o);
      }
      return { stdout, stderr: '' };
    },
  };
  return engine;
}

function inThreadWorker() {
  const scope: Record<string, unknown> = {};
  const worker = {
    onmessage: null as null | ((e: { data: { output: string; error: string | null } }) => void),
    onerror: null,
    postMessage: (program: string) => (scope.onmessage as (e: { data: string }) => void)({ data: program }),
    terminate: () => undefined,
  };
  scope.postMessage = (data: { output: string; error: string | null }) => worker.onmessage?.({ data });
  jsSandboxMain(scope);
  return worker;
}

describe('Oficinas do Viajante (content/workshops)', () => {
  const runner = new CodeRunner(nodePhp(), inThreadWorker, 5000);
  beforeAll(async () => runner.prepare('php'), 60000);

  it('6 oficinas iniciais de nível Base, ids únicos, formato válido', () => {
    expect(workshops.length).toBeGreaterThanOrEqual(6);
    expect(new Set(workshops.map((w) => w.id)).size).toBe(workshops.length);
    for (const w of workshops) {
      const r = workshopSchema.safeParse(w);
      expect(r.success, r.success ? w.id : r.error.message).toBe(true);
    }
  });

  it('só oferece linguagens que rodam no navegador; módulo relacionado existe', () => {
    for (const w of workshops) {
      for (const lang of w.languages) expect(runner.supports(lang), `${w.id}: ${lang}`).toBe(true);
      if (w.after) {
        const trail = trailRegistry.find((t) => t.id === w.after?.trailId);
        expect(trail?.modules.some((m) => m.id === w.after?.moduleId), `${w.id}: ${w.after.trailId}/${w.after.moduleId}`).toBe(true);
      }
    }
  });

  for (const w of workshops) {
    for (const lang of w.languages as WorkshopLang[]) {
      it(`${w.id} (${lang}): todas as soluções passam nos testes visíveis e surpresa`, async () => {
        for (const solution of w.solutions[lang] ?? []) {
          for (const { test } of testsToRun(w, false)) {
            const r = await runner.run(lang, solution.code, test.inputs);
            expect(r.error, `${solution.title} ${JSON.stringify(test.inputs)}`).toBeNull();
            expect(outputMatches(r.output, test.expected), `${solution.title} ${JSON.stringify(test.inputs)}: saiu ${JSON.stringify(r.output)}`).toBe(true);
          }
        }
      }, 30000);

      if (w.extra) {
        it(`${w.id} (${lang}): pelo menos uma solução resolve o desafio extra`, async () => {
          let ok = false;
          for (const solution of w.solutions[lang] ?? []) {
            let all = true;
            for (const test of w.extra?.tests ?? []) {
              const r = await runner.run(lang, solution.code, test.inputs);
              if (r.error || !outputMatches(r.output, test.expected)) all = false;
            }
            ok ||= all;
          }
          expect(ok).toBe(true);
        }, 30000);
      }

      it(`${w.id} (${lang}): a paleta de blocos monta uma solução que passa em tudo`, async () => {
        const palette = w.palettes?.[lang];
        expect(palette, 'sem paleta de blocos').toBeDefined();
        const fits = (w.solutions[lang] ?? []).map((s) => codeToBlocks(palette!, s.code)).find((r) => r.ok);
        expect(fits, 'nenhuma solução de referência cabe na paleta').toBeDefined();
        if (!fits?.ok) return;
        const code = blocksToCode(lang, palette!, fits.placed);
        for (const { test } of testsToRun(w, false)) {
          const r = await runner.run(lang, code, test.inputs);
          expect(outputMatches(r.output, test.expected), `${JSON.stringify(test.inputs)}: ${JSON.stringify(r.output)} ${r.error}`).toBe(true);
        }
      }, 30000);

      it(`${w.id} (${lang}): um código vazio não passa (o teste protege de verdade)`, async () => {
        const r = await runner.run(lang, '', w.tests[0].inputs);
        expect(outputMatches(r.output, w.tests[0].expected)).toBe(false);
      });
    }
  }
});
