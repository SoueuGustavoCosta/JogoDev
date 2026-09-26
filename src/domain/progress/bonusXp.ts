import type { Progress } from './types';

/**
 * XP extra de eventos (Surto Temporal, Etapa 11), por fonte com id único
 * (`surto:quiz:...`, `surto:module:...`). O XP normal continua saindo do conteúdo; este é
 * só o que o multiplicador deu a mais, somado ao total do viajante. Merge: união por id.
 */
export function recordBonusXp(progress: Progress, id: string, xp: number): Progress {
  if (!(xp > 0) || (progress.xpBonus?.[id] ?? 0) >= xp) return progress;
  return { ...progress, xpBonus: { ...progress.xpBonus, [id]: xp } };
}

export function bonusXpTotal(progress: Progress): number {
  return Object.values(progress.xpBonus ?? {}).reduce((sum, xp) => sum + (xp > 0 ? xp : 0), 0);
}

export function mergeBonusXp(a: Progress['xpBonus'], b: Progress['xpBonus']): Progress['xpBonus'] {
  if (!a || !b) return a ?? b;
  const out = { ...b };
  for (const [id, xp] of Object.entries(a)) out[id] = Math.max(xp, out[id] ?? 0);
  return out;
}
