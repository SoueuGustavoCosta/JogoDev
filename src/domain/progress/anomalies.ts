import type { AnomalyResult, Progress } from './types';

/** XP ganho em Anomalias do Dia (soma do histórico). */
export function anomalyXpTotal(progress: Progress): number {
  return Object.values(progress.anomalies ?? {}).reduce((sum, r) => sum + (r?.xp ?? 0), 0);
}

/** Fragmentos Temporais ganhos (soma do histórico de ganhos; gastos entram na Etapa 9). */
export function fragmentsEarned(progress: Progress): number {
  return Object.values(progress.anomalies ?? {}).reduce((sum, r) => sum + (r?.fragments ?? 0), 0);
}

/**
 * Registra a anomalia do dia como consertada. Idempotente: se o dia já tem registro, nada
 * muda (a recompensa é uma por dia) e devolve `added: false`.
 */
export function recordAnomaly(
  progress: Progress,
  day: string,
  result: AnomalyResult,
): { progress: Progress; added: boolean } {
  if (progress.anomalies?.[day]) return { progress, added: false };
  return { progress: { ...progress, anomalies: { ...progress.anomalies, [day]: result } }, added: true };
}

/** Por dia, fica o registro consertado primeiro (é o que valeu a recompensa). */
export function mergeAnomalies(
  a: Record<string, AnomalyResult> | undefined,
  b: Record<string, AnomalyResult> | undefined,
): Record<string, AnomalyResult> | undefined {
  if (!a || !b) return a ?? b;
  const out: Record<string, AnomalyResult> = { ...b, ...a };
  for (const [day, rb] of Object.entries(b)) {
    const ra = a[day];
    if (ra && rb.solvedAt < ra.solvedAt) out[day] = rb;
  }
  return out;
}
