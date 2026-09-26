import type { Block, Module } from './types';

/**
 * Lição em telas curtas (plano de engajamento, Etapa 3): o mesmo `Module.blocks` +
 * `Module.quiz` de sempre, só que mostrado aos pedaços, com as perguntas intercaladas.
 * O conteúdo não muda: cada tela só aponta para posições do módulo original, e nenhum
 * bloco ou pergunta some, duplica ou troca de ordem.
 */
export type LessonScreen =
  /** Tela de conteúdo: posições (em ordem) de `module.blocks`. */
  | { kind: 'content'; blocks: number[] }
  /** Tela de pergunta: posição em `module.quiz`. */
  | { kind: 'quiz'; quizIndex: number };

/** Máximo de palavras de texto numa tela (um bloco maior que isso fica sozinho, nunca é cortado). */
export const SCREEN_MAX_WORDS = 60;
/** Parágrafo que ainda cabe como introdução na mesma tela de um código/tabela/widget. */
export const SHORT_PARAGRAPH_WORDS = 35;

/** Blocos "pesados": ocupam a tela sozinhos (no máximo com 1 parágrafo curto antes). */
const HEAVY: ReadonlySet<Block['t']> = new Set(['code', 'table', 'raw', 'gui', 'syntax', 'out']);

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').trim();
  return text ? text.split(/\s+/).length : 0;
}

/** Palavras de texto corrido de um bloco (blocos pesados contam 0: o limite deles é outro). */
export function blockWords(block: Block): number {
  switch (block.t) {
    case 'h':
    case 'p':
    case 'say':
      return countWords(block.x);
    case 'note':
      return countWords(`${block.k} ${block.x}`);
    case 'ul':
    case 'ol':
    case 'flow':
      return block.items.reduce((sum, item) => sum + countWords(item), 0);
    case 'cards':
      return block.items.reduce((sum, item) => sum + countWords(`${item.h} ${item.x}`), 0);
    case 'timeline':
      return block.items.reduce((sum, item) => sum + countWords(`${item.y} ${item.h} ${item.x}`), 0);
    default:
      return 0;
  }
}

/**
 * Pedaço que nunca se separa: falas da Sintaxe (`say`) e título (`h`) grudam no conteúdo
 * que vem depois deles; notas (`note`) grudam no conteúdo que vem antes (é a ele que se referem).
 */
type Unit = {
  blocks: number[];
  heavy: boolean;
  words: number;
  opensSection: boolean;
  /** Um parágrafo curto (com título/fala grudados ou não): pode ficar antes de um código na mesma tela. */
  shortIntro: boolean;
};

function buildUnits(blocks: Block[]): Unit[] {
  const units: Unit[] = [];
  let prefix: number[] = [];
  blocks.forEach((block, i) => {
    if (block.t === 'say' || block.t === 'h') {
      prefix.push(i);
      return;
    }
    const last = units[units.length - 1];
    if (block.t === 'note' && prefix.length === 0 && last) {
      last.blocks.push(i);
      last.words += blockWords(block);
      last.shortIntro = false;
      return;
    }
    const members = [...prefix, i];
    units.push({
      blocks: members,
      heavy: HEAVY.has(block.t),
      words: members.reduce((sum, m) => sum + blockWords(blocks[m]), 0),
      opensSection: prefix.some((m) => blocks[m].t === 'h'),
      shortIntro: block.t === 'p' && blockWords(block) <= SHORT_PARAGRAPH_WORDS,
    });
    prefix = [];
  });
  // Título ou fala sobrando no fim do módulo: vai junto do último pedaço (ou vira um só).
  if (prefix.length) {
    const last = units[units.length - 1];
    if (last) last.blocks.push(...prefix);
    else units.push({ blocks: prefix, heavy: false, words: 0, opensSection: false, shortIntro: false });
  }
  return units;
}

function groupIntoScreens(units: Unit[]): number[][] {
  const screens: number[][] = [];
  let current: Unit[] = [];
  const flush = () => {
    if (current.length) screens.push(current.flatMap((u) => u.blocks));
    current = [];
  };
  for (const unit of units) {
    if (current.length === 0) {
      current.push(unit);
      continue;
    }
    const hasHeavy = current.some((u) => u.heavy);
    const words = current.reduce((sum, u) => sum + u.words, 0);
    let fits: boolean;
    if (unit.opensSection || hasHeavy) {
      // Título abre tela nova; depois de um código/tabela/widget, o próximo pedaço também.
      fits = false;
    } else if (unit.heavy) {
      // Código/tabela/widget aceita só 1 parágrafo curto antes, na mesma tela.
      fits = current.length === 1 && current[0].shortIntro;
    } else {
      fits = words + unit.words <= SCREEN_MAX_WORDS;
    }
    if (!fits) flush();
    current.push(unit);
  }
  flush();
  return screens;
}

/**
 * Quantas telas de conteúdo entre uma pergunta e outra: 3 quando há conteúdo de sobra,
 * 2 quando há muitas perguntas para pouco conteúdo. O que não couber vai para o fim.
 */
function quizGap(contentScreens: number, questions: number): number {
  return contentScreens >= questions * 3 ? 3 : 2;
}

/**
 * Divide um módulo em telas curtas e intercala as perguntas do quiz: depois de cada 2–3
 * telas de conteúdo entra uma pergunta, e as que sobrarem ficam no final, na ordem original.
 * O módulo sempre termina com pelo menos uma pergunta (se tiver quiz).
 *
 * Pergunta com `afterBlock` só entra depois da tela que mostra esse bloco: se a vez dela
 * chegar antes, ela (e as seguintes, para não trocar a ordem) espera a próxima tela.
 */
export function paginateModule(module: Pick<Module, 'blocks' | 'quiz'>): LessonScreen[] {
  const content = groupIntoScreens(buildUnits(module.blocks));
  const questions = module.quiz.length;
  const gap = quizGap(content.length, questions);
  const screens: LessonScreen[] = [];
  let nextQuestion = 0;
  let lastBlockShown = -1;
  let waiting = false;
  content.forEach((blocks, i) => {
    screens.push({ kind: 'content', blocks });
    lastBlockShown = Math.max(lastBlockShown, ...blocks);
    const isLastContent = i === content.length - 1;
    // Não intercala depois da última tela de conteúdo: dali em diante vêm as perguntas restantes.
    if (isLastContent || nextQuestion >= questions - 1) return;
    if ((i + 1) % gap === 0) waiting = true;
    const after = module.quiz[nextQuestion]?.afterBlock;
    if (waiting && (after === undefined || after <= lastBlockShown)) {
      screens.push({ kind: 'quiz', quizIndex: nextQuestion });
      nextQuestion += 1;
      waiting = false;
    }
  });
  for (; nextQuestion < questions; nextQuestion += 1) screens.push({ kind: 'quiz', quizIndex: nextQuestion });
  return screens;
}
