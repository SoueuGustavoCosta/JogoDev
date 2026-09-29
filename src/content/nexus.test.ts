import { describe, expect, it } from 'vitest';
import { nexusEventSchema } from '@/domain/nexus';
import { nexusEvents } from './nexus';
import { trailRegistry } from './registry';

describe('Eventos Nexus (content/nexus.ts)', () => {
  const trailIds = new Set(trailRegistry.map((t) => t.id));

  it('cada evento tem formato válido e sai de uma lua que existe, com chefe', () => {
    for (const e of nexusEvents) {
      expect(() => nexusEventSchema.parse(e), e.island).not.toThrow();
      expect(trailRegistry.find((t) => t.id === e.island)?.bossFight, e.island).toBeDefined();
    }
  });

  it('uma Ramificação pertence a uma lua só, e uma lua tem um evento só', () => {
    const branches = nexusEvents.flatMap((e) => e.branches.map((b) => b.trailId));
    expect(new Set(branches).size).toBe(branches.length);
    expect(new Set(nexusEvents.map((e) => e.island)).size).toBe(nexusEvents.length);
  });

  it('evento lançado só aponta para trilhas que existem', () => {
    for (const e of nexusEvents.filter((x) => x.launched)) {
      for (const b of e.branches) expect(trailIds.has(b.trailId), b.trailId).toBe(true);
    }
  });
});
