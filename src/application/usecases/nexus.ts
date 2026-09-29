import { markNexusSeen, nexusOfBranch, nexusState, shouldPlayNexus, type NexusBranch, type NexusEvent, type NexusState } from '@/domain/nexus';
import { createEmptyProgress } from '@/domain/progress';
import type { Trail } from '@/domain/trail';
import type { AnalyticsPort, ProgressRepository } from '../ports';

export type NexusBranchView = NexusBranch & { done: number; total: number; exists: boolean };

export type NexusView = {
  state: NexusState;
  /** A cena completa (flash, distorção, fios crescendo) ainda não tocou para esta lua. */
  play: boolean;
  branches: NexusBranchView[];
};

/** O que a tela da lua e o mapa mostram sobre as Ramificações. */
export function getNexus(
  deps: { repository: ProgressRepository },
  params: { event: NexusEvent; trails: readonly Trail[] },
): NexusView {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const state = nexusState(params.event, progress.trails[params.event.island]);
  return {
    state,
    play: shouldPlayNexus(progress, params.event),
    branches: params.event.branches.map((b) => {
      const trail = params.trails.find((t) => t.id === b.trailId);
      const modules = progress.trails[b.trailId]?.modules ?? {};
      return {
        ...b,
        exists: Boolean(trail),
        total: trail?.modules.length ?? 0,
        done: trail ? trail.modules.filter((m) => modules[m.id]?.completed).length : 0,
      };
    }),
  };
}

/** Marca que a cena do Evento Nexus já tocou (uma vez por lua). */
export function markNexusPlayed(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort },
  params: { island: string; now?: Date },
): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const next = markNexusSeen(progress, params.island, (params.now ?? new Date()).toISOString());
  if (next === progress) return;
  deps.repository.save(next);
  deps.analytics.track('nexus_event_seen', { island: params.island });
}

/**
 * Ramificação ainda fechada: devolve a lua de onde ela sai (o chefe dela ainda não foi
 * vencido). `null` quando a trilha pode abrir, inclusive quando não é uma Ramificação.
 */
export function getBranchLock(
  deps: { repository: ProgressRepository },
  params: { events: readonly NexusEvent[]; trailId: string; trails: readonly Trail[] },
): { island: Trail | undefined } | null {
  const event = nexusOfBranch(params.events, params.trailId);
  if (!event) return null;
  const progress = deps.repository.load() ?? createEmptyProgress();
  if (nexusState(event, progress.trails[event.island]) === 'open') return null;
  return { island: params.trails.find((t) => t.id === event.island) };
}
