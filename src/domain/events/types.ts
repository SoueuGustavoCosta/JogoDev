/**
 * Calendário de eventos (Etapa 11). O autor cria eventos só editando
 * `src/content/events/calendar.ts` (ver CLAUDE.md, seção 10). Datas são dias do fuso de
 * São Paulo (AAAA-MM-DD), iguais aos da Anomalia do Dia; `to` é inclusivo.
 */
export type Weekday = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

export const WEEKDAYS: readonly Weekday[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

/** Quando o evento acontece: toda semana nesses dias, ou entre duas datas. */
export type EventWhen = { weekly: Weekday[] } | { from: string; to: string };

type EventBase = {
  /** Único no calendário, minúsculas e hífens. */
  id: string;
  title: string;
  /** Uma frase curta para a faixa do Início e da Liga. */
  description: string;
};

/** Surto Temporal: XP multiplicado (perguntas, conclusão de módulo e anomalia). */
export type SurtoEvent = EventBase & { kind: 'surto'; multiplier: number; when: EventWhen };

/** Eco Solto: mini-chefe de 3 rodadas; a primeira vitória dá um cosmético, as seguintes dão ◆. */
export type EcoSoltoEvent = EventBase & {
  kind: 'eco-solto';
  rewardItemId: string;
  /** ◆ por vitória depois que o item já é do viajante (uma vez por dia de evento). */
  bonusFragments: number;
  /** Opcional: uma oficina (content/workshops) para treinar depois do chefe. */
  workshopId?: string;
  when: EventWhen;
};

/** Convergência: meta coletiva (anomalias consertadas pela turma no período) que libera um cosmético para todos. */
export type ConvergenciaEvent = EventBase & {
  kind: 'convergencia';
  target: number;
  /** O que a turma precisa juntar: anomalias consertadas (padrão) ou oficinas resolvidas. */
  metric?: 'anomalias' | 'oficinas';
  rewardItemId: string;
  when: { from: string; to: string };
};

export type GameEvent = SurtoEvent | EcoSoltoEvent | ConvergenciaEvent;

/** Um evento ativo num dia, com o último dia seguido em que continua ativo. */
export type ActiveEvent = { event: GameEvent; until: string };

export type ConvergenceProgress = {
  count: number | null;
  target: number;
  /** 0 a 100. */
  percent: number;
  reached: boolean;
};
