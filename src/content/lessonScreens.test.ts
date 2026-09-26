import { describe, expect, it } from 'vitest';
import { blockWords, paginateModule, SCREEN_MAX_WORDS } from '@/domain/trail';
import { trailRegistry } from './registry';

/**
 * Lição em telas curtas (Etapa 3 do plano de engajamento): o conteúdo real de todas as
 * ilhas, paginado. Protege a regra de ouro "nada de apagar conteúdo": nenhum bloco e
 * nenhuma pergunta pode sumir, duplicar ou trocar de ordem ao virar telas.
 */
describe('telas curtas de todos os módulos de todas as ilhas', () => {
  const modules = trailRegistry.flatMap((trail) => trail.modules.map((module) => ({ trail, module })));

  it('existe conteúdo para testar', () => {
    expect(modules.length).toBeGreaterThan(0);
  });

  for (const { trail, module } of modules) {
    describe(`${trail.id}/${module.id}`, () => {
      const screens = paginateModule(module);
      const shownBlocks = screens.flatMap((s) => (s.kind === 'content' ? s.blocks : []));
      const shownQuiz = screens.flatMap((s) => (s.kind === 'quiz' ? [s.quizIndex] : []));

      it('mostra todos os blocos, uma vez cada, na ordem original', () => {
        expect(shownBlocks).toEqual(module.blocks.map((_, i) => i));
      });

      it('mostra todas as perguntas, uma vez cada, na ordem original', () => {
        expect(shownQuiz).toEqual(module.quiz.map((_, i) => i));
      });

      it('termina com uma pergunta e não tem tela vazia', () => {
        expect(screens[screens.length - 1]?.kind).toBe('quiz');
        for (const s of screens) if (s.kind === 'content') expect(s.blocks.length).toBeGreaterThan(0);
      });

      it('só passa de ~60 palavras numa tela quando um único pedaço inseparável já é maior', () => {
        for (const s of screens) {
          if (s.kind !== 'content') continue;
          const total = s.blocks.reduce((sum, i) => sum + blockWords(module.blocks[i]), 0);
          if (total <= SCREEN_MAX_WORDS) continue;
          // Tela acima do limite: só pode ter um bloco de texto "âncora" (fora título, fala e
          // nota, que grudam, e fora o código/tabela/widget, que não conta palavras).
          const anchors = s.blocks.filter((i) => blockWords(module.blocks[i]) > 0 && !['h', 'say', 'note'].includes(module.blocks[i].t));
          expect(anchors.length, `tela com ${total} palavras e ${anchors.length} blocos`).toBeLessThanOrEqual(1);
        }
      });
    });
  }
});
