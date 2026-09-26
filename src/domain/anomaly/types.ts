import type { ModuleLevel, QuizItem, TryBlock } from '../trail/types';

/**
 * Anomalia do Dia (Etapa 7): uma missão curta (até ~3 min), a mesma para todos no mesmo dia.
 * O desafio usa os formatos das Etapas 4 (pergunta) e 6 (bloco `try`).
 */
export type Anomaly = {
  id: string;
  /** Id da ilha (era) de onde vem o assunto. */
  era: string;
  /** Título curto, o problema que o Eco causou. */
  title: string;
  /** Uma frase de história envolvendo o Eco. */
  story: string;
  level: ModuleLevel;
  challenge: QuizItem | TryBlock;
};

export const ANOMALY_XP = 30;
export const ANOMALY_FRAGMENTS = 10;
/** Uma anomalia não volta antes de tantos dias. */
export const ANOMALY_NO_REPEAT_DAYS = 20;
/** Dia da anomalia #1: a numeração ("anomalia #127") e o sorteio contam a partir daqui. */
export const ANOMALY_EPOCH = '2026-09-01';
export const ANOMALY_TIME_ZONE = 'America/Sao_Paulo';
