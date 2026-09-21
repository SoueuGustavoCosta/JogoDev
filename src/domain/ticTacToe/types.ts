/** Casa do tabuleiro: '0' livre, 'J' jogador, 'M' máquina — mesma convenção do protótipo em PHP. */
export type Cell = '0' | 'J' | 'M';

/** Tabuleiro 3x3. */
export type Board = Cell[][];

export type GameResult = 'playing' | 'jogador' | 'maquina' | 'empate';

/** Uma lacuna de código a preencher, com as respostas aceitas (normalizadas na comparação). */
export type StepBlank = {
  /** Dica curta do que a lacuna representa (o comentário do protótipo). */
  hint: string;
  accept: string[];
};

/** Um dos cinco passos do Estudo Dirigido (uma função do arquivo do professor). */
export type Step = {
  id: string;
  title: string;
  blanks: StepBlank[];
};
