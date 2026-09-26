import type { Trail } from '../trail/types';
import type { TrailProgress } from './types';

/**
 * - `perfect`: acertou todas de primeira.
 * - `good`: acertou de primeira pelo menos metade.
 * - `persisted`: errou bastante, mas foi até o fim.
 */
export type ModuleRecapTier = 'perfect' | 'good' | 'persisted';

export type ModuleRecap = {
  firstTry: number;
  total: number;
  tier: ModuleRecapTier;
  /** Módulos da trilha ainda não concluídos (0 = trilha fechada). */
  modulesLeft: number;
};

/** Resumo de como o aluno foi num módulo, para a Sintaxe comentar ao concluir. */
export function moduleRecap(trail: Trail, moduleId: string, progress: TrailProgress | undefined): ModuleRecap {
  const module = trail.modules.find((m) => m.id === moduleId);
  const quiz = module?.quiz ?? [];
  const total = quiz.length;
  const results = progress?.modules[moduleId]?.quizResults ?? {};
  const firstTry = quiz.filter((item) => {
    const r = results[item.id];
    return r?.correct && r.triesUsed <= 1;
  }).length;
  let tier: ModuleRecapTier;
  if (firstTry === total) tier = 'perfect';
  else if (firstTry * 2 >= total) tier = 'good';
  else tier = 'persisted';
  const modulesLeft = trail.modules.filter((m) => !progress?.modules[m.id]?.completed).length;
  return { firstTry, total, tier, modulesLeft };
}
