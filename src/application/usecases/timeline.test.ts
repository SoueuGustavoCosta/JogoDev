import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type { LeaderboardPort, ProgressRepository } from '../ports';
import { getTimeline, openTimeline, recordPlayedDay, resolveTimeline } from './timeline';

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

const synced: unknown[] = [];
const leaderboard = {
  checkIn: async (_uuid: string, params: unknown) => {
    synced.push(params);
  },
} as unknown as LeaderboardPort;

// 15:00 UTC = 12:00 em São Paulo.
const day = (iso: string) => new Date(`${iso}T15:00:00Z`);

function withStreak(current: number, last: string, extra: Partial<Progress> = {}): Memory {
  const repository = new Memory();
  repository.save({ version: 1, trails: {}, travelerUuid: 'u1', streakCurrent: current, streakBest: current, ultimoDiaAtivo: last, ...extra });
  return repository;
}

describe('Linha do Tempo (casos de uso)', () => {
  it('abrir o app não conta como dia jogado', () => {
    const repository = withStreak(4, '2026-09-25');
    expect(openTimeline({ repository, leaderboard }, day('2026-09-26')).kind).toBe('alive');
    expect(repository.load()?.streakCurrent).toBe(4);
    expect(repository.load()?.ultimoDiaAtivo).toBe('2026-09-25');
  });

  it('jogar conta uma vez por dia e sincroniza a sequência com o Hall', () => {
    synced.length = 0;
    const repository = withStreak(4, '2026-09-25');
    expect(recordPlayedDay({ repository, leaderboard }, day('2026-09-26'))).toMatchObject({ counted: true, current: 5, daysToAnchor: 2 });
    expect(recordPlayedDay({ repository, leaderboard }, day('2026-09-26')).counted).toBe(false);
    expect(synced).toEqual([{ nome: 'Viajante U1', sequenciaAtual: 5, sequenciaRecorde: 5, ultimoDiaAtivo: '2026-09-26' }]);
    expect(getTimeline({ repository }, day('2026-09-26')).status.kind).toBe('played-today');
  });

  it('perdeu um dia sem âncora: ao abrir, a linha ramifica (zera e o Eco avança)', () => {
    const repository = withStreak(12, '2026-09-24');
    expect(openTimeline({ repository, leaderboard }, day('2026-09-26'))).toEqual({ kind: 'broken', missed: 1 });
    expect(repository.load()).toMatchObject({ streakCurrent: 0, streakBest: 12, ecoEra: 1, lineBrokenOn: '2026-09-26' });
    // Abrir de novo no mesmo dia não ramifica outra vez.
    expect(openTimeline({ repository, leaderboard }, day('2026-09-26')).kind).toBe('new');
    expect(repository.load()?.ecoEra).toBe(1);
  });

  it('perdeu um dia com âncora: pergunta, e usar a âncora mantém a sequência', () => {
    const repository = withStreak(12, '2026-09-24', { anchors: 1 });
    expect(openTimeline({ repository, leaderboard }, day('2026-09-26'))).toEqual({ kind: 'can-anchor', missed: 1 });
    expect(repository.load()?.streakCurrent).toBe(12);
    resolveTimeline({ repository, leaderboard }, { choice: 'anchor', now: day('2026-09-26') });
    expect(repository.load()).toMatchObject({ streakCurrent: 12, anchors: 0, anchoredDays: ['2026-09-25'] });
    expect(recordPlayedDay({ repository, leaderboard }, day('2026-09-26')).current).toBe(13);
  });

  it('ou recomeçar do dia 1 (a âncora fica guardada)', () => {
    const repository = withStreak(12, '2026-09-24', { anchors: 1 });
    resolveTimeline({ repository, leaderboard }, { choice: 'restart', now: day('2026-09-26') });
    expect(repository.load()).toMatchObject({ streakCurrent: 0, anchors: 1, ecoEra: 1 });
  });
});
