import {
  cometArrived,
  cometBadgeFor,
  cometOfTrail,
  pastComets,
  skyAt,
  type Comet,
  type SkyState,
} from '@/domain/comets';
import { createEmptyProgress } from '@/domain/progress';
import type { Trail } from '@/domain/trail';
import type { AnalyticsPort, ProgressRepository } from '../ports';

/** O céu do mapa agora. */
export function getSky(params: { calendar: readonly Comet[]; now?: Date }): SkyState {
  return skyAt(params.calendar, params.now ?? new Date());
}

export function openCometCard(deps: { analytics: AnalyticsPort }, params: { comet: Comet }): void {
  deps.analytics.track('comet_opened', { comet: params.comet.id });
}

export type ArchiveEntry = {
  comet: Comet;
  done: number;
  total: number;
  /** Qual insígnia o viajante já tem deste cometa (a rara vale mais, e nunca se perde). */
  badge: 'rare' | 'common' | null;
};

/** Arquivo da AVT: cometas que já passaram, para jogar depois (vale a insígnia comum). */
export function getArchive(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort },
  params: { calendar: readonly Comet[]; trails: readonly Trail[]; now?: Date },
): ArchiveEntry[] {
  const progress = deps.repository.load() ?? createEmptyProgress();
  return pastComets(params.calendar, params.now ?? new Date()).map((comet) => {
    const trail = params.trails.find((t) => t.id === comet.trailId);
    const modules = progress.trails[comet.trailId]?.modules ?? {};
    const earned = progress.badgesEarned ?? {};
    return {
      comet,
      total: trail?.modules.length ?? 0,
      done: trail ? trail.modules.filter((m) => modules[m.id]?.completed).length : 0,
      badge: earned[comet.rareBadgeId] ? 'rare' : earned[comet.commonBadgeId] ? 'common' : null,
    };
  });
}

export function openArchive(deps: { analytics: AnalyticsPort }): void {
  deps.analytics.track('archive_opened');
}

/**
 * Insígnia que o chefe dá ao ser vencido: nas trilhas de cometa, a rara durante o evento
 * e a comum pelo Arquivo; nas outras, a do próprio chefe.
 */
export function bossBadgeFor(params: { calendar: readonly Comet[]; trailId: string; badgeId: string; now?: Date }): string {
  const comet = cometOfTrail(params.calendar, params.trailId);
  return comet ? cometBadgeFor(comet, params.now ?? new Date()) : params.badgeId;
}

/** Trilha de cometa que ainda não chegou ao céu: devolve o cometa (a trilha fica fechada). */
export function getCometLock(params: { calendar: readonly Comet[]; trailId: string; now?: Date }): Comet | null {
  const comet = cometOfTrail(params.calendar, params.trailId);
  return comet && !cometArrived(comet, params.now ?? new Date()) ? comet : null;
}
