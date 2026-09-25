import { fillAnswerMatches } from '../progress/quiz';
import type { Board, Cell, GameResult, Step } from './types';

const LIM = 3;

export function emptyBoard(): Board {
  return Array.from({ length: LIM }, () => Array.from({ length: LIM }, () => '0' as Cell));
}

export function isOccupied(board: Board, l: number, c: number): boolean {
  return board[l][c] !== '0';
}

/** As 8 formas de vencer: 3 linhas, 3 colunas e 2 diagonais. */
export function checkWin(board: Board, player: Cell): boolean {
  for (let i = 0; i < LIM; i++) {
    if (board[i][0] === player && board[i][1] === player && board[i][2] === player) return true;
    if (board[0][i] === player && board[1][i] === player && board[2][i] === player) return true;
  }
  if (board[0][0] === player && board[1][1] === player && board[2][2] === player) return true;
  if (board[0][2] === player && board[1][1] === player && board[2][0] === player) return true;
  return false;
}

export function freeCoords(board: Board): { l: number; c: number }[] {
  const out: { l: number; c: number }[] = [];
  for (let l = 0; l < LIM; l++) {
    for (let c = 0; c < LIM; c++) {
      if (board[l][c] === '0') out.push({ l, c });
    }
  }
  return out;
}

export function freeCells(board: Board): number {
  return freeCoords(board).length;
}

export function playerMove(board: Board, l: number, c: number, player: Cell): Board {
  const next = board.map((row) => row.slice()) as Board;
  next[l][c] = player;
  return next;
}

/**
 * Jogada da máquina: sorteia entre as casas livres. `pickIndex` é injetado (em vez de
 * chamar Math.random aqui dentro) para o motor continuar puro e testável — é a versão já
 * corrigida do bug do farol: como só sorteia entre `freeCoords`, nunca mais entra em laço
 * infinito com o tabuleiro cheio.
 */
export function machineMove(board: Board, pickIndex: (max: number) => number): { l: number; c: number } | null {
  const free = freeCoords(board);
  if (!free.length) return null;
  return free[pickIndex(free.length)];
}

export function evaluate(board: Board): GameResult {
  if (checkWin(board, 'J')) return 'jogador';
  if (checkWin(board, 'M')) return 'maquina';
  if (freeCells(board) === 0) return 'empate';
  return 'playing';
}

export function checkBlankAnswer(accept: string[], value: string): boolean {
  return fillAnswerMatches(accept, value);
}

export function isStepComplete(step: Step, answers: string[]): boolean {
  return step.blanks.every((b, i) => checkBlankAnswer(b.accept, answers[i] ?? ''));
}
