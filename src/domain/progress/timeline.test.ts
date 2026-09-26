import { describe, expect, it } from 'vitest';
import { evaluateTimeline, registerPlay } from '../traveler/timeline';
import { timelineOf, withTimeline } from './timeline';
import type { Progress } from './types';

describe('Linha do Tempo no progresso (migração)', () => {
  it('quem já tinha ofensiva pela regra antiga mantém o número; a regra nova vale dali em diante', () => {
    const old: Progress = { version: 1, trails: {}, streakCurrent: 9, streakBest: 11, ultimoDiaAtivo: '2026-09-25' };
    const state = timelineOf(old);
    expect(state).toMatchObject({ current: 9, best: 11, lastPlayed: '2026-09-25', anchors: 0, ecoEra: 0 });
    expect(evaluateTimeline(state, '2026-09-26').kind).toBe('alive');
    const next = withTimeline(old, registerPlay(state, '2026-09-26').state);
    expect(next).toMatchObject({ streakCurrent: 10, streakBest: 11, ultimoDiaAtivo: '2026-09-26', playedDays: ['2026-09-26'] });
  });

  it('progresso sem nenhuma sequência vira uma linha vazia, e voltar não cria campos vazios', () => {
    const fresh: Progress = { version: 1, trails: {} };
    expect(timelineOf(fresh)).toMatchObject({ current: 0, lastPlayed: null });
    const back = withTimeline(fresh, timelineOf(fresh));
    expect('ultimoDiaAtivo' in back).toBe(false);
    expect('lineBrokenOn' in back).toBe(false);
  });
});
