import { describe, expect, it } from 'vitest';
import { blockWords, paginateModule, SCREEN_MAX_WORDS, type LessonScreen } from './paginate';
import type { Block, QuizItem } from './types';

const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
const p = (n: number): Block => ({ t: 'p', x: words(n) });
const code: Block = { t: 'code', file: 'a.sql', x: 'SELECT 1;' };
const q = (id: number): QuizItem => ({ id: `q${id}`, q: `q${id}`, options: ['a', 'b'], answer: 0, explain: '' });

function contentScreens(screens: LessonScreen[]): number[][] {
  return screens.flatMap((s) => (s.kind === 'content' ? [s.blocks] : []));
}

function quizOrder(screens: LessonScreen[]): number[] {
  return screens.flatMap((s) => (s.kind === 'quiz' ? [s.quizIndex] : []));
}

describe('blockWords', () => {
  it('ignora tags e conta o texto de listas, cartões e notas', () => {
    expect(blockWords({ t: 'p', x: 'Um <b>dois</b> <code>três</code>' })).toBe(3);
    expect(blockWords({ t: 'ul', items: ['a b', 'c'] })).toBe(3);
    expect(blockWords({ t: 'cards', items: [{ h: 'Título', x: 'um dois' }] })).toBe(3);
    expect(blockWords({ t: 'note', k: 'Dica', x: 'leia isto' })).toBe(3);
    expect(blockWords(code)).toBe(0);
  });
});

describe('paginateModule', () => {
  it('junta parágrafos até ~60 palavras por tela, sem cortar nenhum bloco', () => {
    const screens = paginateModule({ blocks: [p(25), p(25), p(25), p(80)], quiz: [] });
    expect(contentScreens(screens)).toEqual([[0, 1], [2], [3]]);
  });

  it('um título sempre abre tela nova e fica com o conteúdo logo abaixo', () => {
    const screens = paginateModule({ blocks: [p(10), { t: 'h', x: 'Seção' }, p(10)], quiz: [] });
    expect(contentScreens(screens)).toEqual([[0], [1, 2]]);
  });

  it('código/tabela/widget fica sozinho, aceitando só 1 parágrafo curto antes', () => {
    const screens = paginateModule({ blocks: [p(20), code, p(20), p(20), code, { t: 'gui', widget: 'x' }], quiz: [] });
    // p(20)+code juntos; depois p(20)+p(20) (dois parágrafos não entram com código); code; gui
    expect(contentScreens(screens)).toEqual([[0, 1], [2, 3], [4], [5]]);
  });

  it('parágrafo longo não entra na tela do código', () => {
    const screens = paginateModule({ blocks: [p(50), code], quiz: [] });
    expect(contentScreens(screens)).toEqual([[0], [1]]);
  });

  it('nota fica na tela do conteúdo a que se refere (o de antes), fala da Sintaxe fica com o que vem depois', () => {
    const blocks: Block[] = [
      { t: 'say', x: 'Olá, {name}' },
      p(10),
      code,
      { t: 'note', k: 'Atenção', x: 'sobre o código acima' },
      p(10),
    ];
    const screens = paginateModule({ blocks, quiz: [] });
    expect(contentScreens(screens)).toEqual([[0, 1, 2, 3], [4]]);
  });

  it('título ou fala sobrando no fim vão para a última tela', () => {
    const screens = paginateModule({ blocks: [p(10), { t: 'say', x: 'Tchau' }], quiz: [] });
    expect(contentScreens(screens)).toEqual([[0, 1]]);
  });

  it('intercala uma pergunta a cada 3 telas quando há conteúdo de sobra, e termina com pergunta', () => {
    const blocks = Array.from({ length: 9 }, () => p(SCREEN_MAX_WORDS));
    const screens = paginateModule({ blocks, quiz: [q(0), q(1), q(2)] });
    expect(screens.map((s) => (s.kind === 'quiz' ? `q${s.quizIndex}` : 'c'))).toEqual([
      'c', 'c', 'c', 'q0', 'c', 'c', 'c', 'q1', 'c', 'c', 'c', 'q2',
    ]);
  });

  it('com muitas perguntas para pouco conteúdo, intercala a cada 2 telas e deixa o resto no fim', () => {
    const blocks = Array.from({ length: 4 }, () => p(SCREEN_MAX_WORDS));
    const screens = paginateModule({ blocks, quiz: [q(0), q(1), q(2), q(3), q(4)] });
    expect(screens.map((s) => (s.kind === 'quiz' ? `q${s.quizIndex}` : 'c'))).toEqual([
      'c', 'c', 'q0', 'c', 'c', 'q1', 'q2', 'q3', 'q4',
    ]);
  });

  it('nunca perde, duplica nem reordena blocos e perguntas', () => {
    const blocks: Block[] = [p(5), { t: 'h', x: 'a' }, p(70), code, { t: 'note', k: 'n', x: 'x' }, p(30), code, p(10)];
    const quiz = [q(0), q(1), q(2), q(3)];
    const screens = paginateModule({ blocks, quiz });
    expect(contentScreens(screens).flat()).toEqual(blocks.map((_, i) => i));
    expect(quizOrder(screens)).toEqual([0, 1, 2, 3]);
  });

  it('módulo sem blocos vira só as perguntas', () => {
    expect(paginateModule({ blocks: [], quiz: [q(0)] })).toEqual([{ kind: 'quiz', quizIndex: 0 }]);
  });
});
