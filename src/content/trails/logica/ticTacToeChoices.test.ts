import { describe, expect, it } from 'vitest';
import { checkBlankAnswer } from '@/domain/ticTacToe';
import { ticTacToeSteps } from './ticTacToeSteps';

describe('lacunas do Estudo Dirigido viram blocos coerentes', () => {
  for (const step of ticTacToeSteps) {
    step.blanks.forEach((blank, i) => {
      it(`${step.id} lacuna ${i + 1}`, () => {
        expect(blank.wrong?.length ?? 0).toBeGreaterThanOrEqual(2);
        expect(checkBlankAnswer(blank.accept, blank.accept[0])).toBe(true);
        for (const w of blank.wrong ?? []) expect(checkBlankAnswer(blank.accept, w), w).toBe(false);
      });
    });
  }
});
