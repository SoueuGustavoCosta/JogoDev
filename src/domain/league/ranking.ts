import { LEAGUE_SEAL_TOP, type LeagueEntry } from './types';

/**
 * Ordena o ranking (mais XP primeiro; empate fica na ordem que veio do servidor) e garante a
 * linha do próprio viajante com o XP que ele tem neste aparelho: o servidor pode estar um
 * pouco atrasado (sincroniza de tempos em tempos) ou fora do ar.
 */
export function rankWithMe(entries: readonly LeagueEntry[], me: LeagueEntry): LeagueEntry[] {
  const others = entries.filter((e) => e.uuid !== me.uuid);
  const server = entries.find((e) => e.uuid === me.uuid);
  const mine: LeagueEntry = server ? { ...server, xp: Math.max(server.xp, me.xp), name: me.name || server.name } : me;
  const list = mine.xp > 0 || server ? [...others, mine] : others;
  return list
    .map((e, i) => ({ e, i }))
    .sort((a, b) => b.e.xp - a.e.xp || a.i - b.i)
    .map(({ e }) => e);
}

/** Posição (1 = primeiro) de um viajante no ranking, ou null se não está nele. */
export function rankOf(entries: readonly LeagueEntry[], uuid: string): number | null {
  const i = entries.findIndex((e) => e.uuid === uuid);
  return i === -1 ? null : i + 1;
}

/** Ficou entre os primeiros da semana (e fez algum XP)? */
export function earnedSeal(entries: readonly LeagueEntry[], uuid: string): boolean {
  const rank = rankOf(entries, uuid);
  return rank !== null && rank <= LEAGUE_SEAL_TOP && (entries[rank - 1]?.xp ?? 0) > 0;
}
