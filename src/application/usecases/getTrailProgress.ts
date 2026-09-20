import { createEmptyProgress, maxXpForTrail, xpForTrail, type TrailProgress } from '@/domain/progress';
import type { Trail } from '@/domain/trail';
import type { ProgressRepository } from '../ports';

export type TrailProgressView = {
  trailProgress: TrailProgress | undefined;
  xp: number;
  maxXp: number;
};

export function getTrailProgress(
  deps: { repository: ProgressRepository },
  params: { trail: Trail },
): TrailProgressView {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const trailProgress = progress.trails[params.trail.id];
  return {
    trailProgress,
    xp: xpForTrail(params.trail, trailProgress),
    maxXp: maxXpForTrail(params.trail),
  };
}
