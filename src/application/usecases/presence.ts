import { createEmptyProgress, xpForTrail } from '@/domain/progress';
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
