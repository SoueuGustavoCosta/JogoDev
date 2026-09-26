import { describe, expect, it } from 'vitest';
import type { CosmeticItem } from '@/domain/cosmetics';
import type { Progress } from '@/domain/progress';
import type { AnalyticsPort, LeaderboardPort, ProgressRepository } from '../ports';
import { buyCosmeticItem, equipCosmeticItem, getLooksOf, getMyLook, getShop } from './cosmetics';
import { getProfileSummary } from './presence';

class Memory implements ProgressRepository {
  data: Progress | null = null;
  load() {
    return this.data;
  }
  save(p: Progress) {
    this.data = p;
  }
  clear() {
    this.data = null;
  }
}

class Recording implements AnalyticsPort {
  events: { event: string; props?: Record<string, unknown> }[] = [];
  track(event: string, props?: Record<string, unknown>) {
    this.events.push({ event, props });
  }
}

const catalog: CosmeticItem[] = [
  { id: 'm1', slot: 'frame', style: 'neon', color: '#5ee7ff', name: 'M', description: 'd', rarity: 'comum', price: 20 },
  { id: 'c1', slot: 'hair', style: 'coque', color: '#2c2647', name: 'C', description: 'd', rarity: 'comum', price: 30 },
  { id: 'e1', slot: 'accessory', style: 'coroa', color: '#ffd479', name: 'E', description: 'd', rarity: 'lendario', price: null, event: 'eco-solto' },
];

function setup(fragments: number, extra: Partial<Progress> = {}) {
  const repository = new Memory();
  repository.data = {
    version: 1,
    trails: {},
    travelerUuid: 'u-1',
    anomalies: { '2026-09-26': { anomalyId: 'a', tries: 1, solvedAt: '2026-09-26T12:00:00.000Z', xp: 30, fragments } },
    ...extra,
  };
  const analytics = new Recording();
  const saved: [string, Record<string, string>][] = [];
  const leaderboard = {
    saveCosmetics: async (uuid: string, equipped: Record<string, string>) => {
      saved.push([uuid, equipped]);
    },
  } as unknown as LeaderboardPort;
  return { repository, analytics, leaderboard, saved };
}

describe('Loja do Viajante (casos de uso)', () => {
  it('mostra saldo e estado de cada item', () => {
    const { repository } = setup(25);
    const shop = getShop({ repository }, { catalog });
    expect(shop.balance).toBe(25);
    expect(shop.items.map((i) => i.state)).toEqual(['affordable', 'too-expensive', 'event-only']);
  });

  it('comprar e equipar: desconta, grava, mede e sobe o visual para a nuvem', () => {
    const deps = setup(25);
    expect(buyCosmeticItem(deps, { catalog, itemId: 'm1', equip: true, now: new Date('2026-09-27T00:00:00Z') })).toEqual({ ok: true });
    expect(getShop(deps, { catalog }).balance).toBe(5);
    expect(getProfileSummary({ repository: deps.repository }, { trails: [], badgeCatalog: [] }).fragments).toBe(5);
    expect(getMyLook(deps, { catalog }).frame?.id).toBe('m1');
    expect(deps.saved).toEqual([['u-1', { frame: 'm1' }]]);
    expect(deps.analytics.events.map((e) => e.event)).toEqual(['cosmetic_bought']);
  });

  it('não compra item de evento, item desconhecido, nem sem saldo', () => {
    const deps = setup(25);
    expect(buyCosmeticItem(deps, { catalog, itemId: 'e1' })).toEqual({ ok: false, reason: 'event-only' });
    expect(buyCosmeticItem(deps, { catalog, itemId: 'nada' })).toEqual({ ok: false, reason: 'unknown-item' });
    expect(buyCosmeticItem(deps, { catalog, itemId: 'c1' })).toEqual({ ok: false, reason: 'insufficient' });
    expect(deps.analytics.events).toEqual([]);
  });

  it('equipar item que não é do viajante não faz nada; tirar sincroniza', () => {
    const deps = setup(25);
    expect(equipCosmeticItem(deps, { catalog, slot: 'hair', itemId: 'c1' })).toBe(false);
    buyCosmeticItem(deps, { catalog, itemId: 'm1' });
    expect(equipCosmeticItem(deps, { catalog, slot: 'frame', itemId: 'm1' })).toBe(true);
    expect(equipCosmeticItem(deps, { catalog, slot: 'frame', itemId: null })).toBe(true);
    expect(deps.saved).toEqual([
      ['u-1', { frame: 'm1' }],
      ['u-1', {}],
    ]);
  });

  it('com a sessão perdida, não sobe nada para a nuvem (gravaria na conta errada)', () => {
    const deps = setup(25, { needsSignIn: true });
    buyCosmeticItem(deps, { catalog, itemId: 'm1', equip: true });
    expect(deps.saved).toEqual([]);
    expect(getMyLook(deps, { catalog }).frame?.id).toBe('m1');
  });

  it('visual dos outros: limpa o que vem da rede e nunca lança', async () => {
    const leaderboard = {
      listCosmetics: async () => ({ a: { frame: 'm1', hair: '<x>' }, b: 'lixo', c: { frame: 'sumiu' } }),
    } as unknown as LeaderboardPort;
    const looks = await getLooksOf({ leaderboard }, { uuids: ['a', 'b', 'c'], catalog });
    expect(Object.keys(looks)).toEqual(['a']);
    expect(looks.a.frame?.id).toBe('m1');
    const broken = { listCosmetics: async () => Promise.reject(new Error('rede')) } as unknown as LeaderboardPort;
    expect(await getLooksOf({ leaderboard: broken }, { uuids: ['a'], catalog })).toEqual({});
  });
});
