import { createEmptyProgress, isProgressShape, mergeProgress, type Progress } from '@/domain/progress';
import type { LeaderboardPort, ProgressRepository } from '../ports';
import { getOrCreateTravelerUuid, getTraveler } from './traveler';

type Deps = { repository: ProgressRepository; leaderboard: LeaderboardPort };

/** Lê a cópia da nuvem; `undefined` = a leitura falhou (não dá pra decidir nada com segurança). */
async function readCloud(leaderboard: LeaderboardPort): Promise<Progress | null | undefined> {
  try {
    const cloud = await leaderboard.getMyProgress();
    return isProgressShape(cloud) ? cloud : null;
  } catch {
    return undefined;
  }
}

/**
 * Backup sem perda: lê a nuvem, junta com o aparelho (`mergeProgress`) e grava a união nos
 * dois lados. Se a leitura falhar, não grava nada nesta rodada, porque subir o aparelho
 * às cegas pode apagar o que outro aparelho salvou. Devolve `true` se o backup subiu.
 *
 * O progresso local é relido depois da espera pela rede: o aluno pode ter respondido um
 * quiz nesse meio-tempo, e juntar a partir da cópia antiga apagaria essa resposta.
 */
export async function syncProgressSafely(deps: Deps): Promise<boolean> {
  const before = deps.repository.load();
  // Sessão da conta perdida: a sessão atual é de outra identidade, subir agora gravaria
  // este progresso na conta errada. Espera a pessoa entrar de novo.
  if (!before || before.needsSignIn) return false;
  const cloud = await readCloud(deps.leaderboard);
  if (cloud === undefined) return false;

  const local = deps.repository.load();
  if (!local || local.needsSignIn) return false;
  const merged = cloud ? mergeProgress(local, cloud) : local;
  deps.repository.save(merged);

  const uuid = getOrCreateTravelerUuid({ repository: deps.repository });
  const name = getTraveler({ repository: deps.repository }).name;
  await deps.leaderboard.backupProgress(uuid, name, deps.repository.load() ?? merged);
  return true;
}

/**
 * Ao assumir a identidade de uma conta (login, troca de sessão, recuperação por código):
 * junta a cópia dela com o que já está neste aparelho, em vez de trocar um pelo outro.
 * O perfil (nome, uuid) vem da conta; as conquistas somam as duas.
 */
export function adoptAccountProgress(
  deps: { repository: ProgressRepository },
  params: { uuid: string; cloud: unknown; extra?: Partial<Progress> },
): void {
  const local = deps.repository.load();
  const cloud = isProgressShape(params.cloud) ? params.cloud : null;
  const base = cloud && local ? mergeProgress(cloud, local) : (cloud ?? local);
  if (!base) {
    deps.repository.save({ ...createEmptyProgress(), ...params.extra, travelerUuid: params.uuid });
    return;
  }
  deps.repository.save({ ...base, ...params.extra, travelerUuid: params.uuid });
}
