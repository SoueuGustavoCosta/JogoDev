import type { Trail } from '../trail/types';
import type { ExplorationMode, TrailProgress } from './types';

/**
 * No modo sequencial, um módulo só é liberado depois que o anterior é concluído.
 * No modo livre, todos os módulos ficam abertos.
 */
export function isModuleUnlocked(
  trail: Trail,
  moduleId: string,
  progress: TrailProgress | undefined,
  mode: ExplorationMode,
): boolean {
  if (mode === 'free') return true;
  const index = trail.modules.findIndex((m) => m.id === moduleId);
  if (index <= 0) return true;
  const previous = trail.modules[index - 1];
  return Boolean(progress?.modules[previous.id]?.completed);
}

export function isTrailCompleted(trail: Trail, progress: TrailProgress | undefined): boolean {
  if (!progress) return false;
  return trail.modules.every((module) => progress.modules[module.id]?.completed);
}
