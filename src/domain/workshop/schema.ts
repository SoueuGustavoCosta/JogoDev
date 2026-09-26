import { z } from 'zod';

const value = z.union([z.string(), z.number(), z.boolean()]);
const test = z.object({ inputs: z.record(z.string().regex(/^[a-z][a-zA-Z0-9_]*$/), value), expected: z.string() }).strict();
const lang = z.enum(['php', 'js', 'python']);
const solution = z.object({ title: z.string().min(1).max(40), code: z.string().min(1) }).strict();

export const workshopSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    title: z.string().min(1).max(40),
    story: z.string().min(1).max(160),
    prompt: z.string().min(1).max(200),
    level: z.enum(['Base', 'Intermediário', 'Avançado']),
    languages: z.array(lang).min(1),
    inputs: z.array(z.object({ name: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/), description: z.string().min(1) }).strict()),
    tests: z.array(test).min(1),
    hiddenTests: z.array(test),
    extra: z.object({ prompt: z.string().min(1).max(160), tests: z.array(test).min(1) }).strict().optional(),
    solutions: z.record(lang, z.array(solution).min(1)),
    hints: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
    after: z.object({ trailId: z.string().min(1), moduleId: z.string().min(1) }).strict().optional(),
  })
  .strict()
  .superRefine((w, ctx) => {
    const names = new Set(w.inputs.map((i) => i.name));
    for (const t of [...w.tests, ...w.hiddenTests, ...(w.extra?.tests ?? [])]) {
      const keys = Object.keys(t.inputs);
      if (keys.length !== names.size || keys.some((k) => !names.has(k))) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${w.id}: teste com entradas diferentes das declaradas` });
      }
    }
    for (const l of w.languages) {
      if (!w.solutions[l]?.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${w.id}: falta solução de referência em ${l}` });
    }
  });
