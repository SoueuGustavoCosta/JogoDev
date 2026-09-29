import { z } from 'zod';

const instant = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/, 'use ISO 8601 com fuso, ex.: 2026-10-12T00:00:00-03:00')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'data inválida');
const id = z.string().regex(/^[a-z][a-z0-9-]*$/);

export const cometSchema = z
  .object({
    id,
    trailId: id,
    name: z.string().min(1).max(20),
    from: instant,
    to: instant,
    rareBadgeId: id,
    commonBadgeId: id,
  })
  .strict()
  .refine((c) => Date.parse(c.from) < Date.parse(c.to), 'from depois de to')
  .refine((c) => c.rareBadgeId !== c.commonBadgeId, 'a insígnia rara e a comum precisam ser diferentes');
