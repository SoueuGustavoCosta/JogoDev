import { describe, expect, it } from 'vitest';
import type { QuizItem } from '../trail/types';
import { isQuizAnswerCorrect } from './quiz';

describe('isQuizAnswerCorrect', () => {
  const mcq: QuizItem = {
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
