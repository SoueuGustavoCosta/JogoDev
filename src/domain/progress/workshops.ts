import type { Progress, WorkshopResult } from './types';

/** XP ganho nas oficinas (soma dos registros). */
export function workshopXpTotal(progress: Progress): number {
  return Object.values(progress.workshops ?? {}).reduce((sum, r) => sum + (r?.xp ?? 0), 0);
}

/**
 * Registra uma oficina resolvida. Resolver de novo nunca diminui o XP já ganho; o extra,
 * uma vez feito, fica feito.
 */
export function recordWorkshop(progress: Progress, id: string, result: WorkshopResult): Progress {
  const before = progress.workshops?.[id];
  const merged = before ? mergeWorkshopResult(before, result) : result;
  return { ...progress, workshops: { ...progress.workshops, [id]: merged } };
}

function mergeWorkshopResult(a: WorkshopResult, b: WorkshopResult): WorkshopResult {
  const [first, second] = a.solvedAt <= b.solvedAt ? [a, b] : [b, a];
  const merged: WorkshopResult = {
    ...first,
    xp: Math.max(a.xp, b.xp),
    langs: [...new Set([...(first.langs ?? []), ...(second.langs ?? [])])],
  };
  if (a.extra || b.extra) merged.extra = true;
  else delete merged.extra;
  return merged;
}

/** Merge entre aparelhos: por oficina, o registro mais antigo, com o maior XP e o extra de qualquer lado. */
export function mergeWorkshops(a: Progress['workshops'], b: Progress['workshops']): Progress['workshops'] {
  if (!a || !b) return a ?? b;
  const out = { ...b };
  for (const [id, r] of Object.entries(a)) out[id] = out[id] ? mergeWorkshopResult(r, out[id]) : r;
  return out;
}
