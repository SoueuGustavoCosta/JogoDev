import {
  buyCosmetic,
  equipCosmetic,
  resolveLook,
  sanitizeEquipped,
  shopItemState,
  unequipSlot,
  type AvatarLook,
  type CosmeticItem,
  type CosmeticSlot,
  type ShopItemState,
} from '@/domain/cosmetics';
import { createEmptyProgress, fragmentBalance, fragmentsEarned, type Progress } from '@/domain/progress';
import type { AnalyticsPort, LeaderboardPort, ProgressRepository } from '../ports';

export type ShopView = {
  balance: number;
  earned: number;
  items: { item: CosmeticItem; state: ShopItemState }[];
  look: AvatarLook;
};

/** Tudo que a Loja do Viajante mostra: saldo, cada item com seu estado, e o visual atual. */
export function getShop(deps: { repository: ProgressRepository }, params: { catalog: readonly CosmeticItem[] }): ShopView {
  const progress = deps.repository.load() ?? createEmptyProgress();
  return {
    balance: fragmentBalance(progress),
    earned: fragmentsEarned(progress),
    items: params.catalog.map((item) => ({ item, state: shopItemState(progress, item) })),
    look: resolveLook(progress.equippedCosmetics, params.catalog),
  };
}

export function openShop(deps: { analytics: AnalyticsPort }): void {
  deps.analytics.track('shop_opened');
}

/** O visual do próprio viajante (cabeçalho, mapa). */
export function getMyLook(deps: { repository: ProgressRepository }, params: { catalog: readonly CosmeticItem[] }): AvatarLook {
  return resolveLook(deps.repository.load()?.equippedCosmetics, params.catalog);
}

export type BuyResult = { ok: true } | { ok: false; reason: 'insufficient' | 'owned' | 'event-only' | 'invalid' | 'unknown-item' };

/** Compra com ◆ (ação do próprio viajante). Nada de dinheiro real: os ◆ só se ganham jogando. */
export function buyCosmeticItem(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort; leaderboard: LeaderboardPort },
  params: { catalog: readonly CosmeticItem[]; itemId: string; equip?: boolean; now?: Date },
): BuyResult {
  const item = params.catalog.find((c) => c.id === params.itemId);
  if (!item) return { ok: false, reason: 'unknown-item' };
  const progress = deps.repository.load() ?? createEmptyProgress();
  const result = buyCosmetic(progress, item, (params.now ?? new Date()).toISOString());
  if (!result.ok) return result;
  deps.analytics.track('cosmetic_bought', { item: item.id, price: item.price ?? 0 });
  const next = params.equip ? equipCosmetic(result.progress, item) : result.progress;
  deps.repository.save(next);
  if (params.equip) syncEquipped(deps, next);
  return { ok: true };
}

/** Equipa um item do viajante (ou tira, com `itemId: null`) e sincroniza com o avatar na nuvem. */
export function equipCosmeticItem(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort; leaderboard: LeaderboardPort },
  params: { catalog: readonly CosmeticItem[]; slot: CosmeticSlot; itemId: string | null },
): boolean {
  const progress = deps.repository.load() ?? createEmptyProgress();
  let next: Progress;
  if (params.itemId === null) {
    next = unequipSlot(progress, params.slot);
  } else {
    const item = params.catalog.find((c) => c.id === params.itemId && c.slot === params.slot);
    if (!item) return false;
    next = equipCosmetic(progress, item);
    if (next === progress) return progress.equippedCosmetics?.[params.slot] === item.id;
    deps.analytics.track('cosmetic_equipped', { item: item.id });
  }
  if (next === progress) return true;
  deps.repository.save(next);
  syncEquipped(deps, next);
  return true;
}

/**
 * Sobe os itens equipados junto do avatar (tabela `jogadores`). Só quando o viajante já tem
 * identidade e a sessão não se perdeu (gravaria na conta errada). Falha em silêncio.
 */
function syncEquipped(deps: { leaderboard: LeaderboardPort }, progress: Progress): void {
  if (!progress.travelerUuid || progress.needsSignIn) return;
  void deps.leaderboard.saveCosmetics(progress.travelerUuid, sanitizeEquipped(progress.equippedCosmetics));
}

/**
 * Visual de outros viajantes (Hall, quem está online), por uuid. Nunca lança: sem rede ou
 * sem a coluna no banco, todos aparecem sem cosméticos.
 */
export async function getLooksOf(
  deps: { leaderboard: LeaderboardPort },
  params: { uuids: string[]; catalog: readonly CosmeticItem[] },
): Promise<Record<string, AvatarLook>> {
  let raw: Record<string, unknown> = {};
  try {
    raw = await deps.leaderboard.listCosmetics(params.uuids);
  } catch {
    return {};
  }
  const out: Record<string, AvatarLook> = {};
  for (const [uuid, value] of Object.entries(raw)) {
    const look = resolveLook(sanitizeEquipped(value), params.catalog);
    if (Object.keys(look).length > 0) out[uuid] = look;
  }
  return out;
}
