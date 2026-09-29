import { describe, expect, it } from 'vitest';
import type { Comet } from '@/domain/comets';
import { createEmptyProgress, type Progress } from '@/domain/progress';
import type { Module, Trail } from '@/domain/trail';
import type { ProgressRepository } from '../ports';
import { bossBadgeFor, getArchive, getCometLock, getSky } from './comets';

const a: Comet = { id: 'a', trailId: 'cometa-a', name: 'A', from: '2026-10-12T00:00:00-03:00', to: '2026-10-26T00:00:00-03:00', rareBadgeId: 'a-rara', commonBadgeId: 'a-comum' };
const mod = (id: string): Module => ({ id, short: id, title: id, lead: 'l', level: 'Base', blocks: [{ t: 'p', x: 'x' }], quiz: [] });
const trails: Trail[] = [{ id: 'cometa-a', title: 'A', tagline: 't', symbol: 's', accent: '#000', modules: [mod('m1'), mod('m2')] }];
const noAnalytics = { track: () => undefined };
function repo(p: Progress): ProgressRepository {
  return { load: () => p, save: () => undefined, clear: () => undefined };
}

describe('casos de uso dos Cometas', () => {
  it('céu, trava antes de chegar e insígnia pela data', () => {
    expect(getSky({ calendar: [a], now: new Date('2026-10-13T00:00:00-03:00') }).kind).toBe('comet');
    expect(getCometLock({ calendar: [a], trailId: 'cometa-a', now: new Date('2026-10-01T00:00:00-03:00') })).toBe(a);
    expect(getCometLock({ calendar: [a], trailId: 'cometa-a', now: new Date('2026-10-12T00:00:00-03:00') })).toBeNull();
    expect(getCometLock({ calendar: [a], trailId: 'python' })).toBeNull();
    expect(bossBadgeFor({ calendar: [a], trailId: 'cometa-a', badgeId: 'a-comum', now: new Date('2026-10-20T00:00:00-03:00') })).toBe('a-rara');
    expect(bossBadgeFor({ calendar: [a], trailId: 'cometa-a', badgeId: 'a-comum', now: new Date('2026-11-20T00:00:00-03:00') })).toBe('a-comum');
    expect(bossBadgeFor({ calendar: [a], trailId: 'python', badgeId: 'py-onduluk' })).toBe('py-onduluk');
  });

  it('Arquivo: progresso e a insígnia que o viajante já tem (a rara prevalece)', () => {
    const p: Progress = {
      ...createEmptyProgress(),
      badgesEarned: { 'a-rara': '2026-10-20', 'a-comum': '2026-11-20' },
      trails: { 'cometa-a': { trailId: 'cometa-a', modules: { m1: { moduleId: 'm1', quizResults: {}, completed: true } }, missionsCompleted: {}, trophyAwarded: false } },
    };
    const now = new Date('2026-12-01T00:00:00-03:00');
    expect(getArchive({ repository: repo(p), analytics: noAnalytics }, { calendar: [a], trails, now })).toEqual([{ comet: a, done: 1, total: 2, badge: 'rare' }]);
    expect(getArchive({ repository: repo(createEmptyProgress()), analytics: noAnalytics }, { calendar: [a], trails, now })[0]?.badge).toBeNull();
    expect(getArchive({ repository: repo(p), analytics: noAnalytics }, { calendar: [a], trails, now: new Date('2026-10-20T00:00:00-03:00') })).toEqual([]);
  });
});
