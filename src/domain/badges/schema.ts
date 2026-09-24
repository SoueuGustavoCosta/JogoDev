import { z } from 'zod';

export const badgeSchema = z.object({
  id: z.string().min(1),
  trail: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  crown: z.boolean(),
  rare: z.boolean().optional(),
  unlockedBy: z.string().min(1).nullable(),
  file: z.string().min(1),
});

export const badgeCatalogSchema = z.array(badgeSchema);
