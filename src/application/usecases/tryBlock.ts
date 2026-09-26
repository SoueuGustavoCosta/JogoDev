import { getGitMissionById, phpLooksLikeError, runGitScript, type GitOutputLine } from '@/domain/lab';
import type { TryBlock, TryEngine } from '@/domain/trail';
import type { AnalyticsPort, PhpEnginePort, SqlEnginePort, SqlResultBlock } from '../ports';
import { checkSqlResult, type SqlCheck, type VerifyMissionResult } from './lab';

/**
 * Laboratório dentro da lição (bloco `try`, Etapa 6). Os motores são os mesmos do
 * laboratório (PGlite, PHP em WebAssembly e o simulador de Git), e a conferência é a mesma
 * das missões: nada de motor novo.
 */
export type TryDeps = { sqlEngine: SqlEnginePort; phpEngine: PhpEnginePort; analytics: AnalyticsPort };

export type TryRunResult =
  | { engine: 'sql'; blocks: SqlResultBlock[]; verdict: VerifyMissionResult }
  | { engine: 'php'; stdout: string; stderr: string; verdict: VerifyMissionResult }
  | { engine: 'git'; lines: GitOutputLine[]; verdict: VerifyMissionResult };

/** Carrega o motor do bloco (só quando a tela aparece: PGlite e PHP pesam vários MB). */
export function prepareTryEngine(deps: TryDeps, engine: TryEngine): Promise<void> {
  if (engine === 'sql') return deps.sqlEngine.init();
  if (engine === 'php') return deps.phpEngine.init();
  return Promise.resolve();
}

function sqlCheckOf(block: TryBlock): SqlCheck {
  if (block.solution) return { kind: 'select', solution: block.solution, ordered: block.ordered };
  return { kind: 'state', verify: block.verify ?? '', expect: block.expect ?? [] };
}

export async function runTryBlock(deps: TryDeps, block: TryBlock, code: string): Promise<TryRunResult> {
  if (block.engine === 'sql') {
    await deps.sqlEngine.reset(block.ds ?? 'loja');
    const blocks = await deps.sqlEngine.run(code);
    const verdict = await checkSqlResult(deps.sqlEngine, sqlCheckOf(block), blocks);
    deps.analytics.track('lab_query_run', { ok: !blocks.some((b) => b.kind === 'err') });
    return { engine: 'sql', blocks, verdict };
  }

  if (block.engine === 'php') {
    const got = await deps.phpEngine.run(code);
    const expected = await deps.phpEngine.run(block.solution ?? '');
    const failed = phpLooksLikeError(got.stdout + got.stderr);
    deps.analytics.track('lab_query_run', { ok: !failed });
    const verdict: VerifyMissionResult = failed
      ? { ok: false, message: 'O PHP reclamou. Leia a mensagem, corrija e rode de novo.' }
      : got.stdout.trim() === expected.stdout.trim()
        ? { ok: true }
        : { ok: false, message: 'A saída não bateu com o esperado. Compare com o que o desafio pede.' };
    return { engine: 'php', stdout: got.stdout, stderr: got.stderr, verdict };
  }

  const { state, lines } = runGitScript(block.repo ?? 'vazio', code);
  const mission = block.mission ? getGitMissionById(block.mission) : undefined;
  const ok = !!mission && mission.check(state);
  deps.analytics.track('lab_query_run', { ok: !lines.some((l) => l.cls === 'tl-err') });
  return {
    engine: 'git',
    lines,
    verdict: ok ? { ok: true } : { ok: false, message: 'Ainda não chegou lá. Confira os comandos e a ordem deles.' },
  };
}
