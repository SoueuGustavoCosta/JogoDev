/**
 * Boss fight de fim de era: motor puro (sem I/O). O conteúdo (rodadas, falas, dicas) vive
 * em `content/trails/<id>/trail.ts`, como `Trail['bossFight']`; aqui só ficam os tipos e as
 * regras que interpretam esse conteúdo. Padrões de validação são regex em texto (strings),
 * nunca `RegExp`/função viva, para o conteúdo continuar validável com Zod (seção 3 do
 * CLAUDE.md: `content/` é dado tipado).
 */

/** Rodada de "um bloco só": o aluno escreve um texto (ex.: SQL) e todo padrão precisa bater. */
export type BossRound = {
  title: string;
  description: string;
  /** Fala do chefe ao entrar nesta rodada. */
  talk: string;
  hint: string;
  /** Fontes de regex (case-insensitive, testadas em `input.toLowerCase()`); TODAS precisam casar. */
  check: string[];
};

/** Rodada "passo a passo": uma sequência de comandos, um regex por passo, em ordem. */
export type BossSequence = {
  title: string;
  description: string;
  talk: string;
  hint: string;
  /** Uma fonte de regex por passo, testada em ordem contra cada comando digitado. */
  steps: string[];
};

export type BossFight =
  | {
      bossName: string;
      tagline: string;
      intro: string[];
      lifeLabel: string;
      mode: 'single-shot';
      rounds: BossRound[];
      badgeId: string;
      badgeTitle: string;
      badgeDescription: string;
    }
  | {
      bossName: string;
      tagline: string;
      intro: string[];
      lifeLabel: string;
      mode: 'sequence';
      rounds: BossSequence[];
      badgeId: string;
      badgeTitle: string;
      badgeDescription: string;
    };

export type BossFightConfig = {
  roundCount: number;
  maxAttempts: number;
  pointsPerStep: number;
  hintPenalty: number;
  initialLives: number;
};

export type BossFightStatus = 'playing' | 'won' | 'lost';

export type BossFightState = {
  roundIndex: number;
  /** Passo dentro da rodada atual (sempre 0 em rodadas de "um bloco só"). */
  stepIndex: number;
  score: number;
  lives: number;
  /** Tentativas erradas seguidas dentro da rodada/passo atual. */
  attempts: number;
  status: BossFightStatus;
};

export const DEFAULT_BOSS_FIGHT_CONFIG: Omit<BossFightConfig, 'roundCount' | 'pointsPerStep'> = {
  maxAttempts: 3,
  hintPenalty: 25,
  initialLives: 3,
};
