import { z } from 'zod';

const quizMultipleChoiceSchema = z.object({
  q: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  answer: z.number().int().nonnegative(),
  explain: z.string().min(1),
});

const quizFillSchema = z.object({
  q: z.string().min(1),
  fill: z.literal(true),
  pre: z.string(),
  post: z.string(),
  accept: z.array(z.string().min(1)).min(1),
  placeholder: z.string().optional(),
  explain: z.string().min(1),
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
  quiz: z.array(quizItemSchema).min(1),
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

const bossRoundSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  talk: z.string().min(1),
  hint: z.string().min(1),
  check: z.array(z.string().min(1)).min(1),
});

const bossSequenceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  talk: z.string().min(1),
  hint: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
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
  bossFightBaseSchema.extend({ mode: z.literal('single-shot'), rounds: z.array(bossRoundSchema).min(1) }),
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
  lab: z.enum(['sql', 'git']).nullable().optional(),
  bossFight: bossFightSchema.optional(),
});
