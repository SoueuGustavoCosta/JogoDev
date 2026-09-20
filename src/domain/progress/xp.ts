import type { Module, Trail } from '../trail/types';
import type { ModuleProgress, QuizAttemptResult, TrailProgress } from './types';

export const XP_FIRST_TRY = 100;
export const XP_RETRY = 40;
export const XP_MODULE_COMPLETION_BONUS = 150;

export function xpForQuizAttempt(result: QuizAttemptResult | undefined): number {
  if (!result || !result.correct) return 0;
  return result.triesUsed <= 1 ? XP_FIRST_TRY : XP_RETRY;
}

export function xpForModule(module: Module, progress: ModuleProgress | undefined): number {
  const quizXp = module.quiz.reduce(
    (sum, _item, index) => sum + xpForQuizAttempt(progress?.quizResults[index]),
    0,
  );
  const bonus = progress?.completed ? XP_MODULE_COMPLETION_BONUS : 0;
  return quizXp + bonus;
}

export function maxXpForModule(module: Module): number {
  return module.quiz.length * XP_FIRST_TRY + XP_MODULE_COMPLETION_BONUS;
}

export function xpForTrail(trail: Trail, progress: TrailProgress | undefined): number {
  return trail.modules.reduce(
    (sum, module) => sum + xpForModule(module, progress?.modules[module.id]),
    0,
  );
}

export function maxXpForTrail(trail: Trail): number {
  return trail.modules.reduce((sum, module) => sum + maxXpForModule(module), 0);
}
