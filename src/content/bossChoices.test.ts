import { describe, expect, it } from 'vitest';
import { checkSequenceStep, checkSingleShot } from '@/domain/bossFight';
import { trailRegistry } from './registry';

/**
 * Pedido do autor: os chefes também viram blocos para tocar (nível iniciante). Toda rodada
 * de todo chefe precisa de blocos; o certo tem que passar na conferência da própria rodada
 * e nenhum errado pode passar (senão o bloco "errado" seria aceito).
 */
describe('rodadas dos chefes têm blocos coerentes com a conferência', () => {
  for (const trail of trailRegistry) {
    const boss = trail.bossFight;
    if (!boss) continue;
    boss.rounds.forEach((_, i) => {
      it(`${trail.id} rodada ${i + 1}`, () => {
        if (boss.mode === 'single-shot') {
          const r = boss.rounds[i];
          expect(r.choices, 'rodada sem blocos').toBeDefined();
          expect(checkSingleShot(r, r.choices!.correct)).toBe(true);
          for (const w of r.choices!.wrong) expect(checkSingleShot(r, w), w).toBe(false);
        } else {
          const r = boss.rounds[i];
          expect(r.stepChoices?.length).toBe(r.steps.length);
          r.stepChoices!.forEach((c, step) => {
            expect(checkSequenceStep(r, step, c.correct), c.correct).toBe(true);
            for (const w of c.wrong) expect(checkSequenceStep(r, step, w), w).toBe(false);
          });
        }
      });
    });
  }
});
