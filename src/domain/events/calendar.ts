import { WEEKDAYS, type ActiveEvent, type ConvergenceProgress, type ConvergenciaEvent, type GameEvent, type Weekday } from './types';

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function weekdayOf(day: string): Weekday {
  const [y, m, d] = day.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // domingo = 0
  return WEEKDAYS[(dow + 6) % 7];
}

export function isEventActiveOn(event: GameEvent, day: string): boolean {
  const when = event.when;
  if ('weekly' in when) return when.weekly.includes(weekdayOf(day));
  return day >= when.from && day <= when.to;
}

/** Último dia da sequência de dias ativos que começa em `day` (ex.: sábado -> domingo). */
export function activeUntil(event: GameEvent, day: string): string {
  let last = day;
  for (let i = 1; i <= 366 && isEventActiveOn(event, addDays(day, i)); i++) last = addDays(day, i);
  return last;
}

/** Eventos ativos num dia, na ordem do calendário. */
export function activeEvents(calendar: readonly GameEvent[], day: string): ActiveEvent[] {
  return calendar.filter((e) => isEventActiveOn(e, day)).map((event) => ({ event, until: activeUntil(event, day) }));
}

/** Próximo dia (a partir de amanhã) em que o evento acontece, ou null se não volta. */
export function nextOccurrence(event: GameEvent, day: string): string | null {
  for (let i = 1; i <= 366; i++) if (isEventActiveOn(event, addDays(day, i))) return addDays(day, i);
  return null;
}

/** Multiplicador de XP do dia: o maior Surto ativo (eventos não se somam), ou 1. */
export function xpMultiplier(active: readonly ActiveEvent[]): number {
  return active.reduce((m, { event }) => (event.kind === 'surto' ? Math.max(m, event.multiplier) : m), 1);
}

/** XP a mais que o multiplicador dá sobre um ganho (arredondado). */
export function bonusXp(xp: number, multiplier: number): number {
  if (!(xp > 0) || !(multiplier > 1)) return 0;
  return Math.round(xp * multiplier) - xp;
}

export function convergenceProgress(event: ConvergenciaEvent, count: number | null): ConvergenceProgress {
  const safe = count === null ? null : Math.max(0, Math.floor(count));
  const percent = safe === null ? 0 : Math.min(100, Math.floor((safe / event.target) * 100));
  return { count: safe, target: event.target, percent, reached: safe !== null && safe >= event.target };
}

/** Hash estável (FNV-1a) para sortear as rodadas do Eco Solto do dia, iguais para todos. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Sorteia `count` itens diferentes de `pool`, iguais para todos no mesmo dia. */
export function pickForDay<T>(pool: readonly T[], day: string, count: number): T[] {
  const ranked = pool.map((item, i) => ({ item, key: hash(`${day}#${i}`) }));
  ranked.sort((a, b) => a.key - b.key);
  return ranked.slice(0, Math.min(count, pool.length)).map((r) => r.item);
}
