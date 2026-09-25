import type { QuizItem } from '../trail/types';

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'") // aspas curvas do teclado do celular
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/\s+/g, ' ');
}

/** Versão tolerante: sem aspas em volta, sem `()` no fim e sem `.`/`;` finais. */
function loosen(s: string): string {
  return s
    .replace(/^(['"])(.*)\1$/, '$2')
    .replace(/\s*\(\s*\)\s*$/, '')
    .replace(/[.;]+$/, '')
    .trim();
}

/**
 * Confere uma resposta de completar. Primeiro exata (depois de normalizar maiúsculas,
 * espaços e aspas curvas); se não bater, compara as versões tolerantes, para não dar erro
 * em quem digita `livres()` quando o `()` já vem depois do campo, ou quando o teclado põe
 * um ponto no fim. A etapa tolerante só vale se sobrar algo (a resposta `;` continua `;`).
 */
export function fillAnswerMatches(accept: string[], text: string): boolean {
  const value = normalize(text);
  if (accept.some((accepted) => normalize(accepted) === value)) return true;
  const loose = loosen(value);
  return loose !== '' && accept.some((accepted) => loosen(normalize(accepted)) === loose);
}

export type QuizAnswer =
  | { kind: 'choice'; optionIndex: number }
  | { kind: 'fill'; text: string };

export function isQuizAnswerCorrect(item: QuizItem, answer: QuizAnswer): boolean {
  if ('fill' in item) {
    if (answer.kind !== 'fill') return false;
    return fillAnswerMatches(item.accept, answer.text);
  }
  return answer.kind === 'choice' && answer.optionIndex === item.answer;
}
