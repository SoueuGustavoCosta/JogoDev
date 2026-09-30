import { z } from 'zod';

/** Esquema do conteúdo da Era da Web: um erro de conteúdo quebra o CI, não a tela do aluno. */

const tone = z.enum(['html', 'css', 'js', 'violet', 'neon', 'pink', 'bad']);
const text = z.string().min(1);
const base = {
  title: text,
  sub: text,
  time: z.number().int().positive().optional(),
  hint: text.optional(),
  timeout: text.optional(),
};
const lang = z.enum(['html', 'css', 'js']);

const order = z
  .object({
    ...base,
    type: z.literal('order'),
    tokens: z.array(text).min(2),
    extra: z.array(text).optional(),
    block: z.boolean().optional(),
    preview: z.boolean().optional(),
  })
  .refine((m) => !(m.extra ?? []).some((e) => m.tokens.includes(e)), 'peça extra igual a uma peça certa');

const sort = z
  .object({
    ...base,
    type: z.literal('sort'),
    maxErr: z.number().int().positive().optional(),
    buckets: z.array(z.object({ id: text, label: text, s: text.optional(), tone })).min(2),
    items: z.array(z.tuple([text, text])).min(3),
  })
  .refine((m) => m.items.every(([, b]) => m.buckets.some((x) => x.id === b)), 'carta aponta para um balde que não existe');

const catchMission = z
  .object({
    ...base,
    type: z.literal('catch'),
    need: z.number().int().positive(),
    maxErr: z.number().int().positive().optional(),
    good: z.array(text).min(2),
    bad: z.array(text).min(2),
  })
  .refine((m) => !m.bad.some((b) => m.good.includes(b)), 'item certo também está na lista de errados');

const bug = z
  .object({
    ...base,
    type: z.literal('bug'),
    lines: z.array(z.string()).min(2),
    bad: z.array(z.number().int().nonnegative()).min(1),
    why: z.array(z.string()).optional(),
    maxErr: z.number().int().positive().optional(),
    mono: z.boolean().optional(),
  })
  .refine((m) => m.bad.every((i) => i < m.lines.length && m.lines[i]!.trim() !== ''), 'linha com bug fora da lista ou vazia')
  .refine((m) => new Set(m.bad).size === m.bad.length, 'linha com bug repetida');

const code = z.object({
  ...base,
  type: z.literal('code'),
  lang: z.enum(['html', 'css', 'js']),
  html: z.string().optional(),
  start: z.string().optional(),
  narrow: z.boolean().optional(),
  solution: text,
  check: z.function(),
  capture: z.function().optional(),
});

const tune = z
  .object({
    ...base,
    type: z.literal('tune'),
    mode: z.enum(['box', 'flex', 'grid', 'pos']),
    ctrls: z.array(z.object({ p: text, o: z.array(text).min(2) })).min(1),
    target: z.record(text),
  })
  .refine(
    (m) => Object.entries(m.target).every(([p, v]) => m.ctrls.some((c) => c.p === p && c.o.includes(v))),
    'alvo com valor que não está nos controles',
  )
  .refine((m) => m.ctrls.some((c) => c.o[0] !== m.target[c.p]), 'o alvo já começa encaixado');

const blocks = z
  .object({
    ...base,
    type: z.literal('blocks'),
    lang,
    html: z.string().optional(),
    pre: z.string().optional(),
    post: z.string().optional(),
    tokens: z.array(text).min(2),
    extra: z.array(text).optional(),
    block: z.boolean().optional(),
    joiner: z.string().optional(),
    tab: z.boolean().optional(),
    narrow: z.boolean().optional(),
    capture: z.function().optional(),
  })
  .refine((m) => !(m.extra ?? []).some((e) => m.tokens.includes(e)), 'bloco extra igual a um bloco certo');

const fill = z
  .object({
    ...base,
    type: z.literal('fill'),
    lang,
    html: z.string().optional(),
    pre: z.string(),
    post: z.string(),
    options: z.array(text).min(2).max(4),
    answer: z.union([text, z.array(text).min(1)]),
    narrow: z.boolean().optional(),
    capture: z.function().optional(),
  })
  .refine((m) => (Array.isArray(m.answer) ? m.answer : [m.answer]).every((a) => m.options.includes(a)), 'resposta fora das opções')
  .refine((m) => m.options.some((o) => !(Array.isArray(m.answer) ? m.answer : [m.answer]).includes(o)), 'nenhuma opção errada')
  .refine((m) => new Set(m.options).size === m.options.length, 'opção repetida');

const quiz = z
  .object({ ...base, type: z.literal('quiz'), time: z.number().int().positive(), code: text, q: text.optional(), options: z.array(text).length(3), answer: text })
  .refine((m) => m.options.includes(m.answer), 'resposta fora das opções')
  .refine((m) => new Set(m.options).size === 3, 'opção repetida');

const prune = z.object({
  ...base,
  type: z.literal('prune'),
  maxErr: z.number().int().positive().optional(),
  sets: z
    .array(
      z
        .object({ snips: z.array(text).length(3), bad: z.number().int().min(0).max(2), why: text.optional() })
        .refine((x) => new Set(x.snips).size === 3, 'trecho repetido'),
    )
    .min(1),
});

const defuse = z
  .object({
    ...base,
    type: z.literal('defuse'),
    time: z.number().int().positive(),
    lines: z.array(z.string()).min(3),
    bad: z.number().int().nonnegative(),
    why: text.optional(),
    maxErr: z.number().int().positive().optional(),
  })
  .refine((m) => m.bad < m.lines.length && m.lines[m.bad]!.trim() !== '', 'linha com bug fora da lista ou vazia');

const portal = z
  .object({
    ...base,
    type: z.literal('portal'),
    time: z.number().int().positive(),
    tokens: z.array(text).min(2),
    extra: z.array(text).optional(),
    block: z.boolean().optional(),
    preview: z.boolean().optional(),
  })
  .refine((m) => !(m.extra ?? []).some((e) => m.tokens.includes(e)), 'peça extra igual a uma peça certa');

export const webMissionSchema = z.union([order, sort, catchMission, bug, code, tune, blocks, fill, quiz, prune, defuse, portal]);

const gem = z.object({
  badgeId: text,
  name: text,
  icon: text,
  sides: z.number().int().min(4).max(12),
  c1: text,
  c2: text,
  tier: z.enum(['comum', 'rara', 'lendaria', 'lua']),
});

const doc = z.object({ label: text, url: z.string().url().startsWith('https://') });
const say = z.array(text).min(1);

export const webEraTrailSchema = z.object({
  id: text,
  title: text,
  year: text,
  color: text,
  say,
  doc,
  gem,
  piece: z.enum(['files', 'title', 'hero', 'links', 'sections', 'color', 'cards', 'flex', 'greet', 'dark']),
  pieceName: text,
  rounds: z.array(webMissionSchema).min(2),
});

export const webBossSchema = z.object({ id: text, name: text, face: text, say, rounds: z.array(webMissionSchema).min(3) });

export const webMoonSchema = z.object({
  id: text,
  name: text,
  short: text,
  color: text,
  description: text,
  boss: webBossSchema,
  gem,
  trails: z.array(z.object({ id: text, title: text, icon: text, say, doc, rounds: z.array(webMissionSchema).min(2) })).length(5),
});

export const webBranchSchema = z.object({
  id: text,
  name: text,
  color: text,
  since: text,
  parent: text.optional(),
  doc: z.string().url().startsWith('https://'),
  future: z.boolean().optional(),
  trails: z.array(text).length(5),
});
