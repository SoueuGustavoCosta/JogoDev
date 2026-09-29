import type { Progress, TrailProgress } from '../progress/types';
import type { NexusEvent, NexusState } from './types';

/** Estado dos portais: abrem quando o chefe da lua foi vencido (mesma regra de `isEraRestored`). */
export function nexusState(event: NexusEvent, islandProgress: TrailProgress | undefined): NexusState {
  if (!event.launched) return 'soon';
  return islandProgress?.bossDefeated ? 'open' : 'locked';
}

/** A cena completa do Evento Nexus (flash, distorção, fios) toca uma vez por lua. */
export function shouldPlayNexus(progress: Progress, event: NexusEvent): boolean {
  return nexusState(event, progress.trails?.[event.island]) === 'open' && !progress.nexusSeen?.[event.island];
}

export function markNexusSeen(progress: Progress, island: string, at: string): Progress {
  if (progress.nexusSeen?.[island]) return progress;
  return { ...progress, nexusSeen: { ...progress.nexusSeen, [island]: at } };
}

/** Merge entre aparelhos: união por lua, fica a data mais antiga. */
export function mergeNexusSeen(a: Progress['nexusSeen'], b: Progress['nexusSeen']): Progress['nexusSeen'] {
  if (!a || !b) return a ?? b;
  const out = { ...b };
  for (const [island, at] of Object.entries(a)) if (!out[island] || at < out[island]) out[island] = at;
  return out;
}

export function nexusForIsland(events: readonly NexusEvent[], island: string): NexusEvent | undefined {
  return events.find((e) => e.island === island);
}

/** O Evento Nexus de onde sai uma Ramificação (ou nada, se a trilha não é Ramificação). */
export function nexusOfBranch(events: readonly NexusEvent[], trailId: string): NexusEvent | undefined {
  return events.find((e) => e.branches.some((b) => b.trailId === trailId));
}
