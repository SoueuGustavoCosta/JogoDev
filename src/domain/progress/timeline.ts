import type { TimelineState } from '../traveler/timeline';
import type { Progress } from './types';

/** A Linha do Tempo guardada no progresso (a sequência antiga continua valendo: migração). */
export function timelineOf(progress: Progress): TimelineState {
  return {
    current: progress.streakCurrent ?? 0,
    best: progress.streakBest ?? 0,
    lastPlayed: progress.ultimoDiaAtivo ?? null,
    anchors: progress.anchors ?? 0,
    ecoEra: progress.ecoEra ?? 0,
    played: progress.playedDays ?? [],
    anchored: progress.anchoredDays ?? [],
    brokenOn: progress.lineBrokenOn,
  };
}

export function withTimeline(progress: Progress, state: TimelineState): Progress {
  const next: Progress = {
    ...progress,
    streakCurrent: state.current,
    streakBest: state.best,
    ultimoDiaAtivo: state.lastPlayed ?? undefined,
    anchors: state.anchors,
    ecoEra: state.ecoEra,
    playedDays: state.played,
    anchoredDays: state.anchored,
    lineBrokenOn: state.brokenOn,
  };
  for (const key of ['ultimoDiaAtivo', 'lineBrokenOn'] as const) if (next[key] === undefined) delete next[key];
  return next;
}
