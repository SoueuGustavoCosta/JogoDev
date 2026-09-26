import { describe, expect, it } from 'vitest';
import type { TryBlock } from '@/domain/trail';
import { PgliteEngine } from '@/infrastructure/sql';
import type { AnalyticsPort, PhpEnginePort } from '../ports';
import { runTryBlock } from './tryBlock';

class RecordingAnalytics implements AnalyticsPort {
  events: { event: string; props?: Record<string, unknown> }[] = [];
  track(event: string, props?: Record<string, unknown>) {
    this.events.push({ event, props });
  }
}

/** PHP falso: "roda" devolvendo o que vier depois de echo, entre aspas. */
class FakePhp implements PhpEnginePort {
  async init() {}
  async reset() {}
  async run(code: string) {
    if (code.includes('erro')) return { stdout: 'PHP Parse error: syntax error', stderr: '' };
    return { stdout: /echo "([^"]*)"/.exec(code)?.[1] ?? '', stderr: '' };
  }
}

const sqlEngine = new PgliteEngine();
const deps = () => ({ sqlEngine, phpEngine: new FakePhp(), analytics: new RecordingAnalytics() });

const semEstoque: TryBlock = {
  t: 'try',
  engine: 'sql',
  brief: 'Mostre só os produtos sem estoque',
  starter: 'SELECT nome\nFROM produtos\n',
  hint: 'WHERE estoque = 0',
  ds: 'loja',
  solution: 'SELECT nome FROM produtos WHERE estoque = 0;',
};

describe('runTryBlock: SQL (mesma regra das missões)', () => {
  it('bate com o esperado', async () => {
    const d = deps();
    const r = await runTryBlock(d, semEstoque, 'SELECT nome FROM produtos WHERE estoque = 0;');
    expect(r.verdict).toEqual({ ok: true });
    expect(r.engine === 'sql' && r.blocks.some((b) => b.kind === 'table')).toBe(true);
    expect(d.analytics.events).toEqual([{ event: 'lab_query_run', props: { ok: true } }]);
  }, 60000);

  it('linhas diferentes: explica o que conferir', async () => {
    const r = await runTryBlock(deps(), semEstoque, 'SELECT nome FROM produtos;');
    expect(r.verdict.ok).toBe(false);
    expect(!r.verdict.ok && r.verdict.message).toMatch(/linha/);
  }, 60000);

  it('erro de SQL não passa e conta como consulta com erro', async () => {
    const d = deps();
    const r = await runTryBlock(d, semEstoque, 'SELEC nome FROM produtos;');
    expect(r.verdict.ok).toBe(false);
    expect(d.analytics.events[0].props).toEqual({ ok: false });
  }, 60000);

  it('confere pelo estado final (verify + expect)', async () => {
    const block: TryBlock = { ...semEstoque, solution: undefined, verify: "SELECT estoque FROM produtos WHERE nome = 'Teclado Compacto';", expect: [['10']] };
    expect((await runTryBlock(deps(), block, "UPDATE produtos SET estoque = 10 WHERE nome = 'Teclado Compacto';")).verdict).toEqual({ ok: true });
    expect((await runTryBlock(deps(), block, 'SELECT 1;')).verdict.ok).toBe(false);
  }, 60000);

  it('cada rodada começa do conjunto de dados limpo', async () => {
    const block: TryBlock = { ...semEstoque, solution: 'SELECT COUNT(*) FROM produtos;' };
    await runTryBlock(deps(), block, 'DELETE FROM produtos WHERE id = 1;');
    const r = await runTryBlock(deps(), block, 'SELECT COUNT(*) FROM produtos;');
    expect(r.engine === 'sql' && r.blocks.at(-1)).toMatchObject({ kind: 'table', rows: [[4]] });
  }, 60000);
});

describe('runTryBlock: PHP (saída igual à da solução)', () => {
  const block: TryBlock = { t: 'try', engine: 'php', brief: 'Diga oi', starter: '<?php\n', hint: 'echo', solution: '<?php echo "oi";' };
  it('mesma saída passa; outra saída ou erro não', async () => {
    expect((await runTryBlock(deps(), block, '<?php echo "oi";')).verdict).toEqual({ ok: true });
    expect((await runTryBlock(deps(), block, '<?php echo "tchau";')).verdict.ok).toBe(false);
    expect((await runTryBlock(deps(), block, '<?php erro')).verdict.ok).toBe(false);
  });
});

describe('runTryBlock: Git (missões do laboratório Git)', () => {
  const block: TryBlock = {
    t: 'try', engine: 'git', brief: 'Primeiro commit', starter: 'git init\n', hint: 'git add .', repo: 'projeto', mission: 'm2',
    solution: 'git init\ngit add .\ngit commit -m "primeiro"',
  };
  it('cumpre a missão só com o commit', async () => {
    expect((await runTryBlock(deps(), block, block.solution!)).verdict).toEqual({ ok: true });
    const r = await runTryBlock(deps(), block, 'git init\ngit add .');
    expect(r.verdict.ok).toBe(false);
    expect(r.engine === 'git' && r.lines.length).toBeGreaterThan(0);
  });
});
