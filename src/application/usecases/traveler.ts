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

/**
 * Devolve o identificador anônimo do viajante para o Hall dos Viajantes, gerando um
 * com `crypto.randomUUID()` e persistindo-o na primeira vez que for preciso. Ponto
 * único desta lógica: componentes nunca leem/gravam `travelerUuid` diretamente no
 * `ProgressRepository`, sempre por aqui.
 */
export function getOrCreateTravelerUuid(deps: { repository: ProgressRepository }): string {
  const progress = deps.repository.load() ?? createEmptyProgress();
  if (progress.travelerUuid) return progress.travelerUuid;
  const uuid = crypto.randomUUID();
  deps.repository.save({ ...progress, travelerUuid: uuid });
  return uuid;
}
