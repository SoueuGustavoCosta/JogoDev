import { describe, expect, it } from 'vitest';
import { bonusXpTotal, recordBonusXp } from './bonusXp';
import { createEmptyProgress } from './factory';
import { mergeProgress } from './merge';

describe('XP extra de eventos', () => {
  it('soma por fonte, sem contar a mesma fonte duas vezes', () => {
    let p = recordBonusXp(createEmptyProgress(), 'surto:quiz:a', 100);
    p = recordBonusXp(p, 'surto:module:m', 150);
    expect(recordBonusXp(p, 'surto:quiz:a', 100)).toBe(p);
    expect(recordBonusXp(p, 'x', 0)).toBe(p);
    expect(bonusXpTotal(p)).toBe(250);
  });

  it('merge entre aparelhos: união por id; vitórias do Eco Solto também', () => {
    const a = { ...recordBonusXp(createEmptyProgress(), 'surto:quiz:a', 100), ecoSoltoWins: ['2026-10-02'] };
    const b = { ...recordBonusXp(createEmptyProgress(), 'surto:quiz:b', 40), ecoSoltoWins: ['2026-10-09', '2026-10-02'] };
    const m = mergeProgress(a, b);
    expect(bonusXpTotal(m)).toBe(140);
    expect(m.ecoSoltoWins).toEqual(['2026-10-02', '2026-10-09']);
  });
});
