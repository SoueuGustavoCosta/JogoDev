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

  // Etapa 3 (telas curtas): campos novos e opcionais não podem sumir no login/backup.
  it('tela onde parou: fica a mais adiantada, e progresso antigo sem ela continua sem ela', () => {
    const withScreen = (screen: number): Progress =>
      empty({
        trails: {
          'banco-de-dados': {
            trailId: 'banco-de-dados',
            trophyAwarded: false,
            missionsCompleted: {},
            modules: { porque: { moduleId: 'porque', completed: false, quizResults: {}, screen } },
          },
        },
      });
    expect(mergeProgress(withScreen(2), withScreen(7)).trails['banco-de-dados'].modules.porque.screen).toBe(7);
    expect(mergeProgress(rich, withScreen(4)).trails['banco-de-dados'].modules.porque.screen).toBe(4);
    // Dois progressos antigos (sem o campo): o resultado não ganha uma chave vazia.
    expect('screen' in mergeProgress(rich, rich).trails['banco-de-dados'].modules.porque).toBe(false);
  });

  it('preferência de lição (Modo leitura) vem do primary, completada pelo secondary', () => {
    expect(mergeProgress(empty({ lessonMode: 'rolagem' }), empty({ lessonMode: 'telas' })).lessonMode).toBe('rolagem');
    expect(mergeProgress(empty(), empty({ lessonMode: 'rolagem' })).lessonMode).toBe('rolagem');
    expect('lessonMode' in mergeProgress(rich, rich)).toBe(false);
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

describe('mergeProgress: Linha do Tempo (Etapa 8)', () => {
  it('âncoras e ramificação vêm da cópia do dia mais recente; Eco não recua; dias somam', () => {
    const older = empty({ ultimoDiaAtivo: '2026-09-20', streakCurrent: 4, anchors: 2, ecoEra: 3, playedDays: ['2026-09-19', '2026-09-20'] });
    const recent = empty({ ultimoDiaAtivo: '2026-09-25', streakCurrent: 1, anchors: 0, ecoEra: 1, lineBrokenOn: '2026-09-24', playedDays: ['2026-09-25'], anchoredDays: ['2026-09-22'] });
    for (const m of [mergeProgress(older, recent), mergeProgress(recent, older)]) {
      expect(m.anchors).toBe(0);
      expect(m.lineBrokenOn).toBe('2026-09-24');
      expect(m.ecoEra).toBe(3);
      expect(m.playedDays).toEqual(['2026-09-19', '2026-09-20', '2026-09-25']);
      expect(m.anchoredDays).toEqual(['2026-09-22']);
    }
    const plain = mergeProgress(empty(), empty());
    for (const key of ['anchors', 'ecoEra', 'playedDays', 'anchoredDays', 'lineBrokenOn']) expect(key in plain, key).toBe(false);
  });
});
