import { describe, expect, it } from 'vitest';
import type { BossRound } from '@/domain/bossFight';
import type { GameEvent } from '@/domain/events';
import { fragmentBalance, ownedCosmeticIds, type Progress } from '@/domain/progress';
import type { Trail } from '@/domain/trail';
import type { AnalyticsPort, LeaderboardPort, ProgressRepository } from '../ports';
import { answerQuiz } from './answerQuiz';
import { getDailyAnomaly, solveAnomaly } from './anomaly';
import { completeModule } from './completeModule';
import { getActiveConvergence, getActiveEvents, getEcoSolto, loadConvergence, winEcoSolto } from './events';
import { getMyWeeklyXp } from './league';
import { getProfileSummary } from './presence';

class Memory implements ProgressRepository {
  data: Progress | null = { version: 1, trails: {}, travelerUuid: 'me' };
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

const calendar: GameEvent[] = [
  { id: 'surto', kind: 'surto', title: 'S', description: 'd', multiplier: 2, when: { weekly: ['sab', 'dom'] } },
  { id: 'eco', kind: 'eco-solto', title: 'E', description: 'd', rewardItemId: 'moldura-fenda', bonusFragments: 15, when: { weekly: ['sex'] } },
  { id: 'conv', kind: 'convergencia', title: 'C', description: 'd', target: 100, rewardItemId: 'cor-convergencia', when: { from: '2026-10-01', to: '2026-10-31' } },
];
const FRIDAY = new Date('2026-10-02T15:00:00Z');
const SATURDAY = new Date('2026-10-03T15:00:00Z');
const pool: BossRound[] = ['a', 'b', 'c', 'd', 'e'].map((t) => ({ title: t, description: 'd', talk: 't', hint: 'h', check: ['^x$'] }));

const trail = {
  id: 'logica',
  title: 'L',
  modules: [{ id: 'ola', short: 'o', title: 'O', lead: 'l', level: 'Base', blocks: [], quiz: [{ id: 'q1', q: 'q', options: ['a', 'b'], answer: 0, explain: 'e' }] }],
} as unknown as Trail;

const quietLeaderboard = {
  upsertPlayer: async () => undefined,
  syncProgress: async () => undefined,
  syncBadge: async () => undefined,
  checkIn: async () => undefined,
  syncWeeklyXp: async () => undefined,
  recordAnomalySolved: async () => undefined,
} as unknown as LeaderboardPort;

describe('Eventos (casos de uso)', () => {
  it('eventos de hoje e multiplicador', () => {
    expect(getActiveEvents({ calendar, now: FRIDAY }).active.map((a) => a.event.id)).toEqual(['eco', 'conv']);
    expect(getActiveEvents({ calendar, now: FRIDAY }).multiplier).toBe(1);
    expect(getActiveEvents({ calendar, now: SATURDAY }).multiplier).toBe(2);
  });

  it('Surto dobra o XP da pergunta, da conclusão e da anomalia (total, semana e liga)', () => {
    const repository = new Memory();
    const analytics = new Recording();
    const item = trail.modules[0].quiz[0];
    const r = answerQuiz({ repository, analytics }, { trailId: 'logica', moduleId: 'ola', item, answer: { kind: 'choice', optionIndex: 0 }, now: SATURDAY, xpMultiplier: 2 });
    expect(r.xpGained).toBe(200);
    completeModule({ repository, analytics, leaderboard: quietLeaderboard }, { trail, moduleId: 'ola', traveler: { uuid: 'me', name: 'G' }, xpMultiplier: 2 });
    const pool1 = [{ id: 'a1', era: 'logica', title: 't', story: 's', level: 'Base' as const, challenge: item }];
    const daily = getDailyAnomaly({ repository }, { pool: pool1, now: SATURDAY, xpMultiplier: 2 });
    expect(daily.reward.xp).toBe(60);
    solveAnomaly({ repository, analytics, leaderboard: quietLeaderboard }, { day: daily.day, anomaly: daily.anomaly, tries: 1, now: SATURDAY, xpMultiplier: 2 });
    const summary = getProfileSummary({ repository }, { trails: [trail], badgeCatalog: [] });
    expect(summary.xp).toBe(100 + 150 + 100 + 150 + 60);
    expect(getMyWeeklyXp({ repository }, SATURDAY)).toBeGreaterThanOrEqual(200 + 60);
  });

  it('Eco Solto: só na sexta, 3 rodadas iguais para todos; fora do dia diz quando volta', () => {
    const repository = new Memory();
    const fri = getEcoSolto({ repository }, { calendar, pool, now: FRIDAY });
    expect(fri.active).toBe(true);
    expect(fri.rounds).toHaveLength(3);
    expect(fri.rounds).toEqual(getEcoSolto({ repository }, { calendar, pool, now: FRIDAY }).rounds);
    const sat = getEcoSolto({ repository }, { calendar, pool, now: SATURDAY });
    expect(sat).toMatchObject({ active: false, nextDay: '2026-10-09', rounds: [] });
  });

  it('Eco Solto: 1ª vitória dá o cosmético; depois ◆ uma vez por dia', () => {
    const repository = new Memory();
    const analytics = new Recording();
    const event = calendar[1] as Extract<GameEvent, { kind: 'eco-solto' }>;
    expect(winEcoSolto({ repository, analytics }, { event, now: FRIDAY })).toEqual({ kind: 'item', itemId: 'moldura-fenda' });
    expect(ownedCosmeticIds(repository.data as Progress).has('moldura-fenda')).toBe(true);
    expect(winEcoSolto({ repository, analytics }, { event, now: FRIDAY })).toEqual({ kind: 'none' });
    const nextFriday = new Date('2026-10-09T15:00:00Z');
    expect(winEcoSolto({ repository, analytics }, { event, now: nextFriday })).toEqual({ kind: 'fragments', amount: 15 });
    expect(fragmentBalance(repository.data as Progress)).toBe(15);
    expect(repository.data?.ecoSoltoWins).toEqual(['2026-10-02', '2026-10-09']);
  });

  it('Convergência: mostra o progresso; batida a meta, libera o cosmético uma vez', async () => {
    const repository = new Memory();
    const analytics = new Recording();
    const active = getActiveConvergence({ calendar, now: FRIDAY });
    expect(active?.until).toBe('2026-10-31');
    const at = (n: number | null) => ({ countAnomaliesBetween: async () => n }) as unknown as LeaderboardPort;
    const partial = await loadConvergence({ repository, analytics, leaderboard: at(64) }, { active: active! });
    expect(partial).toMatchObject({ progress: { count: 64, percent: 64, reached: false }, unlocked: false });
    const done = await loadConvergence({ repository, analytics, leaderboard: at(101) }, { active: active! });
    expect(done?.unlocked).toBe(true);
    expect(ownedCosmeticIds(repository.data as Progress).has('cor-convergencia')).toBe(true);
    await loadConvergence({ repository, analytics, leaderboard: at(120) }, { active: active! });
    expect(analytics.events.filter((e) => e.event === 'convergence_unlocked')).toHaveLength(1);
    const offline = await loadConvergence({ repository, analytics, leaderboard: at(null) }, { active: active! });
    expect(offline?.progress.count).toBeNull();
    // Convergência por oficinas conta pela outra função.
    const byWorkshops = { ...active!, event: { ...(active!.event as Extract<GameEvent, { kind: 'convergencia' }>), metric: 'oficinas' as const } };
    const lb = { countWorkshopsBetween: async () => 7, countAnomaliesBetween: async () => 99 } as unknown as LeaderboardPort;
    expect((await loadConvergence({ repository, analytics, leaderboard: lb }, { active: byWorkshops }))?.progress.count).toBe(7);
  });
});
