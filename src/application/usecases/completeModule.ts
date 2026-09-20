import {
  createEmptyProgress,
  getOrCreateModuleProgress,
  getOrCreateTrailProgress,
  isTrailCompleted,
} from '@/domain/progress';
import type { Trail } from '@/domain/trail';
import type { AnalyticsPort, ProgressRepository } from '../ports';

export type CompleteModuleParams = {
  trail: Trail;
  moduleId: string;
};

export type CompleteModuleResult = {
  alreadyCompleted: boolean;
  trailCompleted: boolean;
};

export function completeModule(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort },
  params: CompleteModuleParams,
): CompleteModuleResult {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const trailProgress = getOrCreateTrailProgress(progress, params.trail.id);
  const moduleProgress = getOrCreateModuleProgress(trailProgress, params.moduleId);

  if (moduleProgress.completed) {
    return { alreadyCompleted: true, trailCompleted: isTrailCompleted(params.trail, trailProgress) };
  }

  const nextTrailProgress = {
    ...trailProgress,
    modules: {
      ...trailProgress.modules,
      [params.moduleId]: { ...moduleProgress, completed: true },
    },
  };
  const nextProgress = {
    ...progress,
    trails: { ...progress.trails, [params.trail.id]: nextTrailProgress },
  };

  deps.repository.save(nextProgress);
  deps.analytics.track('module_completed', { island: params.trail.id, module: params.moduleId });

  const trailCompleted = isTrailCompleted(params.trail, nextTrailProgress);
  if (trailCompleted && !nextTrailProgress.trophyAwarded) {
    const withTrophy = { ...nextTrailProgress, trophyAwarded: true };
    deps.repository.save({
      ...nextProgress,
      trails: { ...nextProgress.trails, [params.trail.id]: withTrophy },
    });
    deps.analytics.track('island_completed', { island: params.trail.id });
  }

  return { alreadyCompleted: false, trailCompleted };
}
