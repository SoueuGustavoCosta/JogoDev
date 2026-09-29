import { z } from 'zod';

const branch = z
  .object({
    trailId: z.string().regex(/^[a-z][a-z0-9-]*$/),
    name: z.string().min(1).max(16),
    color: z.string().regex(/^#[0-9a-f]{6}$/i),
  })
  .strict();

export const nexusEventSchema = z
  .object({
    island: z.string().regex(/^[a-z][a-z0-9-]*$/),
    branches: z.tuple([branch, branch, branch]),
    launched: z.boolean(),
  })
  .strict()
  .refine((e) => new Set(e.branches.map((b) => b.trailId)).size === 3, 'Ramificações repetidas');
