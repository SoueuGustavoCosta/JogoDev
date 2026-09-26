import { describe, expect, it } from 'vitest';
import {
  describeInputs,
  passingSummary,
  explainFailure,
  inputsPreamble,
  outputMatches,
  stripPhpOpenTag,
  summarizeResults,
  testsToRun,
  workshopSchema,
  workshopXp,
  type Workshop,
  type WorkshopTestResult,
} from '.';

describe('Oficina: comparação de saída tolerante', () => {
  it('ignora espaços e quebras de linha no fim (e no começo)', () => {
    expect(outputMatches('5\n', '5')).toBe(true);
    expect(outputMatches('\n  5   \n\n', '5')).toBe(true);
    expect(outputMatches('3 x 1 = 3  \n3 x 2 = 6\n', '3 x 1 = 3\n3 x 2 = 6')).toBe(true);
  });

  it('aceita 5 e 5.0 quando é número (e vírgula decimal)', () => {
    expect(outputMatches('5.0', '5')).toBe(true);
    expect(outputMatches('98.60000000000001', '98.6')).toBe(true);
    expect(outputMatches('2,5', '2.5')).toBe(true);
    expect(outputMatches('6', '5')).toBe(false);
  });

  it('não liga para maiúsculas nem acentos, mas liga para o conteúdo', () => {
    expect(outputMatches('Impar', 'ímpar')).toBe(true);
    expect(outputMatches('par', 'ímpar')).toBe(false);
    expect(outputMatches('5\n6', '5')).toBe(false);
    expect(outputMatches('', '5')).toBe(false);
  });
});

describe('Oficina: XP', () => {
  it('50 ao passar, -10 por dica (nunca abaixo de 20), +25 com o extra', () => {
    expect(workshopXp({ hintsUsed: 0, extra: false })).toBe(50);
    expect(workshopXp({ hintsUsed: 2, extra: false })).toBe(30);
    expect(workshopXp({ hintsUsed: 3, extra: false })).toBe(20);
    expect(workshopXp({ hintsUsed: 9, extra: false })).toBe(20);
    expect(workshopXp({ hintsUsed: 1, extra: true })).toBe(65);
  });
});

describe('Oficina: entradas injetadas antes do código', () => {
  const inputs = { a: 2, op: '+', ok: true, txt: 'custa $5' };
  it('PHP, JS e Python, numa linha só', () => {
    expect(inputsPreamble('php', inputs)).toBe('$a = 2; $op = "+"; $ok = true; $txt = "custa \\$5";');
    expect(inputsPreamble('js', inputs)).toBe('var a = 2; var op = "+"; var ok = true; var txt = "custa $5";');
    expect(inputsPreamble('python', inputs)).toBe('a = 2; op = "+"; ok = True; txt = "custa $5"');
    expect(inputsPreamble('php', {}).includes('\n')).toBe(false);
  });

  it('tira o <?php do viajante e descreve a entrada', () => {
    expect(stripPhpOpenTag('<?php\necho 1;')).toBe('\necho 1;');
    expect(stripPhpOpenTag('echo 1;')).toBe('echo 1;');
    expect(describeInputs('php', { a: 2, op: '+' })).toBe('$a = 2, $op = "+"');
    expect(describeInputs('js', { a: 2 })).toBe('a = 2');
  });
});

describe('Oficina: explicação da Sintaxe', () => {
  const base = { test: { inputs: { a: 10, b: 4, op: '-' }, expected: '6' }, kind: 'visible' as const, error: null, timedOut: false, passed: false };
  it('mostra o que saiu e o que era esperado, sem entregar a solução', () => {
    expect(explainFailure('php', { ...base, output: '14' })).toBe('No teste, com $a = 10, $b = 4, $op = "-", saiu "14", mas eu esperava "6".');
    expect(explainFailure('js', { ...base, output: '' })).toMatch(/Faltou um console.log/);
    expect(explainFailure('php', { ...base, output: '', error: 'Division by zero' })).toMatch(/parou com um erro: Division by zero/);
    expect(explainFailure('js', { ...base, output: '', timedOut: true })).toMatch(/demorou demais/);
    expect(explainFailure('js', { ...base, kind: 'hidden', output: '1' })).toMatch(/^Num teste surpresa/);
  });

  it('resumo: quantos passaram e o primeiro que falhou', () => {
    const ok: WorkshopTestResult = { ...base, output: '6', passed: true };
    const bad: WorkshopTestResult = { ...base, output: '7' };
    expect(summarizeResults([ok, bad, ok])).toEqual({ passed: 2, total: 3, firstFailure: bad });
  });
});

const sample: Workshop = {
  id: 'x',
  title: 'X',
  story: 's',
  prompt: 'p',
  level: 'Base',
  languages: ['php'],
  inputs: [{ name: 'n', description: 'um número' }],
  tests: [{ inputs: { n: 1 }, expected: '1' }],
  hiddenTests: [{ inputs: { n: 2 }, expected: '2' }],
  extra: { prompt: 'e', tests: [{ inputs: { n: 3 }, expected: '3' }] },
  solutions: { php: [{ title: 't', code: 'echo $n;' }] },
  hints: ['a', 'b', 'c'],
};

describe('Oficina: testes e esquema', () => {
  it('roda visíveis e surpresa; o extra só quando pedido', () => {
    expect(testsToRun(sample, false).map((t) => t.kind)).toEqual(['visible', 'hidden']);
    expect(testsToRun(sample, true).map((t) => t.kind)).toEqual(['visible', 'hidden', 'extra']);
  });

  it('esquema: entradas iguais às declaradas e solução para cada linguagem oferecida', () => {
    expect(workshopSchema.safeParse(sample).success).toBe(true);
    expect(workshopSchema.safeParse({ ...sample, tests: [{ inputs: { m: 1 }, expected: '1' }] }).success).toBe(false);
    expect(workshopSchema.safeParse({ ...sample, languages: ['php', 'js'] }).success).toBe(false);
  });
});

describe('Oficina: progresso a partir dos testes', () => {
  const r = (op: string, passed: boolean): WorkshopTestResult => ({
    test: { inputs: { a: 1, b: 1, op }, expected: 'x' },
    kind: 'visible',
    output: '',
    error: null,
    timedOut: false,
    passed,
  });
  it('diz o que já funciona, mostrando só o que muda entre os testes', () => {
    expect(passingSummary('php', [r('+', true), r('-', true), r('*', false)])).toBe('Já funciona com $op = "+" e com $op = "-".');
    expect(passingSummary('php', [r('+', false), r('-', false)])).toBe('');
    expect(passingSummary('php', [r('+', true)])).toBe('');
  });
});
