import {
  earnedSeal,
  leagueWeek,
  leagueWeekOfDay,
  LEAGUE_SEAL_ITEM_ID,
  msUntilLeagueReset,
  previousLeagueWeek,
  rankOf,
  rankWithMe,
  type LeagueEntry,
} from '@/domain/league';
import { createEmptyProgress, grantItem, recordWeeklyXp, weeklyXpTotal, type Progress } from '@/domain/progress';
import type { AnalyticsPort, LeaderboardPort, LeagueRow, ProgressRepository } from '../ports';
import { getTraveler } from './traveler';

/** Guarda XP ganho na semana atual da Liga (por fonte, sem contar duas vezes). */
export function recordXpGain(
  deps: { repository: ProgressRepository },
  params: { sourceId: string; xp: number; now?: Date },
): void {
  if (!(params.xp > 0)) return;
  const progress = deps.repository.load() ?? createEmptyProgress();
  const next = recordWeeklyXp(progress, leagueWeek(params.now ?? new Date()), params.sourceId, params.xp);
  if (next !== progress) deps.repository.save(next);
}

/** XP deste viajante na semana atual (conta local, sem rede). */
export function getMyWeeklyXp(deps: { repository: ProgressRepository }, now = new Date()): number {
  return weeklyXpTotal(deps.repository.load() ?? createEmptyProgress(), leagueWeek(now), leagueWeekOfDay);
}

function canSync(progress: Progress): progress is Progress & { travelerUuid: string } {
  return Boolean(progress.travelerUuid) && !progress.needsSignIn;
}

/**
 * Envia o XP da semana para o ranking. Silencioso; só com identidade e sessão válidas
 * (senão gravaria na conta errada). Chamado de tempos em tempos e depois de ganhos grandes.
 */
export function syncWeeklyXp(deps: { repository: ProgressRepository; leaderboard: LeaderboardPort }, now = new Date()): void {
  const progress = deps.repository.load();
  if (!progress || !canSync(progress)) return;
  const week = leagueWeek(now);
  const xp = weeklyXpTotal(progress, week, leagueWeekOfDay);
  if (xp > 0) void deps.leaderboard.syncWeeklyXp(week, xp);
}

function toEntry(row: LeagueRow): LeagueEntry {
  return { uuid: row.uuid, name: row.nome, photoUrl: row.fotoUrl, lineDays: row.sequenciaAtual, xp: row.xp };
}

export type LeagueView = {
  week: string;
  resetInMs: number;
  /** false = sem conexão com o ranking: a tela mostra só o próprio viajante. */
  online: boolean;
  entries: LeagueEntry[];
  myUuid: string | null;
  myRank: number | null;
  myXp: number;
};

/** Ranking da semana, com a linha do próprio viajante sempre atualizada. */
export async function getLeague(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort },
  now = new Date(),
): Promise<LeagueView> {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const week = leagueWeek(now);
  const myXp = weeklyXpTotal(progress, week, leagueWeekOfDay);
  const myUuid = progress.travelerUuid ?? null;
  let rows: LeagueRow[] | null = null;
  try {
    rows = await deps.leaderboard.getLeague(week);
  } catch {
    rows = null;
  }
  const me: LeagueEntry = {
    uuid: myUuid ?? 'eu',
    name: getTraveler({ repository: deps.repository }).name,
    photoUrl: progress.avatarUrl ?? null,
    lineDays: progress.streakCurrent ?? 0,
    xp: myXp,
  };
  const entries = rankWithMe((rows ?? []).map(toEntry), me);
  return {
    week,
    resetInMs: msUntilLeagueReset(now),
    online: rows !== null,
    entries,
    myUuid: me.uuid,
    myRank: rankOf(entries, me.uuid),
    myXp,
  };
}

export function openLeague(deps: { analytics: AnalyticsPort }): void {
  deps.analytics.track('league_opened');
}

/**
 * Selo da semana: se o viajante ficou no top 3 da semana que passou, ganha o selo (item
 * cosmético, uma vez por semana) e a semana fica guardada no perfil. Confere pelo ranking do
 * servidor; sem conexão, não dá nada (tenta de novo depois). Devolve a posição conquistada.
 */
export async function claimLeagueSeal(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort; analytics: AnalyticsPort },
  now = new Date(),
): Promise<{ week: string; rank: number } | null> {
  const before = deps.repository.load();
  if (!before?.travelerUuid) return null;
  const week = previousLeagueWeek(leagueWeek(now));
  if (before.leagueSeals?.includes(week)) return null;
  let rows: LeagueRow[] | null = null;
  try {
    rows = await deps.leaderboard.getLeague(week);
  } catch {
    return null;
  }
  if (!rows) return null;
  const entries = rows.map(toEntry);
  if (!earnedSeal(entries, before.travelerUuid)) return null;
  // Relê: o progresso pode ter mudado enquanto esperava a rede.
  const progress = deps.repository.load() ?? before;
  if (progress.leagueSeals?.includes(week)) return null;
  const granted = grantItem(progress, { itemId: LEAGUE_SEAL_ITEM_ID, at: now.toISOString() });
  deps.repository.save({ ...granted, leagueSeals: [...(progress.leagueSeals ?? []), week].sort() });
  const rank = rankOf(entries, before.travelerUuid) ?? 0;
  deps.analytics.track('league_seal_won', { rank });
  return { week, rank };
}
