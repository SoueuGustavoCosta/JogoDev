/**
 * Cosméticos do avatar (Etapa 9): comprados com Fragmentos Temporais na Loja do Viajante ou
 * ganhos em eventos. Só visual: nunca dão XP nem vantagem. Nada se compra com dinheiro real.
 */
export type CosmeticSlot = 'frame' | 'color' | 'hair' | 'accessory';

export const COSMETIC_SLOTS: readonly CosmeticSlot[] = ['frame', 'color', 'hair', 'accessory'];

export type CosmeticRarity = 'comum' | 'raro' | 'lendario';

/** Eventos que dão itens que não estão à venda (calendário da Etapa 11, selo da Liga da Etapa 10). */
export type CosmeticEvent = 'eco-solto' | 'convergencia' | 'liga';

/** Moldura do terminal em volta do avatar. */
export type FrameStyle = 'terminal' | 'neon' | 'orbita' | 'dupla' | 'pixel' | 'fenda';
export type HairStyle = 'espetado' | 'franja' | 'coque' | 'moicano' | 'cacheado' | 'chanel';
export type AccessoryStyle = 'oculos' | 'fone' | 'antena' | 'estrela' | 'coroa' | 'ampulheta' | 'selo';

type CosmeticBase = {
  /** Único no catálogo, minúsculas e hífens. Id publicado nunca muda (fica no progresso do viajante). */
  id: string;
  name: string;
  description: string;
  rarity: CosmeticRarity;
  /** Preço em ◆. `null` = não está à venda: só sai no evento indicado em `event`. */
  price: number | null;
  event?: CosmeticEvent;
};

export type CosmeticItem = CosmeticBase &
  (
    | { slot: 'frame'; style: FrameStyle; color: string }
    | { slot: 'color'; from: string; to: string }
    | { slot: 'hair'; style: HairStyle; color: string }
    | { slot: 'accessory'; style: AccessoryStyle; color: string }
  );

export type FrameItem = Extract<CosmeticItem, { slot: 'frame' }>;
export type ColorItem = Extract<CosmeticItem, { slot: 'color' }>;
export type HairItem = Extract<CosmeticItem, { slot: 'hair' }>;
export type AccessoryItem = Extract<CosmeticItem, { slot: 'accessory' }>;

/** O visual montado a partir dos itens equipados (cada encaixe pode estar vazio). */
export type AvatarLook = {
  frame?: FrameItem;
  color?: ColorItem;
  hair?: HairItem;
  accessory?: AccessoryItem;
};
