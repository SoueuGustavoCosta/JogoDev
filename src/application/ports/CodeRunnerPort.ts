import type { WorkshopLang, WorkshopValue } from '@/domain/workshop';

/** O que uma execução devolve: o que apareceu na tela, o erro (se parou) e se estourou o tempo. */
export type CodeRunResult = {
  output: string;
  error: string | null;
  timedOut: boolean;
  timeMs: number;
};

/**
 * Porta da Oficina do Viajante (Etapa 13): roda o código do viajante numa linguagem, com as
 * entradas do teste já criadas como variáveis antes do código. Nunca lança por erro do
 * código do viajante: isso vem em `error`. PHP reaproveita o motor do laboratório; JS roda
 * num Web Worker isolado com limite de tempo. Python: TODO(autor) (Pyodide sob demanda).
 */
export interface CodeRunnerPort {
  supports(lang: WorkshopLang): boolean;
  /** Carrega o motor da linguagem (sob demanda). */
  prepare(lang: WorkshopLang): Promise<void>;
  run(lang: WorkshopLang, code: string, inputs: Record<string, WorkshopValue>): Promise<CodeRunResult>;
}
