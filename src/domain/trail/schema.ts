import { z } from 'zod';

/**
 * Id de pergunta: minúsculas, dígitos e hífen, começando por letra. Nunca só dígitos,
 * porque chaves só com dígitos são as posições do progresso antigo (ver
 * domain/progress/quizIds.ts).
 */
export const QUIZ_ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const quizIdSchema = z.string().regex(QUIZ_ID_PATTERN);

const quizMultipleChoiceSchema = z.object({
  id: quizIdSchema,
  q: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  answer: z.number().int().nonnegative(),
  explain: z.string().min(1),
  hint: z.string().min(1).optional(),
});

const quizFillSchema = z.object({
  id: quizIdSchema,
  q: z.string().min(1),
  fill: z.literal(true),
  pre: z.string(),
  post: z.string(),
  accept: z.array(z.string().min(1)).min(1),
  wrong: z.array(z.string().min(1)).min(2).max(3).optional(),
  placeholder: z.string().optional(),
  explain: z.string().min(1),
  hint: z.string().min(1).optional(),
});

export const quizItemSchema = z.union([quizFillSchema, quizMultipleChoiceSchema]);

export const blockSchema: z.ZodType = z.discriminatedUnion('t', [
  z.object({ t: z.literal('h'), x: z.string().min(1) }),
  z.object({ t: z.literal('p'), x: z.string().min(1) }),
  z.object({
    t: z.literal('note'),
    k: z.string().min(1),
    x: z.string().min(1),
    warn: z.boolean().optional(),
  }),
  z.object({
    t: z.literal('cards'),
    items: z.array(z.object({ h: z.string().min(1), x: z.string().min(1) })).min(1),
  }),
  z.object({ t: z.literal('ul'), items: z.array(z.string().min(1)).min(1) }),
  z.object({ t: z.literal('ol'), items: z.array(z.string().min(1)).min(1) }),
  z.object({
    t: z.literal('code'),
    file: z.string().min(1),
    x: z.string().min(1),
    nolab: z.boolean().optional(),
    expectError: z.boolean().optional(),
    lang: z.string().optional(),
  }),
  z.object({
    t: z.literal('table'),
    cols: z.array(z.string().min(1)).min(1),
    rows: z.array(z.array(z.string())),
    file: z.string().optional(),
    mac: z.boolean().optional(),
  }),
  z.object({ t: z.literal('flow'), items: z.array(z.string().min(1)).min(1) }),
  z.object({ t: z.literal('raw'), file: z.string().min(1), x: z.string().min(1) }),
  z.object({ t: z.literal('gui'), widget: z.string().min(1).optional() }),
  z.object({ t: z.literal('syntax') }),
  z.object({ t: z.literal('say'), x: z.string().min(1) }),
  z.object({
    t: z.literal('timeline'),
    items: z
      .array(z.object({ y: z.string().min(1), h: z.string().min(1), x: z.string().min(1) }))
      .min(1),
  }),
  z.object({ t: z.literal('out'), file: z.string().min(1), x: z.string().min(1) }),
]);

export const moduleSchema = z.object({
  id: z.string().min(1),
  short: z.string().min(1),
  title: z.string().min(1),
  lead: z.string().min(1),
  level: z.enum(['Base', 'Intermediário', 'Avançado']),
  blocks: z.array(blockSchema).min(1),
  quiz: z
    .array(quizItemSchema)
    .min(1)
    .refine((quiz) => new Set(quiz.map((item) => item.id)).size === quiz.length, {
      message: 'Ids de pergunta repetidos no mesmo módulo',
    }),
});

const missionSelectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  ds: z.enum(['loja', 'vazio']),
  kind: z.literal('select'),
  ordered: z.boolean().optional(),
  brief: z.string().min(1),
  hint: z.string().min(1),
  solution: z.string().min(1),
});

const missionStateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  ds: z.enum(['loja', 'vazio']),
  kind: z.literal('state'),
  brief: z.string().min(1),
  hint: z.string().min(1),
  verify: z.string().min(1),
  expect: z.array(z.array(z.string())),
});

export const missionSchema = z.discriminatedUnion('kind', [
  missionSelectSchema,
  missionStateSchema,
]);

const bossChoiceSchema = z.object({
  correct: z.string().min(1),
  wrong: z.array(z.string().min(1)).min(2).max(3),
});

const bossRoundSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  talk: z.string().min(1),
  hint: z.string().min(1),
  check: z.array(z.string().min(1)).min(1),
  choices: bossChoiceSchema.optional(),
});

const bossSequenceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  talk: z.string().min(1),
  hint: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
  stepChoices: z.array(bossChoiceSchema).optional(),
});

const bossFightBaseSchema = z.object({
  bossName: z.string().min(1),
  tagline: z.string().min(1),
  intro: z.array(z.string().min(1)).min(1),
  lifeLabel: z.string().min(1),
  badgeId: z.string().min(1),
  badgeTitle: z.string().min(1),
  badgeDescription: z.string().min(1),
});

export const bossFightSchema = z.discriminatedUnion('mode', [
  bossFightBaseSchema.extend({
    mode: z.literal('single-shot'),
    codeFile: z.string().min(1),
    rounds: z.array(bossRoundSchema).min(1),
  }),
  bossFightBaseSchema.extend({ mode: z.literal('sequence'), rounds: z.array(bossSequenceSchema).min(1) }),
]);

export const trailSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  symbol: z.string().min(1),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  eyebrow: z.string().min(1).optional(),
  intro: z.array(z.string().min(1)).min(1).optional(),
  modules: z.array(moduleSchema).min(1),
  missions: z.array(missionSchema).optional(),
  lab: z.enum(['sql', 'git', 'php']).nullable().optional(),
  bossFight: bossFightSchema.optional(),
  completionBadgeId: z.string().min(1).optional(),
});
