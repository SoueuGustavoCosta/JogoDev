import { createEmptyProgress, getOrCreateTrailProgress } from '@/domain/progress';
import type { AnalyticsPort, ProgressRepository } from '../ports';

/**
 * Marca a insígnia do chefe de fase como conquistada em `TrailProgress.bossDefeated`,
 * seguindo o mesmo padrão ler-alterar-gravar de `completeModule`. Uma derrota depois de
 * já ter vencido nunca desfaz a insígnia (esta função só é chamada em vitória).
 */
export function winBossFight(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort },
  params: { trailId: string; badgeId: string },
): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const trailProgress = getOrCreateTrailProgress(progress, params.trailId);

  if (!trailProgress.bossDefeated) {
    deps.repository.save({
      ...progress,
      trails: {
        ...progress.trails,
        [params.trailId]: { ...trailProgress, bossDefeated: true },
      },
    });
    // TODO(supabase): sincronizar a insígnia '<badgeId>' quando a integração existir.
    // ex.: await supabaseInsigniasPort.grant({ trailId: params.trailId, badgeId: params.badgeId });
  }

  deps.analytics.track('boss_fight_won', { island: params.trailId });
}

export function startBossFight(deps: { analytics: AnalyticsPort }, params: { trailId: string }): void {
  deps.analytics.track('boss_fight_started', { island: params.trailId });
}

export function loseBossFight(deps: { analytics: AnalyticsPort }, params: { trailId: string }): void {
  deps.analytics.track('boss_fight_lost', { island: params.trailId });
}
