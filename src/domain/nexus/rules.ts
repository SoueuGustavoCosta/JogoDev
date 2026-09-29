import type { Progress, TrailProgress } from '../progress/types';
import type { NexusEvent, NexusState } from './types';

/** Estado dos portais: abrem quando o chefe da lua foi vencido (mesma regra de `isEraRestored`). */
export function nexusState(
  event: NexusEvent,
  islandProgress: TrailProgress | undefined,
): NexusState {
  if (!event.launched) return 'soon';
  return islandProgress?.bossDefeated ? 'open' : 'locked';
}

/**
 * Chave da lua em `nexusSeen`. A versão 2 (2026-09-29) faz a cena tocar mais uma vez para
 * quem já tinha vencido o chefe: antes ela tocava ao abrir a tela, fora da vista (no fim
 * da página), e ficava marcada como vista sem ninguém ver. As chaves antigas (só o id da
 * lua) ficam no progresso e são ignoradas.
 */
export function nexusSeenKey(island: string): string {
  return `${island}#2`;
}

/** A cena completa do Evento Nexus (flash, distorção, fios) toca uma vez por lua. */
export function shouldPlayNexus(progress: Progress, event: NexusEvent): boolean {
  return (
    nexusState(event, progress.trails?.[event.island]) === 'open' &&
    !progress.nexusSeen?.[nexusSeenKey(event.island)]
  );
}

export function markNexusSeen(progress: Progress, island: string, at: string): Progress {
  const key = nexusSeenKey(island);
  if (progress.nexusSeen?.[key]) return progress;
  return { ...progress, nexusSeen: { ...progress.nexusSeen, [key]: at } };
}

/** Merge entre aparelhos: união por lua, fica a data mais antiga. */
export function mergeNexusSeen(
  a: Progress['nexusSeen'],
  b: Progress['nexusSeen'],
): Progress['nexusSeen'] {
  if (!a || !b) return a ?? b;
  const out = { ...b };
  for (const [island, at] of Object.entries(a))
    if (!out[island] || at < out[island]) out[island] = at;
  return out;
}

export function nexusForIsland(
  events: readonly NexusEvent[],
  island: string,
): NexusEvent | undefined {
  return events.find((e) => e.island === island);
}

/** O Evento Nexus de onde sai uma Ramificação (ou nada, se a trilha não é Ramificação). */
export function nexusOfBranch(
  events: readonly NexusEvent[],
  trailId: string,
): NexusEvent | undefined {
  return events.find((e) => e.branches.some((b) => b.trailId === trailId));
}
