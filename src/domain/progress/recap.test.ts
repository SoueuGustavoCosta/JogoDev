import { describe, expect, it } from 'vitest';
import type { Module, Trail } from '../trail/types';
import type { TrailProgress } from './types';
import { moduleRecap } from './recap';

const quiz = [0, 1, 2, 3].map((i) => ({ id: `p${i}`, q: `p${i}`, options: ['a', 'b'], answer: 0, explain: '' }));
const mod = (id: string): Module => ({ id, short: id, title: id, lead: '', level: 'Base', blocks: [], quiz });
const trail = { id: 't', title: 't', tagline: '', symbol: 'db', accent: '', modules: [mod('a'), mod('b'), mod('c')] } as unknown as Trail;

function progressWith(tries: number[], completed: string[] = ['a']): TrailProgress {
  const quizResults = Object.fromEntries(tries.map((t, i) => [`p${i}`, { correct: true, triesUsed: t }]));
  const modules = Object.fromEntries(
    ['a', 'b', 'c'].map((id) => [id, { moduleId: id, quizResults: id === 'a' ? quizResults : {}, completed: completed.includes(id) }]),
  );
  return { trailId: 't', modules, missionsCompleted: {}, trophyAwarded: false };
}

describe('moduleRecap', () => {
  it('tudo de primeira: perfect', () => {
    expect(moduleRecap(trail, 'a', progressWith([1, 1, 1, 1]))).toEqual({ firstTry: 4, total: 4, tier: 'perfect', modulesLeft: 2 });
  });

  it('metade de primeira: good', () => {
    expect(moduleRecap(trail, 'a', progressWith([1, 2, 1, 3])).tier).toBe('good');
  });

  it('menos da metade de primeira: persisted', () => {
    expect(moduleRecap(trail, 'a', progressWith([2, 3, 1, 2])).tier).toBe('persisted');
  });

  it('conta os módulos que faltam na trilha', () => {
    expect(moduleRecap(trail, 'a', progressWith([1, 1, 1, 1], ['a', 'b', 'c'])).modulesLeft).toBe(0);
  });
});
