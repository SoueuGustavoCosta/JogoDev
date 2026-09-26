import { z } from 'zod';
import { blockSchema, quizItemSchema } from '../trail/schema';

export const anomalySchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    era: z.string().min(1),
    title: z.string().min(1).max(70),
    story: z.string().min(1).max(160),
    level: z.enum(['Base', 'Intermediário', 'Avançado']),
    challenge: z.unknown(),
  })
  .superRefine((anomaly, ctx) => {
    const challenge = anomaly.challenge as { t?: unknown } | null;
    const result =
      challenge && typeof challenge === 'object' && challenge.t === 'try'
        ? blockSchema.safeParse(challenge)
        : quizItemSchema.safeParse(challenge);
    if (!result.success) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `desafio inválido: ${result.error.message}` });
  });
