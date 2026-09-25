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

/**
 * Ordem embaralhada (Fisher-Yates) dos índices 0..length-1. As respostas certas do conteúdo
 * caíam quase sempre na 2ª opção; a tela mostra as opções nesta ordem, e o índice original
 * continua sendo o que vale para conferir e para o progresso. `random` vem de quem chama
 * (o domínio não sorteia sozinho), para os testes serem determinísticos.
 */
export function shuffledOrder(length: number, random: () => number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Blocos de uma pergunta de completar (certo + errados), já embaralhados; vazio se não tiver blocos. */
export function fillChoices(item: QuizItem, random: () => number): string[] {
  if (!('fill' in item) || !item.wrong?.length) return [];
  const blocks = [item.accept[0], ...item.wrong];
  return shuffledOrder(blocks.length, random).map((i) => blocks[i]);
}

