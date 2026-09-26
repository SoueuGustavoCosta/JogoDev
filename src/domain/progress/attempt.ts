import type { QuizAttemptResult } from './types';

/** A melhor de duas tentativas da mesma pergunta: acerto > erro; entre acertos, menos tentativas. */
export function bestQuizAttempt(a: QuizAttemptResult | undefined, b: QuizAttemptResult | undefined): QuizAttemptResult {
  if (!a || !b) return (a ?? b)!;
  if (a.correct !== b.correct) return a.correct ? a : b;
  if (a.correct) return a.triesUsed <= b.triesUsed ? a : b;
  return a.triesUsed >= b.triesUsed ? a : b;
}
