// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import type { PhpEnginePort } from '@/application/ports';
import { runTryBlock } from '@/application/usecases';
import { getGitMissionById } from '@/domain/lab';
import type { TryBlock } from '@/domain/trail';
import { NoopAnalytics } from '@/infrastructure/analytics';
import { PgliteEngine } from '@/infrastructure/sql';
import { anomalies } from './anomalies';
import { trailRegistry } from './registry';

/**
 * Laboratório dentro da lição (bloco `try`): a solução de cada desafio precisa passar na
 * própria conferência, com os motores de verdade (PGlite, PHP em WebAssembly e o simulador
 * de Git), e o código que já vem no editor (`starter`) não pode passar sozinho.
 */

type PhpNodeInstance = {
  addEventListener(type: 'output' | 'error', cb: (e: { detail: string[] }) => void): void;
  removeEventListener(type: 'output' | 'error', cb: (e: { detail: string[] }) => void): void;
  run(code: string): Promise<number>;
};

/** Mesmo motor do laboratório (php-wasm), na versão para Node. */
class NodePhpEngine implements PhpEnginePort {
  private php: PhpNodeInstance | null = null;
  async init() {
    if (this.php) return;
    const { PhpNode } = await import('php-wasm/PhpNode');
    this.php = new PhpNode({ version: '8.3' }) as unknown as PhpNodeInstance;
    await this.php.run('<?php');
  }
  async reset() {
    // O laboratório dentro da lição não recria o PHP entre execuções.
  }
  async run(code: string) {
    await this.init();
    let stdout = '';
    let stderr = '';
    const onOut = (e: { detail: string[] }) => (stdout += e.detail.join(''));
    const onErr = (e: { detail: string[] }) => (stderr += e.detail.join(''));
    this.php!.addEventListener('output', onOut);
    this.php!.addEventListener('error', onErr);
    try {
      await this.php!.run(code);
    } finally {
      this.php!.removeEventListener('output', onOut);
      this.php!.removeEventListener('error', onErr);
    }
    return { stdout, stderr };
  }
}

const tries = trailRegistry.flatMap((trail) =>
  trail.modules.flatMap((module) =>
    module.blocks
      .filter((b): b is TryBlock => b.t === 'try')
      .map((block, i) => ({ where: `${trail.id}/${module.id} #${i + 1}`, block })),
  ),
).concat(
  anomalies
    .filter((a) => 't' in a.challenge)
    .map((a) => ({ where: `anomalia ${a.id}`, block: a.challenge as TryBlock })),
);

describe('blocos try: a solução passa e o começo não', () => {
  const deps = { sqlEngine: new PgliteEngine(), phpEngine: new NodePhpEngine(), analytics: new NoopAnalytics() };

  beforeAll(async () => {
    await deps.sqlEngine.init();
  }, 60000);

  it('existe pelo menos um (senão este teste não protege nada)', () => {
    expect(tries.length).toBeGreaterThan(0);
  });

  for (const { where, block } of tries) {
    it(`${where} (${block.engine})`, async () => {
      if (block.engine === 'git') expect(getGitMissionById(block.mission ?? ''), 'missão Git inexistente').toBeDefined();
      const solved = await runTryBlock(deps, block, block.solution ?? '');
      expect(solved.verdict).toEqual({ ok: true });
      const start = await runTryBlock(deps, block, block.starter);
      expect(start.verdict.ok).toBe(false);
    }, 60000);
  }
});
