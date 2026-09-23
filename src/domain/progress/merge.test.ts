import { describe, expect, it } from 'vitest';
import { isProgressShape, mergeProgress } from './merge';
import type { Progress } from './types';

const empty = (extra: Partial<Progress> = {}): Progress => ({ version: 1, trails: {}, ...extra });

const rich: Progress = {
  version: 1,
  travelerName: 'Gustavo',
  prologueSeen: true,
  streakCurrent: 5,
  streakBest: 7,
  ultimoDiaAtivo: '2026-09-23',
  badgesEarned: { sql: '2026-09-20T10:00:00Z' },
  trails: {
    'banco-de-dados': {
      trailId: 'banco-de-dados',
      trophyAwarded: false,
      missionsCompleted: { m1: true },
      modules: {
        porque: { moduleId: 'porque', completed: true, quizResults: { 0: { correct: true, triesUsed: 1 }, 1: { correct: true, triesUsed: 2 } } },
      },
    },
  },
};

describe('mergeProgress', () => {
  it('cópia vazia nunca apaga a cheia, em qualquer ordem (o bug do login)', () => {
    const cloudEmpty = empty({ phoneLinked: true, travelerUuid: 'conta' });
    const a = mergeProgress(cloudEmpty, rich);
    const b = mergeProgress(rich, cloudEmpty);
    for (const m of [a, b]) {
      expect(m.trails['banco-de-dados'].modules.porque.completed).toBe(true);
      expect(m.trails['banco-de-dados'].missionsCompleted.m1).toBe(true);
      expect(m.badgesEarned).toEqual({ sql: '2026-09-20T10:00:00Z' });
      expect(m.streakBest).toBe(7);
      expect(m.phoneLinked).toBe(true);
    }
    expect(a.travelerUuid).toBe('conta');
    expect(a.travelerName).toBe('Gustavo');
  });

  it('soma módulos e trilhas de dois aparelhos diferentes', () => {
    const other: Progress = empty({
      trails: {
        logica: { trailId: 'logica', trophyAwarded: true, bossDefeated: true, missionsCompleted: {}, modules: { origem: { moduleId: 'origem', completed: true, quizResults: {} } } },
        'banco-de-dados': {
          trailId: 'banco-de-dados',
          trophyAwarded: false,
          missionsCompleted: { m2: true },
          modules: { sgbd: { moduleId: 'sgbd', completed: true, quizResults: {} } },
        },
      },
    });
    const m = mergeProgress(rich, other);
    expect(Object.keys(m.trails).sort()).toEqual(['banco-de-dados', 'logica']);
    expect(Object.keys(m.trails['banco-de-dados'].modules).sort()).toEqual(['porque', 'sgbd']);
    expect(m.trails['banco-de-dados'].missionsCompleted).toEqual({ m1: true, m2: true });
    expect(m.trails.logica.bossDefeated).toBe(true);
    expect(m.trails.logica.trophyAwarded).toBe(true);
  });

  it('quiz: fica a melhor tentativa de cada pergunta', () => {
    const other = empty({
      trails: {
        'banco-de-dados': {
          trailId: 'banco-de-dados',
          trophyAwarded: false,
          missionsCompleted: {},
          modules: {
            porque: {
              moduleId: 'porque',
              completed: false,
              quizResults: { 0: { correct: false, triesUsed: 3 }, 1: { correct: true, triesUsed: 1 }, 2: { correct: false, triesUsed: 1 } },
            },
          },
        },
      },
    });
    const q = mergeProgress(other, rich).trails['banco-de-dados'].modules.porque;
    expect(q.completed).toBe(true);
    expect(q.quizResults[0]).toEqual({ correct: true, triesUsed: 1 });
    expect(q.quizResults[1]).toEqual({ correct: true, triesUsed: 1 });
    expect(q.quizResults[2]).toEqual({ correct: false, triesUsed: 1 });
  });

  it('sequência vem do acesso mais recente; recorde é o maior', () => {
    const old = empty({ streakCurrent: 9, streakBest: 9, ultimoDiaAtivo: '2026-09-10' });
    const m = mergeProgress(old, rich);
    expect(m.streakCurrent).toBe(5);
    expect(m.ultimoDiaAtivo).toBe('2026-09-23');
    expect(m.streakBest).toBe(9);
  });

  it('insígnia nos dois lados guarda a data mais antiga', () => {
    const m = mergeProgress(empty({ badgesEarned: { sql: '2026-09-22T00:00:00Z', git: '2026-09-22T00:00:00Z' } }), rich);
    expect(m.badgesEarned).toEqual({ sql: '2026-09-20T10:00:00Z', git: '2026-09-22T00:00:00Z' });
  });

  it('perfil vem do primary, completado pelo secondary', () => {
    const m = mergeProgress(empty({ travelerName: 'Conta', bio: '' }), empty({ travelerName: 'Aparelho', bio: 'CC 4º período', avatarUrl: 'x.png' }));
    expect(m.travelerName).toBe('Conta');
    expect(m.bio).toBe('CC 4º período');
    expect(m.avatarUrl).toBe('x.png');
  });

  it('juntar com uma cópia igual não muda nada', () => {
    expect(mergeProgress(rich, rich)).toEqual({ ...rich, phoneLinked: false });
  });
});

describe('isProgressShape', () => {
  it('aceita progresso e recusa lixo', () => {
    expect(isProgressShape(rich)).toBe(true);
    expect(isProgressShape(null)).toBe(false);
    expect(isProgressShape({ version: 1, trails: null })).toBe(false);
    expect(isProgressShape('texto')).toBe(false);
  });
});
