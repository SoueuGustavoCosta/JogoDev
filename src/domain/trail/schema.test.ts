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
