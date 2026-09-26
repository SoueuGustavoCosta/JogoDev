import { describe, expect, it } from 'vitest';
import type { QuizItem } from '../trail/types';
import { isQuizAnswerCorrect, orderBank, quizKind } from './quiz';

const order: QuizItem = {
  id: 'q1',
  kind: 'order',
  q: 'Monte a linha que mostra Olá',
  pieces: ['echo', '"Olá"', ';'],
  distractors: ['print', ':'],
  explain: 'e',
};
const output: QuizItem = {
  id: 'q2',
  kind: 'output',
  q: 'O que aparece?',
  code: '<?php echo 2 + 3;',
  lang: 'php',
  options: ['23', '5', '2 + 3'],
  answer: 1,
  explain: 'e',
};
const bug: QuizItem = {
  id: 'q3',
  kind: 'bug',
  q: 'Onde está o bug?',
  lines: ['$idade = 17;', 'if ($idade = 18) {', '  echo "maior";', '}'],
  bugLine: 2,
  explain: 'e',
};
const choice: QuizItem = { id: 'q4', q: 'q', options: ['a', 'b'], answer: 0, explain: 'e' };
const fill: QuizItem = { id: 'q5', q: 'q', fill: true, pre: '', post: '', accept: ['='], explain: 'e' };

describe('quizKind', () => {
  it('reconhece os formatos originais (sem kind) e os novos', () => {
    expect([choice, fill, order, output, bug].map(quizKind)).toEqual(['choice', 'fill', 'order', 'output', 'bug']);
  });
});

describe("montar a linha ('order')", () => {
  it('certo só com todas as peças, na ordem', () => {
    expect(isQuizAnswerCorrect(order, { kind: 'order', pieces: ['echo', '"Olá"', ';'] })).toBe(true);
    expect(isQuizAnswerCorrect(order, { kind: 'order', pieces: ['"Olá"', 'echo', ';'] })).toBe(false);
    expect(isQuizAnswerCorrect(order, { kind: 'order', pieces: ['echo', '"Olá"'] })).toBe(false);
    expect(isQuizAnswerCorrect(order, { kind: 'order', pieces: ['echo', '"Olá"', ';', ':'] })).toBe(false);
    expect(isQuizAnswerCorrect(order, { kind: 'order', pieces: ['print', '"Olá"', ';'] })).toBe(false);
  });

  it('outro tipo de resposta nunca vale', () => {
    expect(isQuizAnswerCorrect(order, { kind: 'choice', optionIndex: 0 })).toBe(false);
    expect(isQuizAnswerCorrect(order, { kind: 'fill', text: 'echo "Olá" ;' })).toBe(false);
  });

  it('o banco tem as peças certas e as que sobram, embaralhadas', () => {
    const bank = orderBank(order, () => 0);
    expect([...bank].sort()).toEqual(['"Olá"', ';', 'echo', ':', 'print'].sort());
    expect(orderBank(choice, Math.random)).toEqual([]);
  });

  it('peças repetidas contam pela posição', () => {
    const twice: QuizItem = { id: 'q9', kind: 'order', q: 'q', pieces: ['f', '(', '(', 'x', ')', ')'], explain: 'e' };
    expect(isQuizAnswerCorrect(twice, { kind: 'order', pieces: ['f', '(', '(', 'x', ')', ')'] })).toBe(true);
    expect(orderBank(twice, () => 0.5)).toHaveLength(6);
  });
});

describe("o que aparece na tela ('output')", () => {
  it('confere pelo índice original da opção', () => {
    expect(isQuizAnswerCorrect(output, { kind: 'choice', optionIndex: 1 })).toBe(true);
    expect(isQuizAnswerCorrect(output, { kind: 'choice', optionIndex: 0 })).toBe(false);
    expect(isQuizAnswerCorrect(output, { kind: 'line', line: 1 })).toBe(false);
  });
});

describe("encontre o bug ('bug')", () => {
  it('certo só na linha do bug (começando em 1)', () => {
    expect(isQuizAnswerCorrect(bug, { kind: 'line', line: 2 })).toBe(true);
    expect(isQuizAnswerCorrect(bug, { kind: 'line', line: 1 })).toBe(false);
    expect(isQuizAnswerCorrect(bug, { kind: 'choice', optionIndex: 1 })).toBe(false);
  });
});

describe('formatos originais continuam iguais', () => {
  it('escolha e completar', () => {
    expect(isQuizAnswerCorrect(choice, { kind: 'choice', optionIndex: 0 })).toBe(true);
    expect(isQuizAnswerCorrect(choice, { kind: 'line', line: 0 })).toBe(false);
    expect(isQuizAnswerCorrect(fill, { kind: 'fill', text: '=' })).toBe(true);
    expect(isQuizAnswerCorrect(fill, { kind: 'order', pieces: ['='] })).toBe(false);
  });
});
