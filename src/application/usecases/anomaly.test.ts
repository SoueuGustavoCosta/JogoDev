import { describe, expect, it } from 'vitest';
import type { Anomaly } from '@/domain/anomaly';
import type { Progress } from '@/domain/progress';
import type { Trail } from '@/domain/trail';
import type { AnalyticsPort, LeaderboardPort, ProgressRepository } from '../ports';
import { countAnomalySolvers, getContinueLesson, getDailyAnomaly, rememberLastLesson, solveAnomaly } from './anomaly';
import { getProfileSummary } from './presence';

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

const challenge = { id: 'desafio', q: 'q', options: ['a', 'b'], answer: 0, explain: 'e' };
const pool: Anomaly[] = Array.from({ length: 25 }, (_, i) => ({
  id: `a${String(i).padStart(2, '0')}`,
  era: 'logica',
  title: 't',
  story: 's',
  level: 'Base',
  challenge,
}));

const calls: string[][] = [];
const leaderboard = {
  recordAnomalySolved: async (uuid: string, id: string, day: string) => {
    calls.push([uuid, id, day]);
  },
  countAnomalySolved: async () => 38,
  checkIn: async () => undefined,
} as unknown as LeaderboardPort;

const now = new Date('2026-09-26T15:00:00Z');

describe('Anomalia do Dia (casos de uso)', () => {
  it('a do dia: número, prazo e ainda não consertada', () => {
    const daily = getDailyAnomaly({ repository: new Memory() }, { pool, now });
    expect(daily.day).toBe('2026-09-26');
    expect(daily.number).toBe(26);
    expect(daily.closesInMs).toBe(12 * 3_600_000);
    expect(daily.solved).toBeNull();
    expect(daily.reward).toEqual({ xp: 30, fragments: 10 });
  });

  it('consertar dá +30 XP e +10 fragmentos uma vez por dia, com evento e registro da turma', () => {
    const repository = new Memory();
    repository.save({ version: 1, trails: {}, travelerUuid: 'u1' });
    const analytics = new Recording();
    const daily = getDailyAnomaly({ repository }, { pool, now });
    const first = solveAnomaly({ repository, analytics, leaderboard }, { day: daily.day, anomaly: daily.anomaly, tries: 2, now });
    expect(first).toMatchObject({ added: true, xp: 30, fragments: 10 });
    const again = solveAnomaly({ repository, analytics, leaderboard }, { day: daily.day, anomaly: daily.anomaly, tries: 1, now });
    expect(again.added).toBe(false);
    expect(analytics.events).toEqual([{ event: 'anomaly_solved', props: { anomaly: daily.anomaly.id, tries: 2 } }]);
    expect(calls).toEqual([['u1', daily.anomaly.id, '2026-09-26']]);
    expect(getDailyAnomaly({ repository }, { pool, now }).solved?.tries).toBe(2);

    // Consertar a anomalia conta como dia jogado na Linha do Tempo (Etapa 8).
    expect(first.timeline).toMatchObject({ counted: true, current: 1 });
    expect(repository.load()?.ultimoDiaAtivo).toBe('2026-09-26');

    const summary = getProfileSummary({ repository }, { trails: [], badgeCatalog: [] });
    expect(summary.xp).toBe(30);
    expect(summary.fragments).toBe(10);
  });

  it('sem viajante identificado, não tenta registrar na turma (mas guarda a recompensa)', () => {
    calls.length = 0;
    const repository = new Memory();
    const daily = getDailyAnomaly({ repository }, { pool, now });
    expect(solveAnomaly({ repository, analytics: new Recording(), leaderboard }, { day: daily.day, anomaly: daily.anomaly, tries: 1, now }).added).toBe(true);
    expect(calls).toEqual([]);
  });

  it('contador da turma: número, ou null se der erro', async () => {
    expect(await countAnomalySolvers({ leaderboard }, '2026-09-26')).toBe(38);
    const broken = { countAnomalySolved: async () => Promise.reject(new Error('rede')) } as unknown as LeaderboardPort;
    expect(await countAnomalySolvers({ leaderboard: broken }, '2026-09-26')).toBeNull();
  });
});

describe('Continuar de onde parou', () => {
  const mod = (id: string) => ({ id, short: id, title: `Módulo ${id}`, lead: '', level: 'Base' as const, blocks: [{ t: 'p' as const, x: 'x' }], quiz: [challenge] });
  const trail = { id: 't', title: 'Era T', modules: [mod('m1'), mod('m2')] } as unknown as Trail;

  it('sem lição aberta, nada a continuar', () => {
    expect(getContinueLesson({ repository: new Memory() }, { trails: [trail] })).toBeNull();
  });

  it('a última lição aberta; se concluída, a próxima da mesma era', () => {
    const repository = new Memory();
    rememberLastLesson({ repository }, { trailId: 't', moduleId: 'm1', now });
    expect(getContinueLesson({ repository }, { trails: [trail] })).toMatchObject({ moduleId: 'm1', moduleTitle: 'Módulo m1', trailTitle: 'Era T', screen: 1, screens: 2 });
    repository.save({ ...repository.load()!, trails: { t: { trailId: 't', trophyAwarded: false, missionsCompleted: {}, modules: { m1: { moduleId: 'm1', completed: true, quizResults: {} } } } } });
    expect(getContinueLesson({ repository }, { trails: [trail] })?.moduleId).toBe('m2');
  });
});
