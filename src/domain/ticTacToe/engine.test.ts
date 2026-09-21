import { describe, expect, it } from 'vitest';
import {
  checkBlankAnswer,
  checkWin,
  emptyBoard,
  evaluate,
  freeCells,
  isStepComplete,
  machineMove,
  playerMove,
} from './engine';
import type { Board, Step } from './types';

describe('tabuleiro', () => {
  it('nasce vazio, com as 9 casas livres', () => {
    const board = emptyBoard();
    expect(freeCells(board)).toBe(9);
  });

  it('playerMove não muda o tabuleiro original (imutável)', () => {
    const board = emptyBoard();
    const next = playerMove(board, 0, 0, 'J');
    expect(board[0][0]).toBe('0');
    expect(next[0][0]).toBe('J');
  });
});

describe('checkWin', () => {
  it('detecta as 3 linhas', () => {
    let b: Board = emptyBoard();
    b = playerMove(b, 1, 0, 'J');
    b = playerMove(b, 1, 1, 'J');
    b = playerMove(b, 1, 2, 'J');
    expect(checkWin(b, 'J')).toBe(true);
  });

  it('detecta as 3 colunas', () => {
    let b: Board = emptyBoard();
    b = playerMove(b, 0, 2, 'M');
    b = playerMove(b, 1, 2, 'M');
    b = playerMove(b, 2, 2, 'M');
    expect(checkWin(b, 'M')).toBe(true);
  });

  it('detecta a diagonal principal', () => {
    let b: Board = emptyBoard();
    b = playerMove(b, 0, 0, 'J');
    b = playerMove(b, 1, 1, 'J');
    b = playerMove(b, 2, 2, 'J');
    expect(checkWin(b, 'J')).toBe(true);
  });

  it('detecta a diagonal secundária', () => {
    let b: Board = emptyBoard();
    b = playerMove(b, 0, 2, 'M');
    b = playerMove(b, 1, 1, 'M');
    b = playerMove(b, 2, 0, 'M');
    expect(checkWin(b, 'M')).toBe(true);
  });

  it('não acusa vitória sem sequência completa', () => {
    let b: Board = emptyBoard();
    b = playerMove(b, 0, 0, 'J');
    b = playerMove(b, 0, 1, 'J');
    expect(checkWin(b, 'J')).toBe(false);
  });
});

describe('evaluate', () => {
  it('empata quando o tabuleiro enche sem ninguém vencer', () => {
    // J O J / J O O / O J J — cheio, sem sequência de ninguém
    let b: Board = emptyBoard();
    const moves: [number, number, 'J' | 'M'][] = [
      [0, 0, 'J'],
      [0, 1, 'M'],
      [0, 2, 'J'],
      [1, 0, 'J'],
      [1, 1, 'M'],
      [1, 2, 'M'],
      [2, 0, 'M'],
      [2, 1, 'J'],
      [2, 2, 'J'],
    ];
    for (const [l, c, p] of moves) b = playerMove(b, l, c, p);
    expect(evaluate(b)).toBe('empate');
  });

  it('continua "playing" com casas livres e sem vencedor', () => {
    expect(evaluate(emptyBoard())).toBe('playing');
  });
});

describe('machineMove (bug do tabuleiro cheio corrigido)', () => {
  it('nunca trava mesmo com o tabuleiro cheio: devolve null em vez de sortear para sempre', () => {
    let b: Board = emptyBoard();
    for (let l = 0; l < 3; l++) for (let c = 0; c < 3; c++) b = playerMove(b, l, c, 'J');
    expect(machineMove(b, () => 0)).toBeNull();
  });

  it('sorteia só entre as casas livres (pickIndex injetado, motor continua puro)', () => {
    let b: Board = emptyBoard();
    b = playerMove(b, 0, 0, 'J');
    const move = machineMove(b, () => 0);
    expect(move).not.toBeNull();
    expect(b[move!.l][move!.c]).toBe('0');
  });
});

describe('checkBlankAnswer / isStepComplete', () => {
  const step: Step = {
    id: 'posicao',
    title: 'posicao($l, $c)',
    blanks: [
      { hint: 'operador de diferença', accept: ['!=='] },
      { hint: 'ocupada', accept: ['1'] },
      { hint: 'livre', accept: ['0'] },
    ],
  };

  it('aceita a resposta certa ignorando espaços e maiúsculas', () => {
    expect(checkBlankAnswer(['!=='], '  !==  ')).toBe(true);
  });

  it('rejeita resposta errada', () => {
    expect(checkBlankAnswer(['!=='], '==')).toBe(false);
  });

  it('isStepComplete exige todas as lacunas certas', () => {
    expect(isStepComplete(step, ['!==', '1', '0'])).toBe(true);
    expect(isStepComplete(step, ['!==', '1', '2'])).toBe(false);
    expect(isStepComplete(step, ['!=='])).toBe(false);
  });
});
