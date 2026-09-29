import type { Comet, SkyState } from './types';

export const COMET_URGENT_MS = 24 * 60 * 60 * 1000;

const time = (iso: string) => Date.parse(iso);

function byStart(calendar: readonly Comet[]): Comet[] {
  return [...calendar].sort((a, b) => time(a.from) - time(b.from));
}

/** O que está no céu agora. A posição do cometa sai só do tempo: (agora − início) / (fim − início). */
export function skyAt(calendar: readonly Comet[], now: Date): SkyState {
  const t = now.getTime();
  const sorted = byStart(calendar);
  const current = sorted.find((c) => time(c.from) <= t && t < time(c.to));
  if (current) {
    const start = time(current.from);
    const end = time(current.to);
    const remainingMs = end - t;
    return { kind: 'comet', comet: current, progress: (t - start) / (end - start), remainingMs, urgent: remainingMs <= COMET_URGENT_MS };
  }
  const next = sorted.find((c) => time(c.from) > t);
  return next ? { kind: 'gap', next, untilMs: time(next.from) - t } : { kind: 'soon' };
}

/** Cometas que já passaram (o Arquivo da AVT), do mais recente para o mais antigo. */
export function pastComets(calendar: readonly Comet[], now: Date): Comet[] {
  return byStart(calendar)
    .filter((c) => time(c.to) <= now.getTime())
    .reverse();
}

export function cometOfTrail(calendar: readonly Comet[], trailId: string): Comet | undefined {
  return calendar.find((c) => c.trailId === trailId);
}

/** Durante o cometa, a insígnia rara; pelo Arquivo, a comum. */
export function cometBadgeFor(comet: Comet, at: Date): string {
  const t = at.getTime();
  return time(comet.from) <= t && t < time(comet.to) ? comet.rareBadgeId : comet.commonBadgeId;
}

/** A trilha de um cometa só abre quando ele chega ao céu (e continua aberta no Arquivo). */
export function cometArrived(comet: Comet, now: Date): boolean {
  return now.getTime() >= time(comet.from);
}

/** "3d 04h 12m" (ou "04h 12m" no último dia). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(total / 1440);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;
  const hm = `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  return d ? `${d}d ${hm}` : hm;
}
