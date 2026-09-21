export type SymbolId = string;

export type QuizItem =
  | {
      q: string;
      options: string[];
      answer: number;
      explain: string;
    }
  | {
      q: string;
      fill: true;
      pre: string;
      post: string;
      accept: string[];
      placeholder?: string;
      explain: string;
    };

export type Block =
  | { t: 'h'; x: string }
  | { t: 'p'; x: string }
  | { t: 'note'; k: string; x: string; warn?: boolean }
  | { t: 'cards'; items: { h: string; x: string }[] }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'code'; file: string; x: string; nolab?: boolean; expectError?: boolean }
  | { t: 'table'; cols: string[]; rows: string[][]; file?: string; mac?: boolean }
  | { t: 'flow'; items: string[] }
  | { t: 'raw'; file: string; x: string }
  | { t: 'gui' }
  | { t: 'syntax' };

export type ModuleLevel = 'Base' | 'Intermediário' | 'Avançado';

export type Module = {
  id: string;
  short: string;
  title: string;
  lead: string;
  level: ModuleLevel;
  blocks: Block[];
  quiz: QuizItem[];
};

export type MissionDataset = 'loja' | 'vazio';

export type Mission =
  | {
      id: string;
      title: string;
      ds: MissionDataset;
      kind: 'select';
      ordered?: boolean;
      brief: string;
      hint: string;
      /** Reference query the student's result is compared against. */
      solution: string;
    }
  | {
      id: string;
      title: string;
      ds: MissionDataset;
      kind: 'state';
      brief: string;
      hint: string;
      /** Query run after the student's SQL to inspect the database's final state. */
      verify: string;
      /** Expected rows (as strings) returned by `verify`. */
      expect: string[][];
    };

export type BossRound = {
  title: string;
  description: string;
  /** Fala do chefe ao entrar nesta rodada. */
  talk: string;
  hint: string;
  /** Fontes de regex (case-insensitive); TODAS precisam casar no texto do aluno. */
  check: string[];
};

export type BossSequence = {
  title: string;
  description: string;
  talk: string;
  hint: string;
  /** Uma fonte de regex por passo, testada em ordem contra cada comando digitado. */
  steps: string[];
};

/** Chefe de fase que fecha uma era, desbloqueado só depois do troféu da trilha. */
export type BossFight =
  | {
      bossName: string;
      tagline: string;
      /** Conversa da Senhorita Sintaxe antes de liberar o combate (mesmo formato de `Trail.intro`). */
      intro: string[];
      /** Glifo do contador de vidas (ex.: "☕", "💾"). */
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

export type Trail = {
  id: string;
  title: string;
  tagline: string;
  symbol: SymbolId;
  accent: string;
  /** Rótulo da era mostrado na tela de entrada da ilha (ex.: "Era 4 · Código Compartilhado"). */
  eyebrow?: string;
  /**
   * Conversa da Senhorita Sintaxe que abre a ilha, situando o problema da era, em pequenos
   * blocos (um por fala). Cada item pode conter <b> simples. Quando presente, a tela da trilha
   * mostra essa conversa antes de liberar o resto da visão geral.
   */
  intro?: string[];
  modules: Module[];
  missions?: Mission[];
  lab?: 'sql' | 'git' | null;
  /** Chefe de fase de fim de era (desbloqueado só quando a trilha inteira estiver concluída). */
  bossFight?: BossFight;
};
