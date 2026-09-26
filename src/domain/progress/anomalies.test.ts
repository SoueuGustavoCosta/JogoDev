import { describe, expect, it } from 'vitest';
import { anomalyXpTotal, recordAnomaly } from './anomalies';
import { fragmentsEarned } from './fragments';
import { mergeProgress } from './merge';
import type { AnomalyResult, Progress } from './types';

const r = (id: string, at: string): AnomalyResult => ({ anomalyId: id, tries: 1, solvedAt: at, xp: 30, fragments: 10 });
const base: Progress = { version: 1, trails: {} };

describe('anomalias no progresso', () => {
  it('registra uma por dia e soma XP e fragmentos', () => {
    const one = recordAnomaly(base, '2026-09-26', r('a1', '2026-09-26T12:00:00Z'));
    expect(one.added).toBe(true);
    const again = recordAnomaly(one.progress, '2026-09-26', r('a1', '2026-09-26T13:00:00Z'));
    expect(again.added).toBe(false);
    expect(again.progress).toBe(one.progress);
    const two = recordAnomaly(one.progress, '2026-09-27', r('a2', '2026-09-27T12:00:00Z')).progress;
    expect(anomalyXpTotal(two)).toBe(60);
    expect(fragmentsEarned(two)).toBe(20);
    expect(anomalyXpTotal(base)).toBe(0);
  });

  it('merge: união por dia, fica a consertada primeiro; última lição = a mais recente', () => {
    const a: Progress = { ...base, anomalies: { d1: r('a1', '2026-09-26T13:00:00Z') }, lastLesson: { trailId: 't', moduleId: 'm1', at: '2026-09-26T10:00:00Z' } };
    const b: Progress = { ...base, anomalies: { d1: r('a1', '2026-09-26T12:00:00Z'), d2: r('a2', 'x') }, lastLesson: { trailId: 't', moduleId: 'm2', at: '2026-09-26T11:00:00Z' } };
    for (const m of [mergeProgress(a, b), mergeProgress(b, a)]) {
      expect(m.anomalies?.d1.solvedAt).toBe('2026-09-26T12:00:00Z');
      expect(Object.keys(m.anomalies ?? {}).sort()).toEqual(['d1', 'd2']);
      expect(m.lastLesson?.moduleId).toBe('m2');
    }
    expect('anomalies' in mergeProgress(base, base)).toBe(false);
    expect('lastLesson' in mergeProgress(base, base)).toBe(false);
  });
});
