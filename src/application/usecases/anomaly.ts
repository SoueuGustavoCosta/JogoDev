import {
  ANOMALY_FRAGMENTS,
  ANOMALY_XP,
  anomalyDay,
  anomalyNumber,
  msUntilNextAnomaly,
  pickAnomaly,
  type Anomaly,
} from '@/domain/anomaly';
import { createEmptyProgress, recordAnomaly, type AnomalyResult, type Progress } from '@/domain/progress';
import { bonusXp } from '@/domain/events';
import { paginateModule, type Trail } from '@/domain/trail';
import type { AnalyticsPort, LeaderboardPort, ProgressRepository } from '../ports';
import { syncWeeklyXp } from './league';
import { recordPlayedDay, type PlayedDay } from './timeline';

export type DailyAnomaly = {
  day: string;
  /** "anomalia #127". */
  number: number;
  anomaly: Anomaly;
  fallback: boolean;
  /** Registro de hoje, se o viajante já consertou. */
  solved: AnomalyResult | null;
  /** Até a meia-noite de São Paulo, quando a anomalia troca. */
  closesInMs: number;
  reward: { xp: number; fragments: number };
};

/** Eras em que o viajante já mexeu (algum módulo com resposta, tela ou conclusão). */
function openedEras(progress: Progress): Set<string> {
  const eras = new Set<string>();
  for (const [trailId, trail] of Object.entries(progress.trails ?? {})) {
    const touched = Object.values(trail?.modules ?? {}).some(
      (m) => m && (m.completed || m.screen !== undefined || Object.keys(m.quizResults ?? {}).length > 0),
    );
    if (touched) eras.add(trailId);
  }
  return eras;
}

export function getDailyAnomaly(
  deps: { repository: ProgressRepository },
  params: { pool: readonly Anomaly[]; now?: Date; xpMultiplier?: number },
): DailyAnomaly {
  const now = params.now ?? new Date();
  const progress = deps.repository.load() ?? createEmptyProgress();
  const day = anomalyDay(now);
  const { anomaly, fallback } = pickAnomaly(day, params.pool, openedEras(progress));
  return {
    day,
    number: anomalyNumber(day),
    anomaly,
    fallback,
    solved: progress.anomalies?.[day] ?? null,
    closesInMs: msUntilNextAnomaly(now),
    reward: { xp: ANOMALY_XP + bonusXp(ANOMALY_XP, params.xpMultiplier ?? 1), fragments: ANOMALY_FRAGMENTS },
  };
}

export function openAnomaly(deps: { analytics: AnalyticsPort }, anomalyId: string): void {
  deps.analytics.track('anomaly_opened', { anomaly: anomalyId });
}

export type SolveAnomalyResult = {
  added: boolean;
  xp: number;
  fragments: number;
  /** Como ficou a Linha do Tempo (consertar a anomalia conta como dia jogado). */
  timeline?: PlayedDay;
};

/**
 * Registra a anomalia do dia como consertada: recompensa no progresso (uma vez por dia),
 * evento e, em segundo plano, a linha na tabela da turma (contagem pública). Sem rede ou
 * sem Supabase, só a parte remota falha em silêncio.
 */
export function solveAnomaly(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort; leaderboard: LeaderboardPort },
  params: { day: string; anomaly: Anomaly; tries: number; now?: Date; xpMultiplier?: number },
): SolveAnomalyResult {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const result: AnomalyResult = {
    anomalyId: params.anomaly.id,
    tries: Math.max(1, params.tries),
    solvedAt: (params.now ?? new Date()).toISOString(),
    // Surto Temporal: o XP da anomalia já fica gravado multiplicado no registro do dia.
    xp: ANOMALY_XP + bonusXp(ANOMALY_XP, params.xpMultiplier ?? 1),
    fragments: ANOMALY_FRAGMENTS,
  };
  const { progress: next, added } = recordAnomaly(progress, params.day, result);
  if (!added) return { added: false, xp: 0, fragments: 0 };
  deps.repository.save(next);
  deps.analytics.track('anomaly_solved', { anomaly: params.anomaly.id, tries: result.tries });
  if (next.travelerUuid) {
    void deps.leaderboard.recordAnomalySolved(next.travelerUuid, params.anomaly.id, params.day).catch(() => undefined);
  }
  const timeline = recordPlayedDay(deps, params.now);
  // O XP da anomalia conta na semana da Liga (sai de `anomalies`); sobe para o ranking.
  syncWeeklyXp(deps, params.now);
  return { added: true, xp: result.xp, fragments: result.fragments, timeline };
}

/** "N viajantes já consertaram" (sem nomes). `null` = não dá pra saber (offline). */
export async function countAnomalySolvers(deps: { leaderboard: LeaderboardPort }, day: string): Promise<number | null> {
  try {
    return await deps.leaderboard.countAnomalySolved(day);
  } catch {
    return null;
  }
}

/** Marca a lição aberta agora, para o "Continuar de onde parou". */
export function rememberLastLesson(
  deps: { repository: ProgressRepository },
  params: { trailId: string; moduleId: string; now?: Date },
): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const last = progress.lastLesson;
  if (last && last.trailId === params.trailId && last.moduleId === params.moduleId) return;
  deps.repository.save({
    ...progress,
    lastLesson: { trailId: params.trailId, moduleId: params.moduleId, at: (params.now ?? new Date()).toISOString() },
  });
}

export type ContinueLesson = {
  trailId: string;
  trailTitle: string;
  moduleId: string;
  moduleTitle: string;
  /** Tela atual (a partir de 1) e total de telas da lição. */
  screen: number;
  screens: number;
};

/**
 * "Continuar de onde parou": a última lição aberta, se ainda não foi concluída; se foi, a
 * próxima lição não concluída da mesma era. `null` quando não há nada para continuar.
 */
export function getContinueLesson(
  deps: { repository: ProgressRepository },
  params: { trails: readonly Trail[] },
): ContinueLesson | null {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const last = progress.lastLesson;
  if (!last) return null;
  const trail = params.trails.find((t) => t.id === last.trailId);
  if (!trail) return null;
  const modules = progress.trails[trail.id]?.modules ?? {};
  const start = Math.max(0, trail.modules.findIndex((m) => m.id === last.moduleId));
  const module = trail.modules.slice(start).find((m) => !modules[m.id]?.completed);
  if (!module) return null;
  const screens = paginateModule(module).length;
  const screen = Math.min(screens, (modules[module.id]?.screen ?? 0) + 1);
  return { trailId: trail.id, trailTitle: trail.title, moduleId: module.id, moduleTitle: module.title, screen, screens };
}
