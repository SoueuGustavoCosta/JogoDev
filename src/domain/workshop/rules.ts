import type { WorkshopLang, WorkshopTest, WorkshopTestResult, WorkshopValue } from './types';

export const WORKSHOP_XP = 50;
export const WORKSHOP_EXTRA_XP = 25;
export const WORKSHOP_HINT_COST = 10;
export const WORKSHOP_MIN_XP = 20;

/** XP da oficina: 50 ao passar em tudo, menos 10 por dica (nunca abaixo de 20), +25 pelo extra. */
export function workshopXp(params: { hintsUsed: number; extra: boolean }): number {
  const base = Math.max(WORKSHOP_MIN_XP, WORKSHOP_XP - WORKSHOP_HINT_COST * Math.max(0, params.hintsUsed));
  return base + (params.extra ? WORKSHOP_EXTRA_XP : 0);
}

const NUMBER = /^[-+]?(\d+([.,]\d*)?|[.,]\d+)(e[-+]?\d+)?$/i;

function normalizeLine(line: string): string {
  return line
    .replace(/\s+$/u, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function lines(text: string): string[] {
  const all = text.replace(/\r\n?/g, '\n').split('\n').map(normalizeLine);
  while (all.length > 0 && all[all.length - 1] === '') all.pop();
  while (all.length > 0 && all[0] === '') all.shift();
  return all;
}

function sameNumber(a: string, b: string): boolean {
  if (!NUMBER.test(a.trim()) || !NUMBER.test(b.trim())) return false;
  const x = Number(a.trim().replace(',', '.'));
  const y = Number(b.trim().replace(',', '.'));
  return Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
}

/**
 * Compara a saída com a esperada, com tolerância: ignora espaços no fim das linhas e linhas
 * em branco no começo e no fim, maiúsculas/minúsculas e acentos; em linhas numéricas, aceita
 * 5 e 5.0 (e vírgula decimal).
 */
export function outputMatches(actual: string, expected: string): boolean {
  const a = lines(actual);
  const e = lines(expected);
  if (a.length !== e.length) return false;
  return a.every((line, i) => line === e[i] || line.trim() === e[i].trim() || sameNumber(line, e[i]));
}

function literal(lang: WorkshopLang, value: WorkshopValue): string {
  if (typeof value === 'boolean') return lang === 'python' ? (value ? 'True' : 'False') : String(value);
  if (typeof value === 'number') return String(value);
  const json = JSON.stringify(value);
  // Em PHP, aspas duplas interpolam variáveis: o $ precisa de escape.
  return lang === 'php' ? json.replace(/\$/g, '\\$') : json;
}

/** Linha que cria as variáveis de entrada (tudo numa linha só, para não mudar a numeração). */
export function inputsPreamble(lang: WorkshopLang, inputs: Record<string, WorkshopValue>): string {
  const entries = Object.entries(inputs);
  if (lang === 'php') return entries.map(([k, v]) => `$${k} = ${literal(lang, v)};`).join(' ');
  if (lang === 'js') return entries.map(([k, v]) => `var ${k} = ${literal(lang, v)};`).join(' ');
  return entries.map(([k, v]) => `${k} = ${literal(lang, v)}`).join('; ');
}

/** O código do viajante sem a abertura `<?php` (o motor põe a dele). */
export function stripPhpOpenTag(code: string): string {
  return code.replace(/^\s*<\?php\b/, '');
}

/** Como a entrada aparece para o viajante: `a = 2, op = "+"` (com $ no PHP). */
export function describeInputs(lang: WorkshopLang, inputs: Record<string, WorkshopValue>): string {
  return Object.entries(inputs)
    .map(([k, v]) => `${lang === 'php' ? '$' : ''}${k} = ${typeof v === 'string' ? JSON.stringify(v) : String(v)}`)
    .join(', ');
}

/** Resumo da execução: quantos passaram e o primeiro que falhou. */
export function summarizeResults(results: readonly WorkshopTestResult[]): {
  passed: number;
  total: number;
  firstFailure: WorkshopTestResult | null;
} {
  return {
    passed: results.filter((r) => r.passed).length,
    total: results.length,
    firstFailure: results.find((r) => !r.passed) ?? null,
  };
}

const PRINT: Record<WorkshopLang, string> = { php: 'echo', js: 'console.log', python: 'print' };

/**
 * A Sintaxe explica, em linguagem simples, o teste que falhou: o que entrou, o que saiu e o
 * que era esperado. Nunca mostra a solução.
 */
export function explainFailure(lang: WorkshopLang, result: WorkshopTestResult): string {
  const given = describeInputs(lang, result.test.inputs);
  const which = result.kind === 'hidden' ? 'Num teste surpresa' : result.kind === 'extra' ? 'No desafio extra' : 'No teste';
  if (result.timedOut) {
    return `${which}, com ${given}, o código demorou demais e eu parei. Tem algum laço que nunca termina?`;
  }
  if (result.error) {
    return `${which}, com ${given}, o código parou com um erro: ${result.error}`;
  }
  if (lines(result.output).length === 0) {
    return `${which}, com ${given}, não apareceu nada na tela. Faltou um ${PRINT[lang]}?`;
  }
  return `${which}, com ${given}, saiu "${result.output.trim()}", mas eu esperava "${result.test.expected}".`;
}

/** Os testes que o "Testar" roda: visíveis e surpresa (e os do extra, quando pedido). */
export function testsToRun(
  workshop: { tests: WorkshopTest[]; hiddenTests: WorkshopTest[]; extra?: { tests: WorkshopTest[] } },
  withExtra: boolean,
): { test: WorkshopTest; kind: WorkshopTestResult['kind'] }[] {
  return [
    ...workshop.tests.map((test) => ({ test, kind: 'visible' as const })),
    ...workshop.hiddenTests.map((test) => ({ test, kind: 'hidden' as const })),
    ...(withExtra && workshop.extra ? workshop.extra.tests.map((test) => ({ test, kind: 'extra' as const })) : []),
  ];
}

/**
 * O que já funciona, para a Sintaxe comentar o progresso a partir dos testes (ex.: "Já
 * funciona com $op = "+" e com $op = "-"."). Mostra só as entradas que mudam entre os testes
 * visíveis, para a frase ficar curta.
 */
export function passingSummary(lang: WorkshopLang, results: readonly WorkshopTestResult[]): string {
  const visible = results.filter((r) => r.kind === 'visible');
  const passed = visible.filter((r) => r.passed);
  if (passed.length === 0 || passed.length === visible.length) return '';
  const keys = Object.keys(visible[0]?.test.inputs ?? {});
  const varying = keys.filter((k) => new Set(visible.map((r) => String(r.test.inputs[k]))).size > 1);
  const shown = varying.length > 0 && varying.length < keys.length ? varying : keys;
  const describe = (r: WorkshopTestResult) =>
    describeInputs(lang, Object.fromEntries(shown.map((k) => [k, r.test.inputs[k]])));
  return `Já funciona com ${passed.map(describe).join(' e com ')}.`;
}
