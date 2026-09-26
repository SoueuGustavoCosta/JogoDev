import { z } from 'zod';

const hex = z.string().regex(/^#[0-9a-f]{6}$/i, 'cor em hexadecimal (#rrggbb)');

const base = {
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1).max(28),
  description: z.string().min(1).max(90),
  rarity: z.enum(['comum', 'raro', 'lendario']),
  price: z.number().int().positive().nullable(),
  event: z.enum(['eco-solto', 'convergencia', 'liga']).optional(),
};

export const cosmeticItemSchema = z
  .discriminatedUnion('slot', [
    z.object({ ...base, slot: z.literal('frame'), style: z.enum(['terminal', 'neon', 'orbita', 'dupla', 'pixel', 'fenda']), color: hex }).strict(),
    z.object({ ...base, slot: z.literal('color'), from: hex, to: hex }).strict(),
    z.object({ ...base, slot: z.literal('hair'), style: z.enum(['espetado', 'franja', 'coque', 'moicano', 'cacheado', 'chanel']), color: hex }).strict(),
    z
      .object({
        ...base,
        slot: z.literal('accessory'),
        style: z.enum(['oculos', 'fone', 'antena', 'estrela', 'coroa', 'ampulheta', 'selo']),
        color: hex,
      })
      .strict(),
  ])
  .superRefine((item, ctx) => {
    // Ou está à venda (preço), ou é de evento (sem preço): nunca os dois, nunca nenhum.
    if ((item.price === null) !== (item.event !== undefined)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${item.id}: item de evento não tem preço; item à venda não tem evento` });
    }
  });
