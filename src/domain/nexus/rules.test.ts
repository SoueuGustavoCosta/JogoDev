import { describe, expect, it } from 'vitest';
import { createEmptyProgress, mergeProgress, type Progress } from '../progress';
import { markNexusSeen, mergeNexusSeen, nexusForIsland, nexusOfBranch, nexusState, shouldPlayNexus } from './rules';
import { nexusEventSchema } from './schema';
import type { NexusEvent } from './types';

// Dados de exemplo (a Etapa 2 testa o motor sem conteúdo real).
const example: NexusEvent = {
  island: 'lua-x',
  branches: [
    { trailId: 'ram-a', name: 'Alfa', color: '#3df5ff' },
    { trailId: 'ram-b', name: 'Beta', color: '#b6ff3d' },
    { trailId: 'ram-c', name: 'Gama', color: '#ff3db8' },
  ],
  launched: true,
};

function withBoss(defeated: boolean): Progress {
  return {
    ...createEmptyProgress(),
    trails: { 'lua-x': { trailId: 'lua-x', modules: {}, missionsCompleted: {}, trophyAwarded: true, ...(defeated ? { bossDefeated: true } : {}) } },
  };
}

describe('Evento Nexus', () => {
  it('portais: em breve sem conteúdo, fechados até vencer o chefe, abertos depois', () => {
    expect(nexusState({ ...example, launched: false }, withBoss(true).trails['lua-x'])).toBe('soon');
    expect(nexusState(example, undefined)).toBe('locked');
    expect(nexusState(example, withBoss(false).trails['lua-x'])).toBe('locked');
    expect(nexusState(example, withBoss(true).trails['lua-x'])).toBe('open');
  });

  it('a cena completa toca uma vez só por lua', () => {
    const p = withBoss(true);
    expect(shouldPlayNexus(withBoss(false), example)).toBe(false);
    expect(shouldPlayNexus(p, example)).toBe(true);
    const seen = markNexusSeen(p, 'lua-x', '2026-10-01T00:00:00.000Z');
    expect(shouldPlayNexus(seen, example)).toBe(false);
    expect(markNexusSeen(seen, 'lua-x', 'z')).toBe(seen);
  });

  it('merge entre aparelhos: união por lua, fica a data mais antiga', () => {
    expect(mergeNexusSeen({ a: '2026-10-02' }, { a: '2026-10-01', b: '2026-10-03' })).toEqual({ a: '2026-10-01', b: '2026-10-03' });
    expect(mergeNexusSeen(undefined, { a: 'x' })).toEqual({ a: 'x' });
    const merged = mergeProgress({ ...createEmptyProgress(), nexusSeen: { a: '2' } }, { ...createEmptyProgress(), nexusSeen: { a: '1' } });
    expect(merged.nexusSeen).toEqual({ a: '1' });
    expect('nexusSeen' in mergeProgress(createEmptyProgress(), createEmptyProgress())).toBe(false);
  });

  it('esquema: três Ramificações diferentes, cores válidas', () => {
    expect(() => nexusEventSchema.parse(example)).not.toThrow();
    const repeated = { ...example, branches: [example.branches[0], example.branches[0], example.branches[2]] };
    expect(() => nexusEventSchema.parse(repeated)).toThrow();
    expect(() => nexusEventSchema.parse({ ...example, branches: example.branches.slice(0, 2) })).toThrow();
    expect(nexusForIsland([example], 'lua-x')).toBe(example);
    expect(nexusOfBranch([example], 'ram-b')).toBe(example);
    expect(nexusOfBranch([example], 'lua-x')).toBeUndefined();
  });
});
