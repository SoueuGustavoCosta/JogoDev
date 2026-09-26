import type { BossRound } from '@/domain/bossFight';
import {
  activeEvents,
  convergenceProgress,
  nextOccurrence,
  pickForDay,
  xpMultiplier,
  type ActiveEvent,
  type ConvergenceProgress,
  type ConvergenciaEvent,
  type EcoSoltoEvent,
  type GameEvent,
} from '@/domain/events';
import { anomalyDay } from '@/domain/anomaly';
import { createEmptyProgress, earnFragments, grantItem, ownedCosmeticIds } from '@/domain/progress';
import type { AnalyticsPort, LeaderboardPort, ProgressRepository } from '../ports';

/** Quantas rodadas tem o Eco Solto (o motor é o mesmo do chefe de fase). */
export const ECO_SOLTO_ROUNDS = 3;

export type ActiveEventsView = { day: string; active: ActiveEvent[]; multiplier: number };

/** Eventos de hoje (fuso de São Paulo) e o multiplicador de XP que vale agora. */
export function getActiveEvents(params: { calendar: readonly GameEvent[]; now?: Date }): ActiveEventsView {
  const day = anomalyDay(params.now ?? new Date());
  const active = activeEvents(params.calendar, day);
  return { day, active, multiplier: xpMultiplier(active) };
}

export type EcoSoltoView = {
  day: string;
  event: EcoSoltoEvent | null;
  /** Está solto hoje? */
  active: boolean;
  /** Próximo dia em que ele aparece (quando não é hoje). */
  nextDay: string | null;
  /** As 3 rodadas de hoje, iguais para toda a turma. */
  rounds: BossRound[];
  wonToday: boolean;
  ownsReward: boolean;
};

export function getEcoSolto(
  deps: { repository: ProgressRepository },
  params: { calendar: readonly GameEvent[]; pool: readonly BossRound[]; now?: Date },
): EcoSoltoView {
  const day = anomalyDay(params.now ?? new Date());
  const progress = deps.repository.load() ?? createEmptyProgress();
  const ecos = params.calendar.filter((e): e is EcoSoltoEvent => e.kind === 'eco-solto');
  const today = activeEvents(ecos, day)[0]?.event as EcoSoltoEvent | undefined;
  const event = today ?? ecos[0] ?? null;
  const upcoming = ecos.map((e) => nextOccurrence(e, day)).filter((d): d is string => d !== null).sort();
  return {
    day,
    event,
    active: Boolean(today),
    nextDay: today ? null : (upcoming[0] ?? null),
    rounds: today ? pickForDay(params.pool, `${day}:${today.id}`, ECO_SOLTO_ROUNDS) : [],
    wonToday: Boolean(progress.ecoSoltoWins?.includes(day)),
    ownsReward: event ? ownedCosmeticIds(progress).has(event.rewardItemId) : false,
  };
}

export function startEcoSolto(deps: { analytics: AnalyticsPort }): void {
  deps.analytics.track('eco_solto_started');
}

export function loseEcoSolto(deps: { analytics: AnalyticsPort }): void {
  deps.analytics.track('eco_solto_lost');
}

export type EcoSoltoReward = { kind: 'item'; itemId: string } | { kind: 'fragments'; amount: number } | { kind: 'none' };

/**
 * Vitória no Eco Solto: a primeira dá o cosmético do evento; depois, `bonusFragments` ◆ uma
 * vez por dia de evento. Vencer de novo no mesmo dia não dá nada a mais.
 */
export function winEcoSolto(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort },
  params: { event: EcoSoltoEvent; now?: Date },
): EcoSoltoReward {
  const now = params.now ?? new Date();
  const day = anomalyDay(now);
  const progress = deps.repository.load() ?? createEmptyProgress();
  if (progress.ecoSoltoWins?.includes(day)) return { kind: 'none' };
  const wins = [...(progress.ecoSoltoWins ?? []), day].sort().slice(-60);
  let reward: EcoSoltoReward;
  let next;
  if (!ownedCosmeticIds(progress).has(params.event.rewardItemId)) {
    next = grantItem(progress, { itemId: params.event.rewardItemId, at: now.toISOString() });
    reward = { kind: 'item', itemId: params.event.rewardItemId };
  } else if (params.event.bonusFragments > 0) {
    next = earnFragments(progress, { id: `eco-solto:${day}`, amount: params.event.bonusFragments, at: now.toISOString() });
    reward = { kind: 'fragments', amount: params.event.bonusFragments };
  } else {
    next = progress;
    reward = { kind: 'none' };
  }
  deps.repository.save({ ...next, ecoSoltoWins: wins });
  deps.analytics.track('eco_solto_won', { reward: reward.kind });
  return reward;
}

export type ConvergenceView = { event: ConvergenciaEvent; until: string; progress: ConvergenceProgress; unlocked: boolean };

/** A Convergência ativa hoje (se houver), sem a contagem da turma (que vem pela rede). */
export function getActiveConvergence(params: { calendar: readonly GameEvent[]; now?: Date }): ActiveEvent | null {
  const { active } = getActiveEvents(params);
  return active.find((a) => a.event.kind === 'convergencia') ?? null;
}

/**
 * Meta da turma: conta as anomalias consertadas no período (Supabase) e, se a meta foi
 * batida, libera o cosmético para este viajante (uma vez). Sem rede, mostra sem contagem.
 */
export async function loadConvergence(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort; analytics: AnalyticsPort },
  params: { active: ActiveEvent },
): Promise<ConvergenceView | null> {
  const event = params.active.event;
  if (event.kind !== 'convergencia') return null;
  let count: number | null = null;
  try {
    count = await deps.leaderboard.countAnomaliesBetween(event.when.from, event.when.to);
  } catch {
    count = null;
  }
  const progress = convergenceProgress(event, count);
  const current = deps.repository.load() ?? createEmptyProgress();
  let unlocked = ownedCosmeticIds(current).has(event.rewardItemId);
  if (progress.reached && !unlocked) {
    deps.repository.save(grantItem(current, { itemId: event.rewardItemId, at: new Date().toISOString() }));
    deps.analytics.track('convergence_unlocked', { event: event.id });
    unlocked = true;
  }
  return { event, until: params.active.until, progress, unlocked };
}
