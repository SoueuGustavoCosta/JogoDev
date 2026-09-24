import {
  createEmptyProgress,
  getOrCreateModuleProgress,
  getOrCreateTrailProgress,
  isTrailCompleted,
  moduleRecap,
  type ModuleRecap,
} from '@/domain/progress';
import type { Trail } from '@/domain/trail';
import type { Badge } from '@/domain/badges';
import type { AnalyticsPort, LeaderboardPort, ProgressRepository } from '../ports';
import { awardBadge, awardBadgesForModule } from './badges';

export type CompleteModuleParams = {
  trail: Trail;
  moduleId: string;
  /** Viajante atual, para sincronizar silenciosamente com o Hall dos Viajantes. */
  traveler: { uuid: string; name: string };
  /** Catálogo compartilhado de insígnias (ver domain/badges), para conceder as ligadas a este módulo. */
  badgeCatalog?: Badge[];
};

export type CompleteModuleResult = {
  alreadyCompleted: boolean;
  trailCompleted: boolean;
  /** Como o aluno foi neste módulo, para a Sintaxe comentar. */
  recap: ModuleRecap;
};

export function completeModule(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort; leaderboard: LeaderboardPort },
  params: CompleteModuleParams,
): CompleteModuleResult {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const trailProgress = getOrCreateTrailProgress(progress, params.trail.id);
  const moduleProgress = getOrCreateModuleProgress(trailProgress, params.moduleId);

  if (moduleProgress.completed) {
    return {
      alreadyCompleted: true,
      trailCompleted: isTrailCompleted(params.trail, trailProgress),
      recap: moduleRecap(params.trail, params.moduleId, trailProgress),
    };
  }

  const nextTrailProgress = {
    ...trailProgress,
    modules: {
      ...trailProgress.modules,
      [params.moduleId]: { ...moduleProgress, completed: true },
    },
  };
  const nextProgress = {
    ...progress,
    trails: { ...progress.trails, [params.trail.id]: nextTrailProgress },
  };

  deps.repository.save(nextProgress);
  deps.analytics.track('module_completed', { island: params.trail.id, module: params.moduleId });
  // Sincronização silenciosa e "fire-and-forget": nunca deve travar nem quebrar o
  // fluxo do aluno (a porta garante que essas chamadas não lançam).
  void deps.leaderboard.upsertPlayer(params.traveler.uuid, params.traveler.name);
  void deps.leaderboard.syncProgress(params.traveler.uuid, params.trail.id, params.moduleId);
  awardBadgesForModule(deps, {
    catalog: params.badgeCatalog ?? [],
    trailId: params.trail.id,
    moduleId: params.moduleId,
    traveler: params.traveler,
  });

  const trailCompleted = isTrailCompleted(params.trail, nextTrailProgress);
  if (trailCompleted && !nextTrailProgress.trophyAwarded) {
    const withTrophy = { ...nextTrailProgress, trophyAwarded: true };
    deps.repository.save({
      ...nextProgress,
      trails: { ...nextProgress.trails, [params.trail.id]: withTrophy },
    });
    deps.analytics.track('island_completed', { island: params.trail.id });
    // Insígnia "rara" (o degrau entre as insígnias comuns e a lendária do chefe de
    // fase): concedida uma única vez, no instante em que o troféu da trilha nasce.
    if (params.trail.completionBadgeId) {
      awardBadge(deps, { badgeId: params.trail.completionBadgeId, traveler: params.traveler });
    }
  }

  return { alreadyCompleted: false, trailCompleted, recap: moduleRecap(params.trail, params.moduleId, nextTrailProgress) };
}
