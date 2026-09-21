import { createEmptyProgress, xpForTrail } from '@/domain/progress';
import type { Progress } from '@/domain/progress';
import { nextStreak, travelerLevel } from '@/domain/traveler';
import type { Badge } from '@/domain/badges';
import type { Trail } from '@/domain/trail';
import type { LeaderboardPort, OnlinePlayer, ProgressRepository } from '../ports';
import { getOrCreateTravelerUuid, getTraveler } from './traveler';

export type ProfileSummary = {
  name: string;
  avatarUrl: string | null;
  xp: number;
  crystals: number;
  level: number;
  badgesEarnedCount: number;
  badgesTotal: number;
  streak: { current: number; best: number };
};

/**
 * Único lugar que calcula o resumo do cabeçalho do viajante (cristais, XP, nível,
 * insígnias, sequência). Substitui os três cálculos de cristais/XP que existiam
 * separados em Layout.tsx, TimeMap.tsx e ArchipelagoHome.tsx.
 *
 * `badgeCatalog` é passado por quem chama (mesmo motivo de `catalog` em
 * `awardBadgesForModule`): `application/` não importa `content/` diretamente.
 * Os campos de avatar/sequência vêm do cache local em `Progress` (instantâneo,
 * sem esperar rede) — ver `checkInDaily`/`uploadAvatarPhoto` para quem os escreve.
 */
export function getProfileSummary(
  deps: { repository: ProgressRepository },
  params: { trails: Trail[]; badgeCatalog: Badge[] },
): ProfileSummary {
  const progress = deps.repository.load() ?? createEmptyProgress();

  let xp = 0;
  let crystals = 0;
  for (const trail of params.trails) {
    const trailProgress = progress.trails[trail.id];
    xp += xpForTrail(trail, trailProgress);
    crystals += trail.modules.filter((m) => trailProgress?.modules[m.id]?.completed).length;
  }

  return {
    name: progress.travelerName || 'Viajante',
    avatarUrl: progress.avatarUrl ?? null,
    xp,
    crystals,
    level: travelerLevel(xp),
    badgesEarnedCount: Object.keys(progress.badgesEarned ?? {}).length,
    badgesTotal: params.badgeCatalog.length,
    streak: { current: progress.streakCurrent ?? 0, best: progress.streakBest ?? 0 },
  };
}

/**
 * Check-in diário: só abrir o app num dia já conta como "jogou aquele dia" (decisão
 * do autor). Chamar uma vez por sessão do app (não em intervalo). Atualiza o cache
 * local imediatamente e sincroniza com o Supabase em segundo plano, sem bloquear.
 */
export function checkInDaily(deps: { repository: ProgressRepository; leaderboard: LeaderboardPort }): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const today = new Date().toISOString().slice(0, 10);
  const { current, best } = nextStreak(
    progress.ultimoDiaAtivo ?? null,
    today,
    progress.streakCurrent ?? 0,
    progress.streakBest ?? 0,
  );

  deps.repository.save({ ...progress, streakCurrent: current, streakBest: best, ultimoDiaAtivo: today });

  const uuid = getOrCreateTravelerUuid({ repository: deps.repository });
  const name = getTraveler({ repository: deps.repository }).name;
  void deps.leaderboard.checkIn(uuid, {
    nome: name,
    sequenciaAtual: current,
    sequenciaRecorde: best,
    ultimoDiaAtivo: today,
  });
}

/** Batimento de presença ("estou aqui"): chamado uma vez ao montar e depois a cada ~90s. */
export function sendHeartbeat(deps: { repository: ProgressRepository; leaderboard: LeaderboardPort }): void {
  const uuid = getOrCreateTravelerUuid({ repository: deps.repository });
  void deps.leaderboard.heartbeat(uuid);
}

/** Wrapper fino sobre a leitura de "quem está online agora". */
export function getPresence(deps: { leaderboard: LeaderboardPort }): Promise<OnlinePlayer[]> {
  return deps.leaderboard.listOnlinePlayers();
}

/**
 * Recebe a foto já redimensionada (ver `infrastructure/leaderboard/resizeAvatar.ts`,
 * chamado por quem apresenta, nunca por aqui: `application/` não toca `canvas`/`Image`),
 * envia ao Supabase e atualiza o cache local com a URL pública. Silencioso: se o upload
 * falhar, devolve null e não mexe no cache (quem chama mantém a prévia otimista local).
 */
export async function uploadAvatarPhoto(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort },
  params: { blob: Blob },
): Promise<string | null> {
  const uuid = getOrCreateTravelerUuid({ repository: deps.repository });
  const url = await deps.leaderboard.uploadAvatar(uuid, params.blob);
  if (!url) return null;

  const progress = deps.repository.load() ?? createEmptyProgress();
  deps.repository.save({ ...progress, avatarUrl: url });
  return url;
}

/**
 * Backup silencioso do `Progress` inteiro (além do resumo público sincronizado por
 * `checkInDaily`/`syncProgress`/`syncBadge`). Chamado periodicamente pelo mesmo ciclo
 * de vida do batimento de presença (ver Layout). Não faz nada se ainda não houver
 * progresso local nem uuid — nada para guardar.
 */
export function backupProgress(deps: { repository: ProgressRepository; leaderboard: LeaderboardPort }): void {
  const progress = deps.repository.load();
  if (!progress) return;
  const uuid = getOrCreateTravelerUuid({ repository: deps.repository });
  void deps.leaderboard.backupProgress(uuid, progress);
}

export type RestoreProgressResult = { ok: true } | { ok: false; reason: string };

/**
 * Gera um código de recuperação (via `params.code`, criado na apresentação com
 * `generateRecoveryCode` — mesmo padrão de `resizeAvatarImage`/`uploadAvatarPhoto`,
 * ver `ServicesContext.tsx`), salva o hash no Supabase (`leaderboard.setRecoveryCode`) e
 * guarda o texto puro só localmente (`Progress.recoveryCode`), pra tela do Viajante poder
 * mostrar o código de novo neste aparelho sempre que quiser — o Supabase nunca guarda nem
 * consegue devolver o texto puro, só o hash (ver `supabase/schema.sql`).
 */
export async function generateAndSaveRecoveryCode(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort },
  params: { code: string },
): Promise<string> {
  const uuid = getOrCreateTravelerUuid({ repository: deps.repository });
  await deps.leaderboard.setRecoveryCode(uuid, params.code);
  const progress = deps.repository.load() ?? createEmptyProgress();
  deps.repository.save({ ...progress, recoveryCode: params.code });
  return params.code;
}

/** Lê o código de recuperação já gerado neste aparelho (ou null, se ainda não gerou nenhum). */
export function getCachedRecoveryCode(deps: { repository: ProgressRepository }): string | null {
  return deps.repository.load()?.recoveryCode ?? null;
}

/**
 * Recuperação de progresso: nome do jogador **e** o código de recuperação gerado por ele
 * (ver `generateAndSaveRecoveryCode`). O nome sozinho não bastava mais: nomes são públicos
 * no Hall dos Viajantes, então qualquer pessoa que visse o nome de outro jogador ali podia
 * puxar o progresso completo dele — esse código extra fecha essa brecha. Adota também o
 * uuid restaurado (não o deste aparelho), para que as próximas sincronizações silenciosas
 * (heartbeat, módulos concluídos, insígnias...) escrevam na linha certa do Supabase.
 *
 * Ao contrário de `backupProgress`/`checkInDaily`, esta é uma ação direta do aluno (clique
 * em um botão), então devolve um resultado para a tela mostrar — mesmo formato de
 * `importProgress`.
 */
export async function restoreProgress(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort },
  params: { nome: string; codigo: string },
): Promise<RestoreProgressResult> {
  const nome = params.nome.trim();
  const codigo = params.codigo.trim();
  if (!nome) return { ok: false, reason: 'Digite o nome do viajante.' };
  if (!codigo) return { ok: false, reason: 'Digite o código de recuperação.' };

  let found: { uuid: string; progress: unknown } | null;
  try {
    found = await deps.leaderboard.restoreProgress(nome, codigo);
  } catch {
    return { ok: false, reason: 'Não foi possível buscar agora. Tente novamente em instantes.' };
  }

  if (!found) {
    return { ok: false, reason: 'Nome ou código incorretos.' };
  }

  const restored = found.progress as Progress;
  deps.repository.save({ ...restored, travelerUuid: found.uuid });
  return { ok: true };
}
