import type { ModuleProgress, Progress, TrailProgress } from './types';

export const PROGRESS_SCHEMA_VERSION = 1;

export function createEmptyProgress(): Progress {
  return { version: PROGRESS_SCHEMA_VERSION, trails: {} };
}

export function createEmptyTrailProgress(trailId: string): TrailProgress {
  return { trailId, modules: {}, missionsCompleted: {}, trophyAwarded: false };
}

export function createEmptyModuleProgress(moduleId: string): ModuleProgress {
  return { moduleId, quizResults: {}, completed: false };
}

export function getOrCreateTrailProgress(progress: Progress, trailId: string): TrailProgress {
  return progress.trails[trailId] ?? createEmptyTrailProgress(trailId);
}

export function getOrCreateModuleProgress(
  trailProgress: TrailProgress,
  moduleId: string,
): ModuleProgress {
  return trailProgress.modules[moduleId] ?? createEmptyModuleProgress(moduleId);
}
