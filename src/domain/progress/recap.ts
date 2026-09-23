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
  const total = module?.quiz.length ?? 0;
  const results = progress?.modules[moduleId]?.quizResults ?? {};
  let firstTry = 0;
  for (let i = 0; i < total; i++) {
    const r = results[i];
    if (r?.correct && r.triesUsed <= 1) firstTry++;
  }
  let tier: ModuleRecapTier;
  if (firstTry === total) tier = 'perfect';
  else if (firstTry * 2 >= total) tier = 'good';
  else tier = 'persisted';
  const modulesLeft = trail.modules.filter((m) => !progress?.modules[m.id]?.completed).length;
  return { firstTry, total, tier, modulesLeft };
}
