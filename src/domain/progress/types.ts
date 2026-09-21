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
  /** Insígnia do chefe de fase de fim de era conquistada. Campo novo e opcional: progresso salvo antes dele continua válido sem migração (chave simplesmente ausente). */
  bossDefeated?: boolean;
};

export type Progress = {
  version: number;
  /** Nome do viajante, guardado só no navegador (nunca vai para as métricas). */
  travelerName?: string;
  prologueSeen?: boolean;
  trails: Record<string, TrailProgress>;
};

export type ExplorationMode = 'sequential' | 'free';
