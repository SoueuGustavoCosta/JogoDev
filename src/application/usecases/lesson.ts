import {
  createEmptyProgress,
  getOrCreateModuleProgress,
  getOrCreateTrailProgress,
  type LessonMode,
} from '@/domain/progress';
import type { ProgressRepository } from '../ports';

type Deps = { repository: ProgressRepository };

/** Como a lição aparece para este viajante: a escolha dele, senão o padrão do app. */
export function getLessonMode(deps: Deps, params: { fallback: LessonMode }): LessonMode {
  return deps.repository.load()?.lessonMode ?? params.fallback;
}

/** Guarda a escolha "Modo leitura" (rolagem) ou telas curtas. */
export function setLessonMode(deps: Deps, params: { mode: LessonMode }): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  deps.repository.save({ ...progress, lessonMode: params.mode });
}

/**
 * Em qual tela a lição deve abrir: onde o viajante parou, ou a primeira. Módulo já
 * concluído sempre abre do começo (é revisão). A posição guardada é limitada ao número
 * atual de telas, porque o conteúdo pode ter mudado desde que ela foi salva.
 */
export function getLessonPosition(
  deps: Deps,
  params: { trailId: string; moduleId: string; screenCount: number },
): number {
  const moduleProgress = deps.repository.load()?.trails[params.trailId]?.modules[params.moduleId];
  if (!moduleProgress || moduleProgress.completed) return 0;
  const saved = moduleProgress.screen ?? 0;
  if (!Number.isInteger(saved) || saved < 0) return 0;
  return Math.min(saved, Math.max(0, params.screenCount - 1));
}

/**
 * Guarda a tela atual de um módulo ainda não concluído, para voltar de onde parou.
 * Só toca no campo `screen`: XP, respostas e conclusão ficam como estavam.
 */
export function saveLessonPosition(deps: Deps, params: { trailId: string; moduleId: string; screen: number }): void {
  if (!Number.isInteger(params.screen) || params.screen < 0) return;
  const progress = deps.repository.load() ?? createEmptyProgress();
  const trailProgress = getOrCreateTrailProgress(progress, params.trailId);
  const moduleProgress = getOrCreateModuleProgress(trailProgress, params.moduleId);
  if (moduleProgress.completed || moduleProgress.screen === params.screen) return;
  deps.repository.save({
    ...progress,
    trails: {
      ...progress.trails,
      [params.trailId]: {
        ...trailProgress,
        modules: { ...trailProgress.modules, [params.moduleId]: { ...moduleProgress, screen: params.screen } },
      },
    },
  });
}
