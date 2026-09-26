import { describe, expect, it } from 'vitest';
import { createEmptyProgress } from './factory';
import { mergeProgress } from './merge';
import { recordWorkshop, workshopXpTotal } from './workshops';

describe('oficinas no progresso', () => {
  it('resolver de novo nunca diminui o XP; o extra fica', () => {
    let p = recordWorkshop(createEmptyProgress(), 'calc', { solvedAt: '2026-10-01T00:00:00Z', langs: ['php'], hintsUsed: 0, xp: 50 });
    p = recordWorkshop(p, 'calc', { solvedAt: '2026-10-02T00:00:00Z', langs: ['js'], hintsUsed: 3, xp: 20 });
    expect(p.workshops?.calc).toEqual({ solvedAt: '2026-10-01T00:00:00Z', langs: ['php', 'js'], hintsUsed: 0, xp: 50 });
    p = recordWorkshop(p, 'calc', { solvedAt: '2026-10-03T00:00:00Z', langs: ['php'], hintsUsed: 0, xp: 75, extra: true });
    expect(p.workshops?.calc.extra).toBe(true);
    expect(workshopXpTotal(p)).toBe(75);
  });

  it('merge entre aparelhos: une as oficinas', () => {
    const a = recordWorkshop(createEmptyProgress(), 'calc', { solvedAt: '2026-10-01T00:00:00Z', langs: ['php'], hintsUsed: 1, xp: 40 });
    const b = recordWorkshop(createEmptyProgress(), 'par', { solvedAt: '2026-10-02T00:00:00Z', langs: ['js'], hintsUsed: 0, xp: 50 });
    const m = mergeProgress(a, b);
    expect(Object.keys(m.workshops ?? {}).sort()).toEqual(['calc', 'par']);
    expect(workshopXpTotal(m)).toBe(90);
    expect('workshops' in mergeProgress(createEmptyProgress(), createEmptyProgress())).toBe(false);
  });
});
