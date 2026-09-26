import { describe, expect, it } from 'vitest';
import { moduleSchema } from './schema';

const mod = (ids: string[]) => ({
  id: 'm',
  short: 'm',
  title: 'M',
  lead: 'l',
  level: 'Base',
  blocks: [{ t: 'p', x: 'x' }],
  quiz: ids.map((id) => ({ id, q: 'q', options: ['a', 'b'], answer: 0, explain: 'e' })),
});

describe('moduleSchema: ids das perguntas', () => {
  it('aceita ids únicos', () => {
    expect(moduleSchema.safeParse(mod(['q1', 'q2', 'laco-for'])).success).toBe(true);
  });

  it('exige o id', () => {
    const semId = { ...mod(['q1']), quiz: [{ q: 'q', options: ['a', 'b'], answer: 0, explain: 'e' }] };
    expect(moduleSchema.safeParse(semId).success).toBe(false);
  });

  it('recusa id repetido no mesmo módulo', () => {
    expect(moduleSchema.safeParse(mod(['q1', 'q1'])).success).toBe(false);
  });

  it('recusa id só com dígitos (seria confundido com a posição do progresso antigo)', () => {
    expect(moduleSchema.safeParse(mod(['0'])).success).toBe(false);
    expect(moduleSchema.safeParse(mod(['12'])).success).toBe(false);
  });
});

describe('moduleSchema: formatos novos (Etapa 4)', () => {
  const withItem = (item: Record<string, unknown>) => ({ ...mod(['q1']), quiz: [{ id: 'q1', q: 'q', explain: 'e', ...item }] });
  const order = { kind: 'order', pieces: ['echo', '"oi"', ';'], distractors: ['print'] };
  const output = { kind: 'output', code: 'echo 1;', lang: 'php', options: ['1', '2'], answer: 0 };
  const bug = { kind: 'bug', lines: ['a', 'b'], bugLine: 2 };

  it('aceita os três formatos completos', () => {
    for (const item of [order, output, bug]) expect(moduleSchema.safeParse(withItem(item)).success, item.kind).toBe(true);
  });

  it("'order': precisa de 2+ peças e a peça que sobra não pode repetir uma certa", () => {
    expect(moduleSchema.safeParse(withItem({ ...order, pieces: ['echo'] })).success).toBe(false);
    expect(moduleSchema.safeParse(withItem({ ...order, distractors: [';'] })).success).toBe(false);
  });

  it("'output': precisa de código e da resposta dentro das opções", () => {
    expect(moduleSchema.safeParse(withItem({ ...output, answer: 2 })).success).toBe(false);
    expect(moduleSchema.safeParse(withItem({ ...output, code: undefined })).success).toBe(false);
    expect(moduleSchema.safeParse(withItem({ ...output, options: ['1', '1'] })).success).toBe(false);
  });

  it("'bug': a linha do bug existe, começa em 1 e não é vazia", () => {
    expect(moduleSchema.safeParse(withItem({ ...bug, bugLine: 0 })).success).toBe(false);
    expect(moduleSchema.safeParse(withItem({ ...bug, bugLine: 3 })).success).toBe(false);
    expect(moduleSchema.safeParse(withItem({ ...bug, lines: ['a', ''], bugLine: 2 })).success).toBe(false);
  });

  it('formato desconhecido ou formato novo incompleto não passa como múltipla escolha', () => {
    expect(moduleSchema.safeParse(withItem({ kind: 'drag', options: ['a', 'b'], answer: 0 })).success).toBe(false);
    expect(moduleSchema.safeParse(withItem({ kind: 'output', options: ['a', 'b'], answer: 0 })).success).toBe(false);
  });
});
