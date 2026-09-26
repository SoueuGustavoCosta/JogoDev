import { fragmentBalance, ownedCosmeticIds, purchaseItem, type Progress } from '../progress';
import { COSMETIC_SLOTS, type AvatarLook, type CosmeticItem, type CosmeticSlot } from './types';

/** Como o item aparece na loja para este viajante. */
export type ShopItemState = 'equipped' | 'owned' | 'affordable' | 'too-expensive' | 'event-only';

export function shopItemState(progress: Progress, item: CosmeticItem): ShopItemState {
  if (progress.equippedCosmetics?.[item.slot] === item.id && ownedCosmeticIds(progress).has(item.id)) return 'equipped';
  if (ownedCosmeticIds(progress).has(item.id)) return 'owned';
  if (item.price === null) return 'event-only';
  return fragmentBalance(progress) >= item.price ? 'affordable' : 'too-expensive';
}

export type BuyCosmeticResult =
  | { ok: true; progress: Progress }
  | { ok: false; reason: 'insufficient' | 'owned' | 'event-only' | 'invalid' };

/** Compra com ◆. Itens de evento não se compram. */
export function buyCosmetic(progress: Progress, item: CosmeticItem, at: string): BuyCosmeticResult {
  if (item.price === null) return { ok: false, reason: 'event-only' };
  return purchaseItem(progress, { itemId: item.id, price: item.price, at });
}

/** Equipa um item do viajante no seu encaixe (troca o que estava). Item que não é dele: nada muda. */
export function equipCosmetic(progress: Progress, item: CosmeticItem): Progress {
  if (!ownedCosmeticIds(progress).has(item.id)) return progress;
  return { ...progress, equippedCosmetics: { ...progress.equippedCosmetics, [item.slot]: item.id } };
}

/** Tira o item de um encaixe. */
export function unequipSlot(progress: Progress, slot: CosmeticSlot): Progress {
  if (!progress.equippedCosmetics?.[slot]) return progress;
  const rest = { ...progress.equippedCosmetics };
  delete rest[slot];
  return { ...progress, equippedCosmetics: rest };
}

/**
 * Monta o visual a partir dos ids equipados (do próprio progresso ou lidos do Supabase para
 * outro viajante). Id desconhecido ou no encaixe errado é ignorado: um catálogo antigo, ou
 * dado estranho vindo da rede, nunca quebra o avatar.
 */
export function resolveLook(equipped: Record<string, string> | null | undefined, catalog: readonly CosmeticItem[]): AvatarLook {
  const look: AvatarLook = {};
  if (!equipped) return look;
  for (const slot of COSMETIC_SLOTS) {
    const id = equipped[slot];
    const item = id ? catalog.find((c) => c.id === id) : undefined;
    if (!item || item.slot !== slot) continue;
    if (item.slot === 'frame') look.frame = item;
    else if (item.slot === 'color') look.color = item;
    else if (item.slot === 'hair') look.hair = item;
    else look.accessory = item;
  }
  return look;
}

/** Só os encaixes válidos, para salvar na nuvem (nada além de encaixe -> id). */
export function sanitizeEquipped(value: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!value || typeof value !== 'object') return out;
  for (const slot of COSMETIC_SLOTS) {
    const id = (value as Record<string, unknown>)[slot];
    if (typeof id === 'string' && /^[a-z][a-z0-9-]{0,40}$/.test(id)) out[slot] = id;
  }
  return out;
}
