import { createEmptyProgress, getOrCreateTrailProgress } from '@/domain/progress';
import { phpLooksLikeError } from '@/domain/lab';
import type { Mission } from '@/domain/trail';
import type { AnalyticsPort, LeaderboardPort, PhpEnginePort, PhpRunResult, ProgressRepository, SqlEnginePort, SqlResultBlock } from '../ports';

export function openLab(deps: { engine: SqlEnginePort; analytics: AnalyticsPort }): Promise<void> {
  deps.analytics.track('lab_opened');
  return deps.engine.init();
}

export async function runLabQuery(
  deps: { engine: SqlEnginePort; analytics: AnalyticsPort },
  sql: string,
): Promise<SqlResultBlock[]> {
  const blocks = await deps.engine.run(sql);
  const ok = !blocks.some((b) => b.kind === 'err');
  deps.analytics.track('lab_query_run', { ok });
  return blocks;
}

export function resetLabDataset(
  deps: { engine: SqlEnginePort },
  dataset: Parameters<SqlEnginePort['reset']>[0],
): Promise<void> {
  return deps.engine.reset(dataset);
}

/** Equivalente de `openLab` para o laboratório de PHP (Ilha da Lógica). Mesmo evento. */
export function openPhpLab(deps: { engine: PhpEnginePort; analytics: AnalyticsPort }): Promise<void> {
  deps.analytics.track('lab_opened');
  return deps.engine.init();
}

/**
 * Equivalente de `runLabQuery` para PHP. "ok" quando o texto que saiu não parece um erro
 * do PHP — o php-wasm nem sempre separa aviso/erro do canal normal de saída (stdout),
 * então a checagem olha o texto inteiro, não só stderr (ver `phpLooksLikeError`).
 */
export async function runPhpCode(
  deps: { engine: PhpEnginePort; analytics: AnalyticsPort },
  code: string,
): Promise<PhpRunResult> {
  const result = await deps.engine.run(code);
  deps.analytics.track('lab_query_run', { ok: !phpLooksLikeError(result.stdout + result.stderr) });
  return result;
}

function stringifyRow(row: unknown[]): string {
  return JSON.stringify(
    row.map((v) => (v === null || v === undefined ? 'NULL' : v instanceof Date ? v.toISOString() : String(v))),
  );
}

/**
 * Marca uma missão como concluída em `ProgressRepository`, sem depender de nenhum
 * motor específico (SQL ou Git). Devolve `true` só quando a missão ainda não estava
 * marcada (para o chamador decidir se dispara o evento `mission_completed`).
 */
function markMissionCompleted(repository: ProgressRepository, trailId: string, missionId: string): boolean {
  const progress = repository.load() ?? createEmptyProgress();
  const trailProgress = getOrCreateTrailProgress(progress, trailId);
  if (trailProgress.missionsCompleted[missionId]) return false;
  repository.save({
    ...progress,
    trails: {
      ...progress.trails,
      [trailId]: {
        ...trailProgress,
        missionsCompleted: { ...trailProgress.missionsCompleted, [missionId]: true },
      },
    },
  });
  return true;
}

/**
 * Equivalente de `verifyMission` para o Laboratório Git: como o motor é síncrono e
 * puro (domain/lab/git.ts já decide se a missão foi cumprida), aqui só falta
 * persistir e disparar a métrica, do mesmo jeito que o laboratório SQL faz.
 */
export function completeGitMission(
  deps: {
    repository: ProgressRepository;
    analytics: AnalyticsPort;
    leaderboard: LeaderboardPort;
    trailId: string;
    traveler: { uuid: string; name: string };
  },
  missionId: string,
): boolean {
  const changed = markMissionCompleted(deps.repository, deps.trailId, missionId);
  if (changed) {
    deps.analytics.track('mission_completed', { mission: missionId });
    void deps.leaderboard.upsertPlayer(deps.traveler.uuid, deps.traveler.name);
    void deps.leaderboard.syncProgress(deps.traveler.uuid, deps.trailId, missionId);
  }
  return changed;
}

export type VerifyMissionResult = { ok: true } | { ok: false; message: string };

/**
 * Roda o SQL do aluno contra o dataset da missão e compara com a solução (kind "select")
 * ou com o estado final esperado do banco (kind "state"). Mesma regra do protótipo original.
 */
export async function verifyMission(
  deps: {
    engine: SqlEnginePort;
    repository: ProgressRepository;
    analytics: AnalyticsPort;
    leaderboard: LeaderboardPort;
    trailId: string;
    traveler: { uuid: string; name: string };
  },
  mission: Mission,
  studentSql: string,
): Promise<VerifyMissionResult> {
  await deps.engine.reset(mission.ds);
  const blocks = await deps.engine.run(studentSql);
  if (blocks.some((b) => b.kind === 'err')) {
    return { ok: false, message: 'Sua consulta deu erro. Leia a mensagem acima, corrija e verifique de novo.' };
  }

  let gotRows: unknown[][];
  let expectedRows: unknown[][];

  if (mission.kind === 'select') {
    const tables = blocks.filter((b): b is Extract<SqlResultBlock, { kind: 'table' }> => b.kind === 'table');
    if (!tables.length) {
      return { ok: false, message: 'Não apareceu nenhuma tabela de resultado. Falta um SELECT?' };
    }
    const got = tables[tables.length - 1];
    const expected = await deps.engine.query(mission.solution);
    if (got.cols.length !== expected.cols.length) {
      return {
        ok: false,
        message: `Seu resultado tem ${got.cols.length} coluna(s) e o esperado tem ${expected.cols.length}. Releia o enunciado.`,
      };
    }
    if (got.rows.length !== expected.rows.length) {
      return {
        ok: false,
        message: `Seu resultado tem ${got.rows.length} linha(s) e o esperado tem ${expected.rows.length}. Confira os filtros.`,
      };
    }
    gotRows = got.rows;
    expectedRows = expected.rows;
  } else {
    const result = await deps.engine.query(mission.verify);
    gotRows = result.rows;
    expectedRows = mission.expect;
  }

  let a = gotRows.map(stringifyRow);
  let b = expectedRows.map(stringifyRow);
  if (mission.kind === 'select' && !mission.ordered) {
    a = [...a].sort();
    b = [...b].sort();
  }
  const same = a.length === b.length && a.every((x, i) => x === b[i]);
  if (!same) {
    return {
      ok: false,
      message:
        mission.kind === 'select'
          ? `As linhas não batem com o esperado. Confira os valores, os filtros${mission.ordered ? ' e a ordem.' : '.'}`
          : 'O estado final do banco não é o esperado. Releia o enunciado e confira se só o necessário mudou.',
    };
  }

  if (markMissionCompleted(deps.repository, deps.trailId, mission.id)) {
    deps.analytics.track('mission_completed', { mission: mission.id });
    void deps.leaderboard.upsertPlayer(deps.traveler.uuid, deps.traveler.name);
    void deps.leaderboard.syncProgress(deps.traveler.uuid, deps.trailId, mission.id);
  }

  return { ok: true };
}
