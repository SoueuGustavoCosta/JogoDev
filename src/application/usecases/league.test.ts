import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import { ownedCosmeticIds } from '@/domain/progress';
import type { Trail } from '@/domain/trail';
import type { AnalyticsPort, LeaderboardPort, LeagueRow, ProgressRepository } from '../ports';
import { answerQuiz } from './answerQuiz';
import { completeModule } from './completeModule';
import { claimLeagueSeal, getLeague, getMyWeeklyXp, syncWeeklyXp } from './league';

class Memory implements ProgressRepository {
  data: Progress | null = null;
  load() {
    return this.data;
  }
  save(p: Progress) {
    this.data = p;
  }
  clear() {
    this.data = null;
  }
}

class Recording implements AnalyticsPort {
  events: { event: string; props?: Record<string, unknown> }[] = [];
  track(event: string, props?: Record<string, unknown>) {
    this.events.push({ event, props });
  }
}

// Quarta, 30/09/2026, 12:00 em São Paulo: semana que começou na segunda 28/09.
const NOW = new Date('2026-09-30T15:00:00Z');
const WEEK = '2026-09-28';
const LAST_WEEK = '2026-09-21';

const row = (uuid: string, xp: number): LeagueRow => ({ uuid, nome: uuid, fotoUrl: null, sequenciaAtual: 2, xp });

function fakeLeaderboard(byWeek: Record<string, LeagueRow[] | null>) {
  const synced: [string, number][] = [];
  const leaderboard = {
    syncWeeklyXp: async (week: string, xp: number) => {
      synced.push([week, xp]);
    },
    getLeague: async (week: string) => byWeek[week] ?? null,
    upsertPlayer: async () => undefined,
    syncProgress: async () => undefined,
    syncBadge: async () => undefined,
    checkIn: async () => undefined,
  } as unknown as LeaderboardPort;
  return { leaderboard, synced };
}

function setup(extra: Partial<Progress> = {}) {
  const repository = new Memory();
  repository.data = { version: 1, trails: {}, travelerUuid: 'me', travelerName: 'Gustavo', prologueSeen: true, ...extra };
  return { repository, analytics: new Recording() };
}

const trail = {
  id: 'logica',
  title: 'L',
  modules: [
    {
      id: 'ola',
      short: 'o',
      title: 'O',
      lead: 'l',
      level: 'Base',
      blocks: [],
      quiz: [{ id: 'q1', q: 'q', options: ['a', 'b'], answer: 0, explain: 'e' }],
    },
  ],
} as unknown as Trail;

describe('Liga dos Viajantes (casos de uso)', () => {
  it('XP de pergunta, de conclusão e de anomalia entram na semana; a mesma pergunta não conta duas vezes', () => {
    const { repository, analytics } = setup({
      anomalies: { '2026-09-29': { anomalyId: 'a', tries: 1, solvedAt: 'x', xp: 30, fragments: 10 } },
    });
    const { leaderboard, synced } = fakeLeaderboard({});
    const item = trail.modules[0].quiz[0];
    answerQuiz({ repository, analytics }, { trailId: 'logica', moduleId: 'ola', item, answer: { kind: 'choice', optionIndex: 1 }, now: NOW });
    answerQuiz({ repository, analytics }, { trailId: 'logica', moduleId: 'ola', item, answer: { kind: 'choice', optionIndex: 0 }, now: NOW });
    expect(getMyWeeklyXp({ repository }, NOW)).toBe(40 + 30);
    completeModule({ repository, analytics, leaderboard }, { trail, moduleId: 'ola', traveler: { uuid: 'me', name: 'G' } });
    // A conclusão usa o relógio real; a semana dela é a de hoje de verdade.
    expect(synced.length).toBe(1);
    expect(synced[0][1]).toBeGreaterThanOrEqual(150);
  });

  it('não envia nada sem identidade ou com a sessão perdida', () => {
    const { leaderboard, synced } = fakeLeaderboard({});
    const a = setup({ travelerUuid: undefined, weeklyXp: { [WEEK]: { q: 100 } } });
    syncWeeklyXp({ repository: a.repository, leaderboard }, NOW);
    const b = setup({ needsSignIn: true, weeklyXp: { [WEEK]: { q: 100 } } });
    syncWeeklyXp({ repository: b.repository, leaderboard }, NOW);
    expect(synced).toEqual([]);
    const c = setup({ weeklyXp: { [WEEK]: { q: 100 } } });
    syncWeeklyXp({ repository: c.repository, leaderboard }, NOW);
    expect(synced).toEqual([[WEEK, 100]]);
  });

  it('ranking com o viajante destacado e o XP local mais novo; contagem até segunda', async () => {
    const { repository } = setup({ weeklyXp: { [WEEK]: { q: 700 } } });
    const { leaderboard } = fakeLeaderboard({ [WEEK]: [row('ana', 820), row('me', 500), row('bia', 540)] });
    const view = await getLeague({ repository, leaderboard }, NOW);
    expect(view.online).toBe(true);
    expect(view.entries.map((e) => `${e.uuid}:${e.xp}`)).toEqual(['ana:820', 'me:700', 'bia:540']);
    expect(view.myRank).toBe(2);
    expect(view.entries[1].name).toBe('Gustavo');
    expect(view.resetInMs).toBe(4 * 86_400_000 + 12 * 3_600_000);
  });

  it('offline: só o próprio viajante', async () => {
    const { repository } = setup({ weeklyXp: { [WEEK]: { q: 100 } } });
    const { leaderboard } = fakeLeaderboard({});
    const view = await getLeague({ repository, leaderboard }, NOW);
    expect(view.online).toBe(false);
    expect(view.entries.map((e) => e.uuid)).toEqual(['me']);
  });

  it('top 3 da semana passada ganha o selo uma vez; fora do top 3, nada', async () => {
    const { repository, analytics } = setup();
    const { leaderboard } = fakeLeaderboard({ [LAST_WEEK]: [row('a', 900), row('me', 800), row('b', 10)] });
    expect(await claimLeagueSeal({ repository, leaderboard, analytics }, NOW)).toEqual({ week: LAST_WEEK, rank: 2 });
    expect(repository.data?.leagueSeals).toEqual([LAST_WEEK]);
    expect(ownedCosmeticIds(repository.data as Progress).has('acessorio-selo-liga')).toBe(true);
    expect(await claimLeagueSeal({ repository, leaderboard, analytics }, NOW)).toBeNull();
    expect(analytics.events.filter((e) => e.event === 'league_seal_won')).toHaveLength(1);

    const other = setup();
    const { leaderboard: lb2 } = fakeLeaderboard({ [LAST_WEEK]: [row('a', 9), row('b', 8), row('c', 7), row('me', 6)] });
    expect(await claimLeagueSeal({ ...other, leaderboard: lb2 }, NOW)).toBeNull();
    expect(other.repository.data?.leagueSeals).toBeUndefined();
  });

  it('selo sem conexão: não dá nada e tenta depois', async () => {
    const { repository, analytics } = setup();
    const { leaderboard } = fakeLeaderboard({});
    expect(await claimLeagueSeal({ repository, leaderboard, analytics }, NOW)).toBeNull();
  });
});
