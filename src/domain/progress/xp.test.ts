import { describe, expect, it } from 'vitest';
import type { Module } from '../trail/types';
import {
  maxXpForModule,
  maxXpForTrail,
  xpForModule,
  xpForQuizAttempt,
  xpForTrail,
  XP_FIRST_TRY,
  XP_MODULE_COMPLETION_BONUS,
  XP_RETRY,
} from './xp';
import type { ModuleProgress } from './types';
import type { Trail } from '../trail/types';

const module: Module = {
  id: 'm1',
  short: 'm1',
  title: 'Módulo 1',
  lead: '',
  level: 'Base',
  blocks: [{ t: 'p', x: 'x' }],
  quiz: [
    { q: 'q1', options: ['a', 'b'], answer: 0, explain: '' },
    { q: 'q2', options: ['a', 'b'], answer: 0, explain: '' },
  ],
};

describe('xpForQuizAttempt', () => {
  it('gives 100 xp for a correct first try', () => {
    expect(xpForQuizAttempt({ correct: true, triesUsed: 1 })).toBe(XP_FIRST_TRY);
  });

  it('gives 40 xp for a correct attempt after a retry', () => {
    expect(xpForQuizAttempt({ correct: true, triesUsed: 2 })).toBe(XP_RETRY);
  });

  it('gives 0 xp for a wrong attempt', () => {
    expect(xpForQuizAttempt({ correct: false, triesUsed: 1 })).toBe(0);
  });

  it('gives 0 xp when there is no attempt yet', () => {
    expect(xpForQuizAttempt(undefined)).toBe(0);
  });
});

describe('xpForModule / maxXpForModule', () => {
  it('computes max xp from the content, never hardcoded', () => {
    expect(maxXpForModule(module)).toBe(module.quiz.length * XP_FIRST_TRY + XP_MODULE_COMPLETION_BONUS);
  });

  it('sums quiz xp without the completion bonus when the module is not completed', () => {
    const progress: ModuleProgress = {
      moduleId: 'm1',
      quizResults: { 0: { correct: true, triesUsed: 1 }, 1: { correct: true, triesUsed: 2 } },
      completed: false,
    };
    expect(xpForModule(module, progress)).toBe(XP_FIRST_TRY + XP_RETRY);
  });

  it('adds the completion bonus once the module is completed', () => {
    const progress: ModuleProgress = {
      moduleId: 'm1',
      quizResults: { 0: { correct: true, triesUsed: 1 }, 1: { correct: true, triesUsed: 1 } },
      completed: true,
    };
    expect(xpForModule(module, progress)).toBe(2 * XP_FIRST_TRY + XP_MODULE_COMPLETION_BONUS);
  });

  it('returns 0 for a module with no progress at all', () => {
    expect(xpForModule(module, undefined)).toBe(0);
  });
});

describe('xpForTrail / maxXpForTrail', () => {
  const trail: Trail = {
    id: 't1',
    title: 'Trilha',
    tagline: '',
    symbol: 's',
    accent: '#000000',
    modules: [module, { ...module, id: 'm2' }],
  };

  it('sums max xp across all modules', () => {
    expect(maxXpForTrail(trail)).toBe(2 * maxXpForModule(module));
  });

  it('sums earned xp across all modules', () => {
    const progress = {
      trailId: 't1',
      modules: {
        m1: { moduleId: 'm1', quizResults: {}, completed: true },
      },
      missionsCompleted: {},
      trophyAwarded: false,
    };
    expect(xpForTrail(trail, progress)).toBe(XP_MODULE_COMPLETION_BONUS);
  });
});
