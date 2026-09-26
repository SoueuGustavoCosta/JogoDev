// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import type { OutputQuizItem } from '@/domain/trail';
import { trailRegistry } from './registry';

/**
 * Pergunta "o que aparece na tela?" (`kind: 'output'`) precisa estar certa de verdade: o
 * código de PHP roda aqui no mesmo PHP em WebAssembly do laboratório, e a saída tem que ser
 * exatamente a opção marcada como certa. Python e Java não rodam no navegador: essas ficam
 * na lista para o autor conferir à mão (docs/engajamento/conferir-output.md).
 */

type PhpNodeInstance = {
  addEventListener(type: 'output', cb: (e: { detail: string[] }) => void): void;
  removeEventListener(type: 'output', cb: (e: { detail: string[] }) => void): void;
  run(code: string): Promise<number>;
};

const outputs = trailRegistry.flatMap((trail) =>
  trail.modules.flatMap((module) =>
    module.quiz
      .filter((item): item is OutputQuizItem => item.kind === 'output')
      .map((item) => ({ where: `${trail.id}/${module.id}/${item.id}`, item })),
  ),
);

describe('perguntas "o que aparece na tela?"', () => {
  let php: PhpNodeInstance;

  beforeAll(async () => {
    const { PhpNode } = await import('php-wasm/PhpNode');
    php = new PhpNode({ version: '8.3' }) as unknown as PhpNodeInstance;
    await php.run('<?php');
  }, 60000);

  async function runPhp(code: string): Promise<string> {
    let out = '';
    const onOutput = (e: { detail: string[] }) => {
      out += e.detail.join('');
    };
    php.addEventListener('output', onOutput);
    try {
      await php.run(code);
    } finally {
      php.removeEventListener('output', onOutput);
    }
    return out;
  }

  it('existe pelo menos uma (senão este teste não protege nada)', () => {
    expect(outputs.length).toBeGreaterThan(0);
  });

  for (const { where, item } of outputs) {
    it(`${where} (${item.lang})`, async () => {
      expect(['php', 'python', 'java'], `linguagem sem conferência: ${item.lang}`).toContain(item.lang);
      if (item.lang !== 'php') return; // conferidas à mão (lista em docs/engajamento/conferir-output.md)
      const out = await runPhp(item.code);
      expect(out.trim()).toBe(item.options[item.answer].trim());
    });
  }
});
