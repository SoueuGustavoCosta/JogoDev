import { createEmptyProgress } from '@/domain/progress';
import type { ProgressRepository } from '../ports';

/** Lê as insígnias já conquistadas pelo viajante (ver Progress.badgesEarned). */
export function getMyBadges(deps: { repository: ProgressRepository }): Record<string, string> {
  const progress = deps.repository.load() ?? createEmptyProgress();
  return progress.badgesEarned ?? {};
}
