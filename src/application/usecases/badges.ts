import { createEmptyProgress } from '@/domain/progress';
import type { Badge } from '@/domain/badges';
import type { AnalyticsPort, LeaderboardPort, ProgressRepository } from '../ports';

/**
 * Concede as insígnias do catálogo compartilhado (ver domain/badges) cujo `unlockedBy`
 * bate com o módulo recém-concluído, em qualquer trilha. Ler-alterar-gravar no mesmo
 * padrão de `completeModule`/`winBossFight`; não faz nada se nenhuma insígnia do
 * catálogo estiver ligada a este módulo (a maioria ainda não está, de propósito).
 *
 * O catálogo é passado por quem chama (como `trail` em `completeModule`) em vez de
 * importado de `content/` aqui: `application/` só conhece `domain/` e portas (seção 3
 * do CLAUDE.md); é a camada de apresentação, que já lê `content/registry`, quem entrega
 * os dados tipados.
 */
export function awardBadgesForModule(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort; leaderboard: LeaderboardPort },
  params: { catalog: Badge[]; trailId: string; moduleId: string; traveler: { uuid: string; name: string } },
): void {
  const matches = params.catalog.filter((b) => b.unlockedBy === params.moduleId);
  if (matches.length === 0) return;

  const progress = deps.repository.load() ?? createEmptyProgress();
  const badgesEarned = { ...(progress.badgesEarned ?? {}) };
  let changed = false;

  for (const badge of matches) {
    if (badgesEarned[badge.id]) continue;
    badgesEarned[badge.id] = new Date().toISOString();
    changed = true;
    void deps.leaderboard.syncBadge(params.traveler.uuid, badge.id);
  }

  if (!changed) return;

  deps.repository.save({ ...progress, badgesEarned });
  void deps.leaderboard.upsertPlayer(params.traveler.uuid, params.traveler.name);
}

/** Concede uma insígnia específica (caso do chefe de fase: `bossFight.badgeId`). */
export function awardBadge(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort; leaderboard: LeaderboardPort },
  params: { badgeId: string; traveler: { uuid: string; name: string } },
): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  if (progress.badgesEarned?.[params.badgeId]) return;

  const badgesEarned = { ...(progress.badgesEarned ?? {}), [params.badgeId]: new Date().toISOString() };
  deps.repository.save({ ...progress, badgesEarned });
  void deps.leaderboard.upsertPlayer(params.traveler.uuid, params.traveler.name);
  void deps.leaderboard.syncBadge(params.traveler.uuid, params.badgeId);
}
