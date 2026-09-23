/** Saída de uma execução no laboratório de PHP: texto puro (stdout) e/ou erro (stderr). */
export type PhpRunResult = {
  stdout: string;
  stderr: string;
};

/**
 * Porta do laboratório de PHP (Ilha da Lógica): esconde o motor de verdade (PHP em
 * WebAssembly) atrás de `init()`/`run()`, do mesmo jeito que `SqlEnginePort` esconde o
 * PGlite — reutilizável por qualquer trilha que precise rodar PHP de verdade no
 * navegador, sem back-end nenhum.
 */
export interface PhpEnginePort {
  /** Carrega o motor (dynamic import) na primeira vez. Chamadas seguintes não recarregam. */
  init(): Promise<void>;
  /** Executa um script PHP completo (com `<?php`) e devolve tudo que ele imprimiu. */
  run(code: string): Promise<PhpRunResult>;
}
