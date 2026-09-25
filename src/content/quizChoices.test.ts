import { describe, expect, it } from 'vitest';
import { fillAnswerMatches } from '@/domain/progress';
import { trailRegistry } from './registry';

/**
 * Pedido do autor: nível iniciante sem teclado. Toda pergunta de completar de todas as
 * trilhas vira "toque no bloco certo", então precisa de blocos errados, e nenhum bloco
 * errado pode passar como resposta certa (a tolerância de `fillAnswerMatches` é generosa).
 */
describe('perguntas de completar viram blocos em todas as trilhas', () => {
  for (const trail of trailRegistry) {
    for (const mod of trail.modules) {
      mod.quiz.forEach((item, i) => {
        if (!('fill' in item)) return;
        it(`${trail.id}/${mod.id} #${i + 1}`, () => {
          expect(item.wrong?.length ?? 0).toBeGreaterThanOrEqual(2);
          const blocks = [item.accept[0], ...(item.wrong ?? [])];
          expect(new Set(blocks.map((b) => b.toLowerCase())).size).toBe(blocks.length);
          expect(fillAnswerMatches(item.accept, item.accept[0])).toBe(true);
          for (const w of item.wrong ?? []) expect(fillAnswerMatches(item.accept, w), w).toBe(false);
        });
      });
    }
  }
});
