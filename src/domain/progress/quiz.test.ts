import { describe, expect, it } from 'vitest';
import type { QuizItem } from '../trail/types';
import { fillAnswerMatches, fillChoices, isQuizAnswerCorrect, shuffledOrder } from './quiz';

describe('isQuizAnswerCorrect', () => {
  const mcq: QuizItem = {
    id: 'q1',
    q: 'Qual é a capital?',
    options: ['A', 'B', 'C'],
    answer: 1,
    explain: '',
  };

  it('accepts the correct option index', () => {
    expect(isQuizAnswerCorrect(mcq, { kind: 'choice', optionIndex: 1 })).toBe(true);
  });

  it('rejects a wrong option index', () => {
    expect(isQuizAnswerCorrect(mcq, { kind: 'choice', optionIndex: 0 })).toBe(false);
  });

  it('rejects a fill answer against a multiple-choice item', () => {
    expect(isQuizAnswerCorrect(mcq, { kind: 'fill', text: 'B' })).toBe(false);
  });

  const fill: QuizItem = {
    id: 'q2',
    q: 'Complete:',
    fill: true,
    pre: 'SELECT 1',
    post: '',
    accept: [';'],
    explain: '',
  };

  it('accepts a fill answer matching one of the accepted values', () => {
    expect(isQuizAnswerCorrect(fill, { kind: 'fill', text: ';' })).toBe(true);
  });

  it('normalizes case and surrounding whitespace for fill answers', () => {
    const psqlFill: QuizItem = { ...fill, accept: ['\\dt'] };
    expect(isQuizAnswerCorrect(psqlFill, { kind: 'fill', text: '  \\DT  ' })).toBe(true);
  });

  it('collapses internal repeated whitespace for fill answers', () => {
    const multiWordFill: QuizItem = { ...fill, accept: ['create database'] };
    expect(isQuizAnswerCorrect(multiWordFill, { kind: 'fill', text: 'CREATE   database' })).toBe(true);
  });

  it('rejects a fill answer not in the accepted list', () => {
    expect(isQuizAnswerCorrect(fill, { kind: 'fill', text: ',' })).toBe(false);
  });

  it('rejects a choice answer against a fill item', () => {
    expect(isQuizAnswerCorrect(fill, { kind: 'choice', optionIndex: 0 })).toBe(false);
  });
});

describe('fillAnswerMatches: tolerante ao teclado do celular', () => {
  it('aceita a resposta com () no fim, ponto final e maiúscula', () => {
    for (const text of ['livres', 'livres()', 'Livres', 'livres.', ' livres ( ) ', 'livres;']) {
      expect(fillAnswerMatches(['livres'], text), text).toBe(true);
    }
  });

  it('troca aspas curvas por retas', () => {
    expect(fillAnswerMatches(["'0'", '0'], '\u20180\u2019')).toBe(true);
    expect(fillAnswerMatches(['"olá"'], '\u201Colá\u201D')).toBe(true);
  });

  it('respostas que são só pontuação continuam exigindo a pontuação', () => {
    expect(fillAnswerMatches([';'], ';')).toBe(true);
    expect(fillAnswerMatches([';'], '.')).toBe(false);
  });

  it('continua recusando resposta errada', () => {
    expect(fillAnswerMatches(['livres'], 'vazias')).toBe(false);
    expect(fillAnswerMatches(['livres'], 'livre')).toBe(false);
  });
});


describe('shuffledOrder / fillChoices', () => {
  const seq = (...values: number[]) => {
    let i = 0;
    return () => values[i++ % values.length];
  };

  it('devolve uma permutação dos índices', () => {
    const order = shuffledOrder(4, seq(0.9, 0.1, 0.5));
    expect([...order].sort()).toEqual([0, 1, 2, 3]);
  });

  it('não deixa a resposta sempre no mesmo lugar', () => {
    let s = 7;
    const random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const positions = new Set<number>();
    for (let k = 0; k < 40; k++) positions.add(shuffledOrder(4, random).indexOf(1));
    expect(positions.size).toBe(4);
  });

  it('blocos de completar trazem a resposta certa e os errados', () => {
    const item: QuizItem = { id: 'q1', q: 'q', fill: true, pre: '', post: '', accept: ['livres'], wrong: ['vazias', 'contar'], explain: 'e' };
    expect(fillChoices(item, seq(0.3)).sort()).toEqual(['contar', 'livres', 'vazias']);
  });
});
