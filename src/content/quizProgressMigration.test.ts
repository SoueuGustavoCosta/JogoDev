import { beforeEach, describe, expect, it } from 'vitest';
import { withQuizIdMigration } from '@/application/usecases';
import {
  buildQuizIdIndex,
  moduleRecap,
  xpForQuizAttempt,
  xpForTrail,
  XP_MODULE_COMPLETION_BONUS,
  type Progress,
  type QuizAttemptResult,
} from '@/domain/progress';
import type { Trail } from '@/domain/trail';
import { LocalStorageProgressRepository } from '@/infrastructure/storage';
import { trailRegistry } from './registry';

/**
 * Etapa 3.5: quem jogou antes (resultado do quiz guardado pela POSIÇÃO da pergunta) abre o
 * app depois da mudança com o mesmo XP, os mesmos módulos concluídos e o mesmo resumo, em
 * TODAS as ilhas. O progresso antigo é gravado cru no localStorage, como o app antigo
 * gravava, e lido pelo mesmo caminho do app (repositório real + migração).
 */

const KEY = 'arquipelago:progress:v1';

/** XP como o app calculava antes da Etapa 3.5 (resultado pela posição). */
function legacyXpForTrail(trail: Trail, progress: Progress): number {
  return trail.modules.reduce((sum, module) => {
    const mp = progress.trails[trail.id]?.modules[module.id];
    const results = (mp?.quizResults ?? {}) as Record<number, QuizAttemptResult>;
    const quizXp = module.quiz.reduce((s, _item, i) => s + xpForQuizAttempt(results[i]), 0);
    return sum + quizXp + (mp?.completed ? XP_MODULE_COMPLETION_BONUS : 0);
  }, 0);
}

type Pattern = (moduleIndex: number, questionIndex: number) => QuizAttemptResult | undefined;

/** Progresso no formato antigo para todas as ilhas, com o resultado de cada pergunta vindo de `pattern`. */
function legacyProgress(pattern: Pattern, completed: (moduleIndex: number) => boolean): Progress {
  const trails: Progress['trails'] = {};
  for (const trail of trailRegistry) {
    const modules: Progress['trails'][string]['modules'] = {};
    trail.modules.forEach((module, m) => {
      const quizResults: Record<string, QuizAttemptResult> = {};
      module.quiz.forEach((_item, q) => {
        const result = pattern(m, q);
        if (result) quizResults[String(q)] = result;
      });
      modules[module.id] = { moduleId: module.id, quizResults, completed: completed(m), screen: m };
    });
    trails[trail.id] = { trailId: trail.id, modules, missionsCompleted: { a: true }, trophyAwarded: true };
  }
  return { version: 1, travelerName: 'Viajante', trails };
}

const players: Record<string, Progress> = {
  'completou tudo de primeira': legacyProgress(
    () => ({ correct: true, triesUsed: 1 }),
    () => true,
  ),
  'misturado (primeira, segunda, errou, sem responder)': legacyProgress(
    (m, q) =>
      [
        { correct: true, triesUsed: 1 },
        { correct: true, triesUsed: 2 },
        { correct: false, triesUsed: 3 },
        undefined,
        { correct: true, triesUsed: 5 },
      ][(m + q) % 5],
    (m) => m % 2 === 0,
  ),
  'só respondeu a última pergunta de cada módulo': legacyProgress(
    () => undefined,
    () => false,
  ),
};
// Última pergunta de cada módulo: pega a posição mais alta, onde um erro de conversão apareceria.
for (const trail of trailRegistry) {
  for (const module of trail.modules) {
    players['só respondeu a última pergunta de cada módulo'].trails[trail.id].modules[module.id].quizResults = {
      [String(module.quiz.length - 1)]: { correct: true, triesUsed: 1 },
    };
  }
}

describe('progresso salvo antes da Etapa 3.5 abre igual, em todas as ilhas', () => {
  const index = buildQuizIdIndex(trailRegistry);
  beforeEach(() => window.localStorage.clear());

  for (const [name, old] of Object.entries(players)) {
    describe(name, () => {
      function openInNewApp(): Progress {
        window.localStorage.setItem(KEY, JSON.stringify(old));
        const repository = withQuizIdMigration(new LocalStorageProgressRepository(), index);
        const loaded = repository.load();
        expect(loaded).not.toBeNull();
        return loaded!;
      }

      it('mesmo XP em cada ilha (e XP > 0 onde havia acerto)', () => {
        const migrated = openInNewApp();
        for (const trail of trailRegistry) {
          const before = legacyXpForTrail(trail, old);
          expect(xpForTrail(trail, migrated.trails[trail.id]), trail.id).toBe(before);
        }
      });

      it('mesmos módulos concluídos, mesma tela e nenhum resultado perdido ou sobrando', () => {
        const migrated = openInNewApp();
        for (const trail of trailRegistry) {
          expect(migrated.trails[trail.id].trophyAwarded).toBe(true);
          expect(migrated.trails[trail.id].missionsCompleted).toEqual({ a: true });
          for (const module of trail.modules) {
            const before = old.trails[trail.id].modules[module.id];
            const after = migrated.trails[trail.id].modules[module.id];
            expect(after.completed).toBe(before.completed);
            expect(after.screen).toBe(before.screen);
            expect(after.unmappedQuizResults).toBeUndefined();
            expect(Object.keys(after.quizResults).length).toBe(Object.keys(before.quizResults).length);
            for (const [position, result] of Object.entries(before.quizResults)) {
              expect(after.quizResults[module.quiz[Number(position)].id]).toEqual(result);
            }
          }
        }
      });

      it('mesmo resumo do módulo (acertos de primeira)', () => {
        const migrated = openInNewApp();
        for (const trail of trailRegistry) {
          for (const module of trail.modules) {
            const results = old.trails[trail.id].modules[module.id].quizResults;
            const firstTryBefore = Object.values(results).filter((r) => r.correct && r.triesUsed <= 1).length;
            expect(moduleRecap(trail, module.id, migrated.trails[trail.id]).firstTry).toBe(firstTryBefore);
          }
        }
      });

      it('gravar de novo não muda nada (idempotente)', () => {
        const repository = withQuizIdMigration(new LocalStorageProgressRepository(), index);
        repository.save(openInNewApp());
        const once = repository.load();
        repository.save(once!);
        expect(repository.load()).toEqual(once);
        expect(once!.trails).toEqual(openInNewApp().trails);
      });
    });
  }
});
