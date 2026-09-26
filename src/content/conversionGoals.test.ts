import { describe, expect, it } from 'vitest';
import { quizKind } from '@/domain/progress';
import { blockWords } from '@/domain/trail';
import { trailRegistry } from './registry';

/**
 * Metas da Etapa 5 do plano de engajamento, para as ilhas já convertidas: no máximo 40%
 * de alternativas de teoria, pelo menos um desafio de código por módulo e nenhum
 * parágrafo com mais de 60 palavras. Ilha nova na lista = ilha que passou pela Etapa 5.
 */
const CONVERTED = ['logica', 'banco-de-dados', 'python', 'java', 'php', 'git-github'];

/** Formatos em que o jogador mexe em código (ou lê código de verdade). */
const CODE_KINDS = new Set(['fill', 'order', 'output', 'bug']);

describe('metas da Etapa 5 nas ilhas convertidas', () => {
  for (const trailId of CONVERTED) {
    const trail = trailRegistry.find((t) => t.id === trailId);

    it(`${trailId}: existe`, () => expect(trail).toBeDefined());
    if (!trail) continue;

    it(`${trailId}: no máximo 40% das perguntas são alternativas de teoria`, () => {
      const kinds = trail.modules.flatMap((m) => m.quiz.map(quizKind));
      const choice = kinds.filter((k) => k === 'choice').length;
      expect(choice / kinds.length).toBeLessThanOrEqual(0.4);
    });

    for (const module of trail.modules) {
      it(`${trailId}/${module.id}: tem desafio de código e parágrafos curtos`, () => {
        expect(module.quiz.some((item) => CODE_KINDS.has(quizKind(item)))).toBe(true);
        for (const block of module.blocks) {
          if (block.t === 'p') expect(blockWords(block), block.x.slice(0, 60)).toBeLessThanOrEqual(60);
        }
      });
    }
  }
});

/**
 * Python, Java e PHP têm módulos paralelos (história, sintaxe, operadores...). Para o jogo não
 * virar repetição, o mesmo módulo não pode ter a mesma sequência de formatos nas três.
 */
describe('Python, Java e PHP não repetem a sequência de formatos', () => {
  const languages = ['python', 'java', 'php'].map((id) => trailRegistry.find((t) => t.id === id)!);
  const sequence = (trailIndex: number, moduleIndex: number) =>
    languages[trailIndex].modules[moduleIndex].quiz.map(quizKind).join(' ');

  const moduleCount = Math.min(...languages.map((t) => t.modules.length));
  for (let m = 0; m < moduleCount; m++) {
    it(`módulo ${m + 1}`, () => {
      const seqs = languages.map((_, t) => sequence(t, m));
      expect(new Set(seqs).size, seqs.join(' | ')).toBe(seqs.length);
    });
  }
});
