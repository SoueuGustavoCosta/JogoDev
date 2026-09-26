import {
  createEmptyProgress,
  getOrCreateModuleProgress,
  getOrCreateTrailProgress,
  isTrailCompleted,
  moduleRecap,
  XP_MODULE_COMPLETION_BONUS,
  type ModuleRecap,
} from '@/domain/progress';
import type { Trail } from '@/domain/trail';
import type { Badge } from '@/domain/badges';
import type { AnalyticsPort, LeaderboardPort, ProgressRepository } from '../ports';
import { awardBadge, awardBadgesForModule } from './badges';
import { recordXpGain, syncWeeklyXp } from './league';
import { recordPlayedDay } from './timeline';

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
  /**
   * Esta conclusão deu ao viajante a primeira insígnia da vida dele (antes tinha zero).
   * É o momento de sugerir, uma única vez e sem interromper, que ele salve o progresso.
   */
  firstBadge: boolean;
};

function badgeCount(progress: { badgesEarned?: Record<string, string> } | null): number {
  return Object.keys(progress?.badgesEarned ?? {}).length;
}

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
      firstBadge: false,
    };
  }
  const badgesBefore = badgeCount(progress);

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
    // Relê o progresso: as insígnias do módulo acabaram de ser gravadas, e gravar a partir
    // de `nextProgress` (anterior a elas) apagaria a insígnia do último módulo da trilha.
    const latest = deps.repository.load() ?? nextProgress;
    const latestTrail = latest.trails[params.trail.id] ?? nextTrailProgress;
    deps.repository.save({
      ...latest,
      trails: { ...latest.trails, [params.trail.id]: { ...latestTrail, trophyAwarded: true } },
    });
    deps.analytics.track('island_completed', { island: params.trail.id });
    // Insígnia "rara" (o degrau entre as insígnias comuns e a lendária do chefe de
    // fase): concedida uma única vez, no instante em que o troféu da trilha nasce.
    if (params.trail.completionBadgeId) {
      awardBadge(deps, { badgeId: params.trail.completionBadgeId, traveler: params.traveler });
    }
  }

  // Concluir uma lição inteira conta como dia jogado na Linha do Tempo (Etapa 8). Por
  // último: as gravações acima partem de uma cópia anterior do progresso.
  recordPlayedDay(deps);
  // Bônus de conclusão entra no XP da semana (Liga dos Viajantes), que sobe para o ranking.
  recordXpGain(deps, { sourceId: `module:${params.trail.id}/${params.moduleId}`, xp: XP_MODULE_COMPLETION_BONUS });
  syncWeeklyXp(deps);

  return {
    alreadyCompleted: false,
    trailCompleted,
    recap: moduleRecap(params.trail, params.moduleId, nextTrailProgress),
    firstBadge: badgesBefore === 0 && badgeCount(deps.repository.load()) > 0,
  };
}
