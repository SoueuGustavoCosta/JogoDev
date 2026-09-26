import { anomalyDay, msUntilNextAnomaly } from '../anomaly';

/**
 * Semana da Liga dos Viajantes (Etapa 10): começa segunda 00:00 e termina domingo 23:59,
 * no fuso America/Sao_Paulo (o mesmo da Anomalia do Dia). Identificada pela data da
 * segunda-feira (AAAA-MM-DD), igual à função `semana_atual()` do Supabase.
 */
export function leagueWeekOfDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const isoDow = date.getUTCDay() || 7; // segunda = 1 ... domingo = 7
  date.setUTCDate(date.getUTCDate() - (isoDow - 1));
  return date.toISOString().slice(0, 10);
}

export function leagueWeek(now: Date): string {
  return leagueWeekOfDay(anomalyDay(now));
}

/** A segunda-feira da semana anterior. */
export function previousLeagueWeek(week: string): string {
  const [y, m, d] = week.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d - 7)).toISOString().slice(0, 10);
}

/** Milissegundos até a Liga zerar (próxima segunda 00:00 de São Paulo). */
export function msUntilLeagueReset(now: Date): number {
  const week = leagueWeek(now);
  let t = now.getTime();
  // Pula de meia-noite em meia-noite (no máximo 7 vezes) até a semana mudar.
  for (let i = 0; i < 8 && leagueWeek(new Date(t)) === week; i++) t += msUntilNextAnomaly(new Date(t));
  return Math.max(0, t - now.getTime());
}
