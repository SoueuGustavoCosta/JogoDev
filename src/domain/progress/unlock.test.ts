import { describe, expect, it } from 'vitest';
import type { Module, Trail } from '../trail/types';
import { isModuleUnlocked, isTrailCompleted } from './unlock';
import type { TrailProgress } from './types';

function makeModule(id: string): Module {
  return { id, short: id, title: id, lead: '', level: 'Base', blocks: [{ t: 'p', x: 'x' }], quiz: [] };
}

const trail: Trail = {
  id: 't1',
  title: 'Trilha',
  tagline: '',
  symbol: 's',
  accent: '#000000',
  modules: [makeModule('a'), makeModule('b'), makeModule('c')],
};

describe('isModuleUnlocked', () => {
  it('always unlocks the first module', () => {
    expect(isModuleUnlocked(trail, 'a', undefined, 'sequential')).toBe(true);
  });

  it('keeps later modules locked until the previous one is completed (sequential mode)', () => {
    expect(isModuleUnlocked(trail, 'b', undefined, 'sequential')).toBe(false);
  });

  it('unlocks a module once the previous one is completed', () => {
    const progress: TrailProgress = {
      trailId: 't1',
      modules: { a: { moduleId: 'a', quizResults: {}, completed: true } },
      missionsCompleted: {},
      trophyAwarded: false,
    };
    expect(isModuleUnlocked(trail, 'b', progress, 'sequential')).toBe(true);
    expect(isModuleUnlocked(trail, 'c', progress, 'sequential')).toBe(false);
  });

  it('unlocks every module in free exploration mode', () => {
    expect(isModuleUnlocked(trail, 'c', undefined, 'free')).toBe(true);
  });
});

describe('isTrailCompleted', () => {
  it('is false with no progress', () => {
    expect(isTrailCompleted(trail, undefined)).toBe(false);
  });

  it('is false when some module is missing', () => {
    const progress: TrailProgress = {
      trailId: 't1',
      modules: {
        a: { moduleId: 'a', quizResults: {}, completed: true },
        b: { moduleId: 'b', quizResults: {}, completed: true },
      },
      missionsCompleted: {},
      trophyAwarded: false,
    };
    expect(isTrailCompleted(trail, progress)).toBe(false);
  });

  it('is true when every module is completed', () => {
    const progress: TrailProgress = {
      trailId: 't1',
      modules: {
        a: { moduleId: 'a', quizResults: {}, completed: true },
        b: { moduleId: 'b', quizResults: {}, completed: true },
        c: { moduleId: 'c', quizResults: {}, completed: true },
      },
      missionsCompleted: {},
      trophyAwarded: false,
    };
    expect(isTrailCompleted(trail, progress)).toBe(true);
  });
});
