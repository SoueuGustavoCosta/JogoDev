import { createEmptyProgress } from '@/domain/progress';
import type { ProgressRepository } from '../ports';

const DEFAULT_NAME = 'Viajante';
const MAX_NAME_LENGTH = 20;

export function getTraveler(deps: { repository: ProgressRepository }): {
  name: string;
  prologueSeen: boolean;
} {
  const progress = deps.repository.load();
  return {
    name: progress?.travelerName || DEFAULT_NAME,
    prologueSeen: Boolean(progress?.prologueSeen),
  };
}

/** Salva o nome (máx. 20 caracteres; vazio vira "Viajante") e marca o prólogo como visto. */
export function completePrologue(
  deps: { repository: ProgressRepository },
  params: { name: string },
): string {
  const name = params.name.trim().slice(0, MAX_NAME_LENGTH) || DEFAULT_NAME;
  const progress = deps.repository.load() ?? createEmptyProgress();
  deps.repository.save({ ...progress, travelerName: name, prologueSeen: true });
  return name;
}

export function markPrologueSkipped(deps: { repository: ProgressRepository }): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  deps.repository.save({ ...progress, prologueSeen: true });
}
