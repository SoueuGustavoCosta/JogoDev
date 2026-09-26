// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import type { OutputQuizItem } from '@/domain/trail';
import { PgliteEngine } from '@/infrastructure/sql';
import { trailRegistry } from './registry';

/**
 * Pergunta "o que aparece na tela?" (`kind: 'output'`) precisa estar certa de verdade: o
 * código de PHP roda aqui no mesmo PHP em WebAssembly do laboratório, e a saída tem que ser
 * exatamente a opção marcada como certa. SQL roda no PGlite do laboratório, sobre a "Loja de
 * exemplo" recém-criada: a resposta é o resultado da última consulta (uma coluna; várias
 * linhas viram "a, b, c"). Python e Java não rodam no navegador: essas ficam na lista para o
 * autor conferir à mão (docs/engajamento/conferir-output.md).
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
  const sql = new PgliteEngine();

  beforeAll(async () => {
    const { PhpNode } = await import('php-wasm/PhpNode');
    php = new PhpNode({ version: '8.3' }) as unknown as PhpNodeInstance;
    await php.run('<?php');
    await sql.init();
  }, 60000);

  async function runSql(code: string): Promise<string> {
    await sql.reset('loja');
    const blocks = await sql.run(code);
    const error = blocks.find((b) => b.kind === 'err');
    if (error && error.kind === 'err') return `Erro: ${error.msg}`;
    const table = [...blocks].reverse().find((b) => b.kind === 'table');
    if (!table || table.kind !== 'table') return '';
    return table.rows.map((row) => row.map((cell) => String(cell)).join(' | ')).join(', ');
  }

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
      expect(['php', 'sql', 'python', 'java'], `linguagem sem conferência: ${item.lang}`).toContain(item.lang);
      if (item.lang !== 'php' && item.lang !== 'sql') return; // conferidas à mão (docs/engajamento/conferir-output.md)
      const out = item.lang === 'php' ? await runPhp(item.code) : await runSql(item.code);
      expect(out.trim()).toBe(item.options[item.answer].trim());
    });
  }
});
