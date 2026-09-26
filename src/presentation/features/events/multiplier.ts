import { getActiveEvents } from '@/application/usecases';
import { eventCalendar } from '@/content/events/calendar';

/** Multiplicador de XP de agora (Surto Temporal do calendário), para quem grava XP. */
export function xpMultiplierNow(): number {
  return getActiveEvents({ calendar: eventCalendar }).multiplier;
}

const WEEKDAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** "só hoje", "até domingo" (na mesma semana) ou "até 31/10". */
export function untilLabel(today: string, until: string): string {
  if (until === today) return 'só hoje';
  const [y, m, d] = until.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86_400_000);
  if (days < 7) return `até ${WEEKDAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}`;
  return `até ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

/** "sexta, 09/10" para o próximo dia de um evento. */
export function dayLabel(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return `${WEEKDAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}
