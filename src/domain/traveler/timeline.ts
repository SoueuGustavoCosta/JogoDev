/**
 * Linha do Tempo (Etapa 8): a ofensiva contada em dias em que o viajante JOGOU de verdade
 * (consertou a Anomalia do Dia ou concluiu uma lição), no fuso de São Paulo. Abrir o app
 * deixou de contar. Puro: recebe e devolve dados, sem ler relógio nem armazenamento.
 *
 * Migração: a sequência que o viajante já tinha (streakCurrent / ultimoDiaAtivo, contada
 * pela regra antiga) é mantida como está; a regra nova vale dali em diante.
 */

/** Âncora Temporal: +1 a cada tantos dias seguidos. */
export const ANCHOR_EVERY_DAYS = 7;
/** Máximo de âncoras guardadas. */
export const MAX_ANCHORS = 3;
/** Quantos dias jogados/ancorados guardar (o bastante para desenhar a semana). */
const HISTORY_DAYS = 14;

export type TimelineState = {
  current: number;
  best: number;
  /** Último dia jogado (AAAA-MM-DD, São Paulo); null = nunca jogou. */
  lastPlayed: string | null;
  anchors: number;
  /** Em que era do mapa o Eco está (0 = a primeira). Avança 1 a cada linha ramificada. */
  ecoEra: number;
  /** Dias jogados recentes, para desenhar a linha. */
  played: string[];
  /** Dias cobertos por âncora, para desenhar a linha. */
  anchored: string[];
  /** Dia em que a linha ramificou e o viajante recomeçou (evita perguntar de novo no mesmo dia). */
  brokenOn?: string;
};

/**
 * - `new`: sem sequência para perder (nunca jogou, ou já recomeçou).
 * - `played-today`: hoje já contou.
 * - `alive`: jogou ontem; hoje ainda falta.
 * - `can-anchor`: perdeu `missed` dia(s) e tem âncoras que bastam para cobrir.
 * - `broken`: perdeu dia(s) e não tem âncoras suficientes: a linha ramificou.
 */
export type TimelineStatus =
  | { kind: 'new' }
  | { kind: 'played-today' }
  | { kind: 'alive' }
  | { kind: 'can-anchor'; missed: number }
  | { kind: 'broken'; missed: number };

export function addDaysISO(dayISO: string, n: number): string {
  const [y, m, d] = dayISO.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function daysBetweenISO(fromISO: string, toISO: string): number {
  const [fy, fm, fd] = fromISO.split('-').map(Number);
  const [ty, tm, td] = toISO.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

export function evaluateTimeline(state: TimelineState, today: string): TimelineStatus {
  if (!state.lastPlayed || state.current <= 0) return { kind: 'new' };
  const gap = daysBetweenISO(state.lastPlayed, today);
  if (gap <= 0) return { kind: 'played-today' };
  if (gap === 1) return { kind: 'alive' };
  if (state.brokenOn === today) return { kind: 'new' };
  const missed = gap - 1;
  return state.anchors >= missed ? { kind: 'can-anchor', missed } : { kind: 'broken', missed };
}

function remember(list: string[], ...days: string[]): string[] {
  return [...new Set([...list, ...days])].sort().slice(-HISTORY_DAYS);
}

/** Usa âncoras para cobrir os dias perdidos: a sequência continua (sem crescer por eles). */
export function spendAnchors(state: TimelineState, today: string): TimelineState {
  const status = evaluateTimeline(state, today);
  if (status.kind !== 'can-anchor') return state;
  const covered = Array.from({ length: status.missed }, (_, i) => addDaysISO(state.lastPlayed!, i + 1));
  return {
    ...state,
    anchors: state.anchors - status.missed,
    anchored: remember(state.anchored, ...covered),
    lastPlayed: addDaysISO(today, -1),
  };
}

/** A linha ramificou: a sequência zera (o próximo dia jogado é o dia 1) e o Eco avança uma era. */
export function breakTimeline(state: TimelineState, today: string): TimelineState {
  const status = evaluateTimeline(state, today);
  if (status.kind !== 'broken' && status.kind !== 'can-anchor') return state;
  return { ...state, current: 0, ecoEra: state.ecoEra + 1, brokenOn: today };
}

export type PlayResult = {
  state: TimelineState;
  /** Hoje contou pela primeira vez (false se já tinha jogado hoje). */
  counted: boolean;
  /** Ganhou uma Âncora Temporal agora. */
  gainedAnchor: boolean;
};

/**
 * Registra um dia jogado (anomalia consertada ou lição concluída). Se havia dia perdido sem
 * decisão, conta como recomeço (quem chama deve oferecer a âncora antes). A cada
 * ANCHOR_EVERY_DAYS dias seguidos ganha uma âncora, até MAX_ANCHORS.
 */
export function registerPlay(state: TimelineState, today: string): PlayResult {
  const gap = state.lastPlayed ? daysBetweenISO(state.lastPlayed, today) : null;
  if (gap !== null && gap <= 0) return { state, counted: false, gainedAnchor: false };
  const current = gap === 1 && state.current > 0 ? state.current + 1 : 1;
  const earns = current % ANCHOR_EVERY_DAYS === 0 && state.anchors < MAX_ANCHORS;
  return {
    state: {
      ...state,
      current,
      best: Math.max(state.best, current),
      lastPlayed: today,
      anchors: earns ? state.anchors + 1 : state.anchors,
      played: remember(state.played, today),
    },
    counted: true,
    gainedAnchor: earns,
  };
}

/** Dias que faltam para a próxima âncora (0 se já está no máximo). */
export function daysToNextAnchor(state: TimelineState): number {
  if (state.anchors >= MAX_ANCHORS) return 0;
  const rest = state.current % ANCHOR_EVERY_DAYS;
  return ANCHOR_EVERY_DAYS - rest;
}

export type WeekNode = {
  day: string;
  /** seg, ter... */
  label: string;
  state: 'played' | 'anchored' | 'today' | 'missed' | 'future';
};

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** A semana (segunda a domingo) de `today`, com o estado de cada dia, para os 7 nós da linha. */
export function weekNodes(state: TimelineState, today: string): WeekNode[] {
  const [y, m, d] = today.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const monday = addDaysISO(today, -((weekday + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDaysISO(monday, i);
    const dow = (i + 1) % 7;
    let nodeState: WeekNode['state'];
    if (state.played.includes(day)) nodeState = 'played';
    else if (state.anchored.includes(day)) nodeState = 'anchored';
    else if (day === today) nodeState = 'today';
    else if (day > today) nodeState = 'future';
    else nodeState = 'missed';
    return { day, label: day === today ? 'hoje' : WEEKDAYS[dow], state: nodeState };
  });
}
