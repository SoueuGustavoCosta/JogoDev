import { describe, expect, it } from 'vitest';
import { createEmptyProgress, type Progress } from '@/domain/progress';
import type { NexusEvent } from '@/domain/nexus';
import type { Module, Trail } from '@/domain/trail';
import type { AnalyticsPort, ProgressRepository } from '../ports';
import { getBranchLock, getNexus, markNexusPlayed } from './nexus';

const event: NexusEvent = {
  island: 'lua',
  branches: [
    { trailId: 'ram-a', name: 'A', color: '#111111' },
    { trailId: 'ram-b', name: 'B', color: '#222222' },
    { trailId: 'ram-c', name: 'C', color: '#333333' },
  ],
  launched: true,
};
const mod = (id: string): Module => ({ id, short: id, title: id, lead: 'l', level: 'Base', blocks: [{ t: 'p', x: 'x' }], quiz: [] });
const trails: Trail[] = [{ id: 'ram-a', title: 'A', tagline: 't', symbol: 's', accent: '#000', modules: [mod('m1'), mod('m2')] }];

function repo(initial: Progress): ProgressRepository {
  let p = initial;
  return { load: () => p, save: (n) => (p = n), clear: () => undefined };
}
function analytics(): AnalyticsPort & { events: string[] } {
  const events: string[] = [];
  return { events, track: (e) => void events.push(e) };
}

describe('getNexus / markNexusPlayed', () => {
  it('mostra o estado, se a cena deve tocar e o progresso de cada Ramificação', () => {
    const p: Progress = {
      ...createEmptyProgress(),
      trails: {
        lua: { trailId: 'lua', modules: {}, missionsCompleted: {}, trophyAwarded: true, bossDefeated: true },
        'ram-a': { trailId: 'ram-a', modules: { m1: { moduleId: 'm1', quizResults: {}, completed: true } }, missionsCompleted: {}, trophyAwarded: false },
      },
    };
    const r = repo(p);
    const view = getNexus({ repository: r }, { event, trails });
    expect(view.state).toBe('open');
    expect(view.play).toBe(true);
    expect(view.branches.map((b) => [b.trailId, b.done, b.total, b.exists])).toEqual([
      ['ram-a', 1, 2, true],
      ['ram-b', 0, 0, false],
      ['ram-c', 0, 0, false],
    ]);

    const a = analytics();
    markNexusPlayed({ repository: r, analytics: a }, { island: 'lua', now: new Date('2026-10-01T00:00:00.000Z') });
    markNexusPlayed({ repository: r, analytics: a }, { island: 'lua' });
    expect(a.events).toEqual(['nexus_event_seen']);
    expect(getNexus({ repository: r }, { event, trails }).play).toBe(false);
  });

  it('Ramificação fechada até vencer o chefe da lua; trilha comum nunca trava', () => {
    const lua: Trail = { id: 'lua', title: 'Lua', tagline: 't', symbol: 's', accent: '#000', modules: [] };
    const all = [...trails, lua];
    const locked = repo(createEmptyProgress());
    expect(getBranchLock({ repository: locked }, { events: [event], trailId: 'ram-a', trails: all })?.island).toBe(lua);
    expect(getBranchLock({ repository: locked }, { events: [event], trailId: 'lua', trails: all })).toBeNull();
    const open = repo({
      ...createEmptyProgress(),
      trails: { lua: { trailId: 'lua', modules: {}, missionsCompleted: {}, trophyAwarded: true, bossDefeated: true } },
    });
    expect(getBranchLock({ repository: open }, { events: [event], trailId: 'ram-a', trails: all })).toBeNull();
  });
});
