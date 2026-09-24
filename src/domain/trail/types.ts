import type { BossFight } from '../bossFight/types';

export type SymbolId = string;

export type QuizItem =
  | {
      q: string;
      options: string[];
      answer: number;
      explain: string;
      /** Dica opcional para perguntas mais difíceis. Some cedo, aparece após o 1º erro e fica automática a partir do 3º. */
      hint?: string;
    }
  | {
      q: string;
      fill: true;
      pre: string;
      post: string;
      accept: string[];
      placeholder?: string;
      explain: string;
      /** Dica opcional para perguntas mais difíceis. Some cedo, aparece após o 1º erro e fica automática a partir do 3º. */
      hint?: string;
    };

export type Block =
  | { t: 'h'; x: string }
  | { t: 'p'; x: string }
  | { t: 'note'; k: string; x: string; warn?: boolean }
  | { t: 'cards'; items: { h: string; x: string }[] }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'code'; file: string; x: string; nolab?: boolean; expectError?: boolean; lang?: string }
  | { t: 'table'; cols: string[]; rows: string[][]; file?: string; mac?: boolean }
  | { t: 'flow'; items: string[] }
  | { t: 'raw'; file: string; x: string }
  /** Widget interativo registrado por id (ver presentation/blocks). Sem `widget`, é só um placeholder "em construção". */
  | { t: 'gui'; widget?: string }
  | { t: 'syntax' }
  /** Fala embutida da Senhorita Sintaxe dentro de uma lição; `{name}` vira o nome do viajante (ver domain/prologue). */
  | { t: 'say'; x: string }
  /** Linha do tempo de fatos históricos datados, com fonte já embutida no texto. */
  | { t: 'timeline'; items: { y: string; h: string; x: string }[] }
  /** Saída de programa (o que apareceu na tela), sem realce de sintaxe — distinto de `code`. */
  | { t: 'out'; file: string; x: string };

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

// Os tipos do chefe de fase vivem em domain/bossFight (motor puro, compartilhado entre
// eras); aqui só reexportamos para quem só conhece domain/trail.
export type { BossFight, BossRound, BossSequence } from '../bossFight/types';

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
  lab?: 'sql' | 'git' | 'php' | null;
  /** Chefe de fase de fim de era (desbloqueado só quando a trilha inteira estiver concluída). */
  bossFight?: BossFight;
  /**
   * Id da insígnia "rara" do catálogo (ver domain/badges), concedida ao concluir todos
   * os módulos da trilha (o troféu) — o degrau do meio entre as insígnias comuns de cada
   * módulo e a insígnia lendária do chefe de fase (`bossFight.badgeId`).
   */
  completionBadgeId?: string;
};
