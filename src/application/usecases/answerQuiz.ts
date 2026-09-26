import {
  createEmptyProgress,
  getOrCreateModuleProgress,
  getOrCreateTrailProgress,
  isQuizAnswerCorrect,
  xpForQuizAttempt,
  type QuizAnswer,
} from '@/domain/progress';
import type { QuizItem } from '@/domain/trail';
import type { AnalyticsPort, ProgressRepository } from '../ports';

export type AnswerQuizParams = {
  trailId: string;
  moduleId: string;
  /** A pergunta respondida; o resultado fica guardado pelo `item.id`. */
  item: QuizItem;
  answer: QuizAnswer;
};

export type AnswerQuizResult = {
  correct: boolean;
  alreadyAnswered: boolean;
  xpGained: number;
};

export function answerQuiz(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort },
  params: AnswerQuizParams,
): AnswerQuizResult {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const trailProgress = getOrCreateTrailProgress(progress, params.trailId);
  const moduleProgress = getOrCreateModuleProgress(trailProgress, params.moduleId);

  const existing = moduleProgress.quizResults[params.item.id];
  if (existing?.correct) {
    return { correct: true, alreadyAnswered: true, xpGained: 0 };
  }

  const triesUsed = (existing?.triesUsed ?? 0) + 1;
  const correct = isQuizAnswerCorrect(params.item, params.answer);
  const xpBefore = xpForQuizAttempt(existing);
  const xpAfter = xpForQuizAttempt({ correct, triesUsed });
  const xpGained = xpAfter - xpBefore;

  const nextProgress = {
    ...progress,
    trails: {
      ...progress.trails,
      [params.trailId]: {
        ...trailProgress,
        modules: {
          ...trailProgress.modules,
          [params.moduleId]: {
            ...moduleProgress,
            quizResults: {
              ...moduleProgress.quizResults,
              [params.item.id]: { correct, triesUsed },
            },
          },
        },
      },
    },
  };

  deps.repository.save(nextProgress);
  deps.analytics.track('quiz_answered', {
    island: params.trailId,
    module: params.moduleId,
    correct,
    tries: triesUsed,
  });

  return { correct, alreadyAnswered: false, xpGained };
}
