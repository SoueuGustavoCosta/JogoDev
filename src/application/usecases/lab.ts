import { createEmptyProgress, getOrCreateTrailProgress } from '@/domain/progress';
import type { Mission } from '@/domain/trail';
import type { AnalyticsPort, ProgressRepository, SqlEnginePort, SqlResultBlock } from '../ports';

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

function stringifyRow(row: unknown[]): string {
  return JSON.stringify(
    row.map((v) => (v === null || v === undefined ? 'NULL' : v instanceof Date ? v.toISOString() : String(v))),
  );
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
    trailId: string;
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

  const progress = deps.repository.load() ?? createEmptyProgress();
  const trailProgress = getOrCreateTrailProgress(progress, deps.trailId);
  if (!trailProgress.missionsCompleted[mission.id]) {
    deps.repository.save({
      ...progress,
      trails: {
        ...progress.trails,
        [deps.trailId]: {
          ...trailProgress,
          missionsCompleted: { ...trailProgress.missionsCompleted, [mission.id]: true },
        },
      },
    });
    deps.analytics.track('mission_completed', { mission: mission.id });
  }

  return { ok: true };
}
