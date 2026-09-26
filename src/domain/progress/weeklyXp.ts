import type { Progress } from './types';

/** Quantas semanas de XP guardar no progresso (a atual e as anteriores, para o selo). */
export const WEEKLY_XP_KEEP_WEEKS = 3;

/**
 * XP ganho por semana da Liga (Etapa 10). Guardado por fonte, com id único (`quiz:...`,
 * `module:...`), para o merge entre aparelhos ser a união por id: nada se perde nem conta
 * duas vezes. O XP da Anomalia do Dia não entra aqui: sai de `progress.anomalies`.
 */
export function recordWeeklyXp(progress: Progress, week: string, sourceId: string, xp: number): Progress {
  if (!(xp > 0)) return progress;
  const current = progress.weeklyXp?.[week] ?? {};
  if ((current[sourceId] ?? 0) >= xp) return progress;
  return { ...progress, weeklyXp: pruneWeeks({ ...progress.weeklyXp, [week]: { ...current, [sourceId]: xp } }) };
}

/** XP da semana: o registrado por fonte + as anomalias consertadas em dias dessa semana. */
export function weeklyXpTotal(progress: Progress, week: string, weekOfDay: (day: string) => string): number {
  const fromSources = Object.values(progress.weeklyXp?.[week] ?? {}).reduce((sum, xp) => sum + (xp > 0 ? xp : 0), 0);
  const fromAnomalies = Object.entries(progress.anomalies ?? {})
    .filter(([day]) => weekOfDay(day) === week)
    .reduce((sum, [, r]) => sum + (r?.xp ?? 0), 0);
  return fromSources + fromAnomalies;
}

export function mergeWeeklyXp(
  a: Progress['weeklyXp'],
  b: Progress['weeklyXp'],
): Progress['weeklyXp'] {
  if (!a || !b) return a ?? b;
  const out: NonNullable<Progress['weeklyXp']> = {};
  for (const week of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const merged: Record<string, number> = { ...b[week] };
    for (const [id, xp] of Object.entries(a[week] ?? {})) merged[id] = Math.max(xp, merged[id] ?? 0);
    out[week] = merged;
  }
  return pruneWeeks(out);
}

function pruneWeeks(weeks: NonNullable<Progress['weeklyXp']>): NonNullable<Progress['weeklyXp']> {
  const keep = Object.keys(weeks).sort().slice(-WEEKLY_XP_KEEP_WEEKS);
  return Object.fromEntries(keep.map((w) => [w, weeks[w]]));
}

/** Selos da Liga (semanas em que ficou no top 3). */
export function mergeLeagueSeals(a: string[] | undefined, b: string[] | undefined): string[] | undefined {
  if (!a || !b) return a ?? b;
  return [...new Set([...a, ...b])].sort();
}
