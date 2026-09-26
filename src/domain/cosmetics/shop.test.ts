import { describe, expect, it } from 'vitest';
import { createEmptyProgress, fragmentBalance, grantItem, type Progress } from '../progress';
import { buyCosmetic, equipCosmetic, resolveLook, sanitizeEquipped, shopItemState, unequipSlot } from './shop';
import type { CosmeticItem } from './types';

const frame: CosmeticItem = { id: 'm1', slot: 'frame', style: 'neon', color: '#5ee7ff', name: 'M', description: 'd', rarity: 'comum', price: 20 };
const hair: CosmeticItem = { id: 'c1', slot: 'hair', style: 'coque', color: '#2c2647', name: 'C', description: 'd', rarity: 'comum', price: 30 };
const eventItem: CosmeticItem = { id: 'e1', slot: 'accessory', style: 'coroa', color: '#ffd479', name: 'E', description: 'd', rarity: 'lendario', price: null, event: 'eco-solto' };
const catalog = [frame, hair, eventItem];

function rich(fragments: number): Progress {
  return {
    ...createEmptyProgress(),
    anomalies: { '2026-09-26': { anomalyId: 'a', tries: 1, solvedAt: '2026-09-26T12:00:00.000Z', xp: 30, fragments } },
  };
}

describe('Loja do Viajante', () => {
  it('estado de cada item: pode comprar, falta ◆, só em evento, comprado, equipado', () => {
    const p = rich(25);
    expect(shopItemState(p, frame)).toBe('affordable');
    expect(shopItemState(p, hair)).toBe('too-expensive');
    expect(shopItemState(p, eventItem)).toBe('event-only');
    const r = buyCosmetic(p, frame, '2026-09-27T00:00:00.000Z');
    if (!r.ok) throw new Error(r.reason);
    expect(shopItemState(r.progress, frame)).toBe('owned');
    expect(shopItemState(equipCosmetic(r.progress, frame), frame)).toBe('equipped');
  });

  it('item de evento não se compra, mesmo com saldo', () => {
    expect(buyCosmetic(rich(999), eventItem, 'z')).toEqual({ ok: false, reason: 'event-only' });
  });

  it('comprar desconta o preço; sem saldo não compra', () => {
    const r = buyCosmetic(rich(25), frame, '2026-09-27T00:00:00.000Z');
    expect(r.ok && fragmentBalance(r.progress)).toBe(5);
    expect(buyCosmetic(rich(25), hair, 'z')).toEqual({ ok: false, reason: 'insufficient' });
  });

  it('só equipa o que é do viajante; equipar troca o do mesmo encaixe; tirar esvazia', () => {
    const p = rich(0);
    expect(equipCosmetic(p, frame)).toBe(p);
    const won = grantItem(p, { itemId: 'e1', at: 'z' });
    const equipped = equipCosmetic(won, eventItem);
    expect(equipped.equippedCosmetics).toEqual({ accessory: 'e1' });
    expect(unequipSlot(equipped, 'accessory').equippedCosmetics).toEqual({});
    expect(unequipSlot(p, 'hair')).toBe(p);
  });

  it('monta o visual ignorando id desconhecido ou no encaixe errado', () => {
    expect(resolveLook({ frame: 'm1', hair: 'm1', accessory: 'sumiu' }, catalog)).toEqual({ frame });
    expect(resolveLook(null, catalog)).toEqual({});
  });

  it('limpa o que vem da rede: só encaixes conhecidos e ids com formato válido', () => {
    expect(sanitizeEquipped({ frame: 'm1', hair: 42, accessory: '<script>', extra: 'x' })).toEqual({ frame: 'm1' });
    expect(sanitizeEquipped('lixo')).toEqual({});
  });
});
