import type { QuizItem } from '../trail/types';

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export type QuizAnswer =
  | { kind: 'choice'; optionIndex: number }
  | { kind: 'fill'; text: string };

export function isQuizAnswerCorrect(item: QuizItem, answer: QuizAnswer): boolean {
  if ('fill' in item) {
    if (answer.kind !== 'fill') return false;
    const value = normalize(answer.text);
    return item.accept.some((accepted) => normalize(accepted) === value);
  }
  return answer.kind === 'choice' && answer.optionIndex === item.answer;
}
