import { describe, expect, it } from 'vitest';
import { COSMETIC_SLOTS, cosmeticItemSchema } from '@/domain/cosmetics';
import { LEAGUE_SEAL_ITEM_ID } from '@/domain/league';
import { cosmetics } from './cosmetics';

describe('catálogo de cosméticos', () => {
  it('ids únicos e itens válidos', () => {
    expect(new Set(cosmetics.map((c) => c.id)).size).toBe(cosmetics.length);
    for (const item of cosmetics) expect(() => cosmeticItemSchema.parse(item), item.id).not.toThrow();
  });

  it('cada encaixe tem itens à venda', () => {
    for (const slot of COSMETIC_SLOTS) {
      expect(cosmetics.filter((c) => c.slot === slot && c.price !== null).length, slot).toBeGreaterThanOrEqual(3);
    }
  });

  it('alguns itens só saem em eventos', () => {
    expect(cosmetics.some((c) => c.price === null && c.event)).toBe(true);
  });

  it('preço acompanha a raridade (comum < raro < lendário)', () => {
    const max = (r: string) => Math.max(...cosmetics.filter((c) => c.rarity === r && c.price !== null).map((c) => c.price ?? 0));
    const min = (r: string) => Math.min(...cosmetics.filter((c) => c.rarity === r && c.price !== null).map((c) => c.price ?? 0));
    expect(max('comum')).toBeLessThan(min('raro'));
    expect(max('raro')).toBeLessThan(min('lendario'));
  });

  it('o selo da Liga existe e é item de evento da Liga', () => {
    expect(cosmetics.find((c) => c.id === LEAGUE_SEAL_ITEM_ID)).toMatchObject({ price: null, event: 'liga' });
  });
});
