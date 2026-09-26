import { anomalyDay } from '@/domain/anomaly';
import { createEmptyProgress, timelineOf, withTimeline } from '@/domain/progress';
import {
  breakTimeline,
  daysToNextAnchor,
  evaluateTimeline,
  registerPlay,
  spendAnchors,
  weekNodes,
  type TimelineState,
  type TimelineStatus,
  type WeekNode,
} from '@/domain/traveler';
import type { LeaderboardPort, ProgressRepository } from '../ports';
import { getOrCreateTravelerUuid, getTraveler } from './traveler';

type Deps = { repository: ProgressRepository; leaderboard: LeaderboardPort };

export type TimelineView = {
  today: string;
  state: TimelineState;
  status: TimelineStatus;
  week: WeekNode[];
  daysToAnchor: number;
};

/** A Linha do Tempo do viajante agora (dias no fuso de São Paulo). */
export function getTimeline(deps: { repository: ProgressRepository }, now: Date = new Date()): TimelineView {
  const today = anomalyDay(now);
  const state = timelineOf(deps.repository.load() ?? createEmptyProgress());
  return { today, state, status: evaluateTimeline(state, today), week: weekNodes(state, today), daysToAnchor: daysToNextAnchor(state) };
}

/** Manda a sequência para o Hall (mesmo formato de antes; também cria a linha do viajante lá). */
function sync(deps: Deps, state: TimelineState): void {
  const uuid = getOrCreateTravelerUuid({ repository: deps.repository });
  const name = getTraveler({ repository: deps.repository }).name;
  void deps.leaderboard.checkIn(uuid, {
    nome: name,
    sequenciaAtual: state.current,
    sequenciaRecorde: state.best,
    ultimoDiaAtivo: state.lastPlayed ?? anomalyDay(new Date()),
  });
}

function save(deps: Deps, state: TimelineState): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  deps.repository.save(withTimeline(progress, state));
  sync(deps, state);
}

/**
 * Ao abrir o app (uma vez por sessão): confere a linha. Abrir não conta como dia jogado.
 * Se perdeu dia sem âncora que baste, a linha ramifica agora (a sequência zera e o Eco
 * avança). Devolve o que aconteceu, para a tela "A linha ramificou" (ou a escolha da âncora).
 */
export function openTimeline(deps: Deps, now: Date = new Date()): TimelineStatus {
  const today = anomalyDay(now);
  const state = timelineOf(deps.repository.load() ?? createEmptyProgress());
  const status = evaluateTimeline(state, today);
  if (status.kind === 'broken') save(deps, breakTimeline(state, today));
  else sync(deps, state);
  return status;
}

/** Escolha na tela "A linha ramificou": gastar a(s) âncora(s) ou recomeçar do dia 1. */
export function resolveTimeline(deps: Deps, params: { choice: 'anchor' | 'restart'; now?: Date }): TimelineState {
  const today = anomalyDay(params.now ?? new Date());
  const state = timelineOf(deps.repository.load() ?? createEmptyProgress());
  const next = params.choice === 'anchor' ? spendAnchors(state, today) : breakTimeline(state, today);
  if (next !== state) save(deps, next);
  return next;
}

export type PlayedDay = { counted: boolean; gainedAnchor: boolean; current: number; daysToAnchor: number; anchors: number };

/** Dia jogado: chamado ao consertar a Anomalia do Dia e ao concluir uma lição. */
export function recordPlayedDay(deps: Deps, now: Date = new Date()): PlayedDay {
  const today = anomalyDay(now);
  const result = registerPlay(timelineOf(deps.repository.load() ?? createEmptyProgress()), today);
  if (result.counted) save(deps, result.state);
  return {
    counted: result.counted,
    gainedAnchor: result.gainedAnchor,
    current: result.state.current,
    daysToAnchor: daysToNextAnchor(result.state),
    anchors: result.state.anchors,
  };
}
