import type { Trail } from '../trail/types';
import { bestQuizAttempt } from './attempt';
import type { ModuleProgress, Progress, QuizAttemptResult, TrailProgress } from './types';

/** Ids das perguntas de cada módulo, na ordem do conteúdo atual: trilha -> módulo -> ids. */
export type QuizIdIndex = Readonly<Record<string, Readonly<Record<string, readonly string[]>>>>;

export function buildQuizIdIndex(trails: readonly Trail[]): QuizIdIndex {
  return Object.fromEntries(
    trails.map((trail) => [
      trail.id,
      Object.fromEntries(trail.modules.map((module) => [module.id, module.quiz.map((item) => item.id)])),
    ]),
  );
}

/** Chave do formato antigo: a posição da pergunta (só dígitos). Ids de pergunta nunca são só dígitos. */
export function isLegacyQuizKey(key: string): boolean {
  return /^\d+$/.test(key);
}

/**
 * Até a Etapa 3.5 o resultado de cada pergunta era guardado pela POSIÇÃO dela no módulo
 * (`quizResults[0]`, `[1]`...); agora é pelo id. Converte cada posição no id da pergunta
 * que está nessa posição no conteúdo atual (as perguntas ganharam id sem mudar de ordem,
 * então é a mesma pergunta que o aluno respondeu).
 *
 * - Idempotente: sem chave antiga, devolve o mesmo objeto.
 * - Se a pergunta já tiver resultado pelo id (cópias misturadas, ex.: nuvem antiga +
 *   aparelho novo), fica a melhor tentativa, como no `mergeProgress`.
 * - Nada é descartado: posição sem pergunta correspondente (módulo ou pergunta que não
 *   existe no conteúdo atual) vai para `unmappedQuizResults`, intacta.
 */
export function migrateQuizResultKeys(progress: Progress, index: QuizIdIndex): Progress {
  let trails: Record<string, TrailProgress> | null = null;
  for (const [trailId, trail] of Object.entries(progress.trails ?? {})) {
    let modules: Record<string, ModuleProgress> | null = null;
    for (const [moduleId, module] of Object.entries(trail?.modules ?? {})) {
      const migrated = migrateModule(module, index[trailId]?.[moduleId]);
      if (migrated === module) continue;
      modules ??= { ...trail.modules };
      modules[moduleId] = migrated;
    }
    if (!modules) continue;
    trails ??= { ...progress.trails };
    trails[trailId] = { ...trail, modules };
  }
  return trails ? { ...progress, trails } : progress;
}

function migrateModule(module: ModuleProgress, ids: readonly string[] | undefined): ModuleProgress {
  const results = module?.quizResults ?? {};
  const legacyKeys = Object.keys(results).filter(isLegacyQuizKey);
  if (legacyKeys.length === 0) return module;

  const quizResults: Record<string, QuizAttemptResult> = {};
  for (const [key, result] of Object.entries(results)) {
    if (!isLegacyQuizKey(key)) quizResults[key] = result;
  }
  const unmapped: Record<string, QuizAttemptResult> = { ...module.unmappedQuizResults };
  for (const key of legacyKeys) {
    const id = ids?.[Number(key)];
    if (id) quizResults[id] = bestQuizAttempt(quizResults[id], results[key]);
    else unmapped[key] = bestQuizAttempt(unmapped[key], results[key]);
  }

  const migrated: ModuleProgress = { ...module, quizResults };
  if (Object.keys(unmapped).length > 0) migrated.unmappedQuizResults = unmapped;
  return migrated;
}
