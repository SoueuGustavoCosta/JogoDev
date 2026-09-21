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
  /**
   * Identificador anônimo do viajante para o Hall dos Viajantes (Supabase). Campo novo
   * e opcional: progresso salvo antes dele continua válido sem migração (chave ausente
   * até a primeira sincronização, quando é gerado com `crypto.randomUUID()`).
   */
  travelerUuid?: string;
  prologueSeen?: boolean;
  trails: Record<string, TrailProgress>;
  /**
   * Insígnias compartilhadas (ver domain/badges), por id -> data ISO de conquista. Campo
   * novo, de nível raiz (as insígnias atravessam trilhas), e opcional: progresso salvo
   * antes dele continua válido sem migração (chave simplesmente ausente).
   */
  badgesEarned?: Record<string, string>;
  /**
   * Cache local do cabeçalho do viajante (avatar + sequência diária), preenchido pelas
   * sincronizações com o Supabase (ver LeaderboardPort/checkInDaily/uploadAvatarPhoto) e
   * lido primeiro pela UI, sem esperar rede. Campos novos e opcionais: progresso salvo
   * antes deles continua válido sem migração (chaves simplesmente ausentes).
   */
  avatarUrl?: string;
  streakCurrent?: number;
  streakBest?: number;
  ultimoDiaAtivo?: string;
  /**
   * Cache local do código de recuperação (o Supabase só guarda o hash, nunca o texto puro
   * — ver `supabase/schema.sql`). Guardado aqui pra a tela do Viajante poder mostrar o
   * código de novo a qualquer momento neste aparelho, sem o susto de "só aparece uma vez".
   * Campo novo e opcional: progresso salvo antes dele continua válido sem migração.
   */
  recoveryCode?: string;
};

export type ExplorationMode = 'sequential' | 'free';
