import { ANOMALY_EPOCH, ANOMALY_NO_REPEAT_DAYS, ANOMALY_TIME_ZONE, type Anomaly } from './types';

/** Dia (AAAA-MM-DD) de um instante no fuso de São Paulo: é esse dia que decide a anomalia. */
export function anomalyDay(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ANOMALY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Milissegundos até a próxima meia-noite de São Paulo (quando a anomalia troca). */
export function msUntilNextAnomaly(now: Date): number {
  const today = anomalyDay(now);
  // Avança de hora em hora até o dia mudar e depois volta por minuto: robusto a horário de verão.
  let t = now.getTime();
  const hour = 3_600_000;
  while (anomalyDay(new Date(t)) === today) t += hour;
  t -= hour;
  while (anomalyDay(new Date(t)) === today) t += 60_000;
  return Math.max(0, t - now.getTime());
}

function dayIndex(dayISO: string): number {
  const [y, m, d] = dayISO.split('-').map(Number);
  const [ey, em, ed] = ANOMALY_EPOCH.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)) / 86_400_000);
}

/** Número da anomalia do dia (a do dia do ANOMALY_EPOCH é a #1). */
export function anomalyNumber(dayISO: string): number {
  return Math.max(1, dayIndex(dayISO) + 1);
}

/** Hash inteiro estável (FNV-1a) para o sorteio determinístico. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * A anomalia do dia, igual para todo mundo: sorteio determinístico pela data, dia a dia
 * desde o ANOMALY_EPOCH, sem repetir nenhuma dos últimos ANOMALY_NO_REPEAT_DAYS - 1 dias.
 * Depende só da data e da lista (ordenada por id), nunca do jogador.
 */
export function globalAnomalyForDay(dayISO: string, pool: readonly Anomaly[]): Anomaly {
  if (pool.length === 0) throw new Error('Nenhuma anomalia cadastrada');
  const sorted = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  const target = dayIndex(dayISO);
  if (target < 0) return sorted[hash(dayISO) % sorted.length];
  const memory = Math.min(ANOMALY_NO_REPEAT_DAYS - 1, sorted.length - 1);
  const recent: string[] = [];
  let pick = sorted[0];
  for (let d = 0; d <= target; d++) {
    const candidates = sorted.filter((a) => !recent.includes(a.id));
    pick = candidates[hash(`anomalia:${d}`) % candidates.length];
    recent.push(pick.id);
    if (recent.length > memory) recent.shift();
  }
  return pick;
}

export type DailyAnomalyPick = {
  anomaly: Anomaly;
  /** true quando o viajante recebeu a reserva de nível Base (ver `pickAnomaly`). */
  fallback: boolean;
};

/**
 * A anomalia do dia para um viajante. Anomalias de eras que ele ainda não abriu são
 * permitidas, mas só de nível "Base": se a do dia for de outro nível numa era que ele não
 * abriu, ele recebe a reserva Base do dia (também igual para todos nessa situação).
 */
export function pickAnomaly(dayISO: string, pool: readonly Anomaly[], openedEras: ReadonlySet<string>): DailyAnomalyPick {
  const anomaly = globalAnomalyForDay(dayISO, pool);
  if (anomaly.level === 'Base' || openedEras.has(anomaly.era)) return { anomaly, fallback: false };
  const base = pool.filter((a) => a.level === 'Base').sort((a, b) => a.id.localeCompare(b.id));
  if (base.length === 0) return { anomaly, fallback: false };
  return { anomaly: base[hash(`reserva:${dayISO}`) % base.length], fallback: true };
}
