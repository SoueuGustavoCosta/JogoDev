import { createEmptyProgress } from '@/domain/progress';
import type { LeaderboardPort, ProgressRepository } from '../ports';

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

/**
 * Resolve a identidade real do viajante via login anônimo do Supabase Auth e a
 * grava em `Progress.travelerUuid`, para que `getOrCreateTravelerUuid` (síncrono,
 * chamado de muitos lugares) passe a devolver o `auth.uid()` real assim que possível.
 *
 * Desenhado para nunca bloquear o jogo: é a única ponta assíncrona desta troca de
 * identidade. Chame uma vez por sessão do app (ver `Layout.tsx`), sem aguardar o
 * resultado antes de liberar a tela — antes da primeira resolução (ou se ela nunca
 * chegar a acontecer: rede fora do ar, login anônimo ainda desligado no painel do
 * Supabase, projeto pausado), `getOrCreateTravelerUuid` continua funcionando com o
 * uuid local de sempre (gerado na hora, se for a primeira vez). Falha silenciosa:
 * nunca lança, nunca mostra erro ao aluno.
 */
export async function bootstrapTravelerIdentity(deps: {
  repository: ProgressRepository;
  leaderboard: LeaderboardPort;
}): Promise<void> {
  try {
    const authUid = await deps.leaderboard.ensureSignedIn();
    if (!authUid) return;
    const progress = deps.repository.load() ?? createEmptyProgress();
    if (progress.travelerUuid === authUid) return;
    deps.repository.save({ ...progress, travelerUuid: authUid });
  } catch {
    // Falha silenciosa: o jogo continua com o uuid local (gerado sob demanda).
  }
}
