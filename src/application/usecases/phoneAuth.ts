import { createEmptyProgress } from '@/domain/progress';
import type { Progress } from '@/domain/progress';
import { isValidPassword, MIN_PASSWORD_LENGTH, normalizePhone } from '@/domain/traveler';
import type { LeaderboardPort, ProgressRepository } from '../ports';

export type SaveProgressWithPhoneResult = { ok: true } | { ok: false; reason: string };

/**
 * "Salvar progresso": cadastro por telefone+senha, sem SMS nem confirmação por e-mail
 * (ver `LeaderboardPort.saveProgressWithPhone` e `domain/traveler/credentials.ts`).
 * Se o telefone já tiver conta e a senha bater, entra nela e adota o progresso salvo
 * lá (substituindo o local); senão, cria a conta promovendo a sessão anônima atual,
 * preservando o progresso deste aparelho.
 */
export async function saveProgressWithPhone(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort },
  params: { phone: string; password: string },
): Promise<SaveProgressWithPhoneResult> {
  const phone = normalizePhone(params.phone);
  if (!phone) return { ok: false, reason: 'Digite um telefone válido, com DDD.' };
  if (!isValidPassword(params.password)) {
    return { ok: false, reason: `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` };
  }

  // Garante que já existe uma sessão (mesmo anônima) antes de tentar promovê-la — reforço
  // caso o bootstrap silencioso em Layout ainda não tenha rodado/tenha falhado.
  await deps.leaderboard.ensureSignedIn();

  const result = await deps.leaderboard.saveProgressWithPhone(phone, params.password);
  if (!result.ok) return result;

  const progress = deps.repository.load() ?? createEmptyProgress();
  if (result.restoredProgress) {
    const restored = result.restoredProgress as Progress;
    deps.repository.save({ ...restored, travelerUuid: result.uid, phoneLinked: true });
  } else {
    deps.repository.save({ ...progress, travelerUuid: result.uid, phoneLinked: true });
  }
  return { ok: true };
}

/** Se o viajante já vinculou telefone+senha neste aparelho (esconde a caixa "Salvar progresso"). */
export function hasPhoneLinked(deps: { repository: ProgressRepository }): boolean {
  return Boolean(deps.repository.load()?.phoneLinked);
}
