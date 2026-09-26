import type { PaletteBlock } from './blocks';

/**
 * Oficina do Viajante (Etapa 13): mini projetos em que o viajante escolhe a linguagem e o
 * jeito de resolver. Princípio: o jogo confere o RESULTADO (a saída), nunca a forma do
 * código. Qualquer solução que passe nos testes está certa.
 */

/** Linguagens da Oficina. Python: TODO(autor) Pyodide sob demanda (ainda não oferecido). Java: não oferecido. */
export type WorkshopLang = 'php' | 'js' | 'python';

export type WorkshopValue = string | number | boolean;

/** Uma variável que o desafio já entrega pronta (ex.: `a`, `b`, `op`; em PHP vira `$a`). */
export type WorkshopInput = { name: string; description: string };

/** Entradas -> saída esperada (o que o programa precisa mostrar na tela). */
export type WorkshopTest = { inputs: Record<string, WorkshopValue>; expected: string };

export type WorkshopSolution = {
  /** Como a solução foi feita ("Com switch", "Com um dicionário"...). */
  title: string;
  code: string;
};

export type Workshop = {
  /** Único, minúsculas e hífens. Id publicado nunca muda (fica no progresso). */
  id: string;
  title: string;
  /** Uma frase da Sintaxe contando o que o Eco aprontou. */
  story: string;
  /** Enunciado curto. */
  prompt: string;
  level: 'Base' | 'Intermediário' | 'Avançado';
  languages: WorkshopLang[];
  inputs: WorkshopInput[];
  /** Testes que o viajante vê antes de começar. */
  tests: WorkshopTest[];
  /** Testes surpresa: só rodam no "Testar", nunca aparecem antes. */
  hiddenTests: WorkshopTest[];
  /** Desafio extra opcional: o mesmo código precisa passar também nestes testes. */
  extra?: { prompt: string; tests: WorkshopTest[] };
  /** Soluções de referência, mostradas como "outros jeitos certos" só DEPOIS do acerto. */
  solutions: Partial<Record<WorkshopLang, WorkshopSolution[]>>;
  /** Escada de dicas: ideia, estrutura, quase pronto. */
  hints: [string, string, string];
  /** Modo blocos (13B): peças de código por linguagem (ver `blocks.ts`). */
  palettes?: Partial<Record<WorkshopLang, PaletteBlock[]>>;
  /** Módulo relacionado: a oficina aparece na ilha depois dele. */
  after?: { trailId: string; moduleId: string };
};

/** Resultado de um teste rodado. */
export type WorkshopTestResult = {
  test: WorkshopTest;
  kind: 'visible' | 'hidden' | 'extra';
  output: string;
  error: string | null;
  timedOut: boolean;
  passed: boolean;
};
