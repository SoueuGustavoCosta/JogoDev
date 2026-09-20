export type QuizAttemptResult = {
  correct: boolean;
  /** 1 = acertou de primeira. */
  triesUsed: number;
};

export type ModuleProgress = {
  moduleId: string;
  quizResults: Record<number, QuizAttemptResult>;
  completed: boolean;
};

export type TrailProgress = {
  trailId: string;
  modules: Record<string, ModuleProgress>;
  missionsCompleted: Record<string, boolean>;
  trophyAwarded: boolean;
};

export type Progress = {
  version: number;
  trails: Record<string, TrailProgress>;
};

export type ExplorationMode = 'sequential' | 'free';
