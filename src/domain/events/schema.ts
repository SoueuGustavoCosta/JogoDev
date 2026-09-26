import { z } from 'zod';

const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)) && new Date(`${d}T00:00:00Z`).toISOString().startsWith(d), 'data inválida');
const range = z.object({ from: day, to: day }).strict().refine((r) => r.from <= r.to, 'from depois de to');
const weekly = z.object({ weekly: z.array(z.enum(['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'])).min(1) }).strict();
const when = z.union([weekly, range]);

const base = {
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  title: z.string().min(1).max(40),
  description: z.string().min(1).max(90),
};

export const gameEventSchema = z.discriminatedUnion('kind', [
  z.object({ ...base, kind: z.literal('surto'), multiplier: z.number().min(1.1).max(3), when }).strict(),
  z
    .object({
      ...base,
      kind: z.literal('eco-solto'),
      rewardItemId: z.string().min(1),
      bonusFragments: z.number().int().min(0).max(100),
      workshopId: z.string().regex(/^[a-z][a-z0-9-]*$/).optional(),
      when,
    })
    .strict(),
  z
    .object({
      ...base,
      kind: z.literal('convergencia'),
      target: z.number().int().positive(),
      metric: z.enum(['anomalias', 'oficinas']).optional(),
      rewardItemId: z.string().min(1),
      when: range,
    })
    .strict(),
]);

export const eventCalendarSchema = z
  .array(gameEventSchema)
  .superRefine((events, ctx) => {
    const ids = new Set<string>();
    for (const e of events) {
      if (ids.has(e.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `id repetido: ${e.id}` });
      ids.add(e.id);
    }
  });
