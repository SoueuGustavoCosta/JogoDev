import { Link } from 'react-router-dom';
import { getActiveEvents, getEcoSolto } from '@/application/usecases';
import { eventCalendar } from '@/content/events/calendar';
import { ecoSoltoRounds } from '@/content/events/ecoSolto';
import { useServices } from '@/presentation/app/ServicesContext';
import { untilLabel } from './multiplier';
import styles from './Events.module.css';

function formatMultiplier(m: number): string {
  return `×${Number.isInteger(m) ? m : m.toFixed(1).replace('.', ',')}`;
}

/**
 * Faixa discreta com os eventos de hoje (Etapa 11), no Início e na Liga: Surto Temporal e
 * Eco Solto. A Convergência tem card próprio (`ConvergenceCard`). Sem evento, não aparece.
 */
export function EventStrip() {
  const { progressRepository } = useServices();
  const { day, active } = getActiveEvents({ calendar: eventCalendar });
  const items = active.filter((a) => a.event.kind !== 'convergencia');
  if (items.length === 0) return null;
  const eco = getEcoSolto({ repository: progressRepository }, { calendar: eventCalendar, pool: ecoSoltoRounds });

  return (
    <ul className={styles.strip} aria-label="Eventos de hoje">
      {items.map(({ event, until }) =>
        event.kind === 'surto' ? (
          <li key={event.id} className={styles.stripItem}>
            <b className={styles.stripTag}>{formatMultiplier(event.multiplier)}</b>
            <span>
              <b>{event.title}</b> — {event.description} {untilLabel(day, until)}
            </span>
          </li>
        ) : event.kind === 'eco-solto' ? (
          <li key={event.id}>
            <Link to="/evento/eco-solto" className={`${styles.stripItem} ${styles.stripEco}`}>
              <b className={styles.stripTagEco}>{eco.wonToday ? '✓' : 'hoje'}</b>
              <span>
                <b>{event.title}</b> — {eco.wonToday ? 'vencido hoje. Volte na próxima!' : event.description}
              </span>
              {eco.wonToday ? null : <span aria-hidden="true">▸</span>}
            </Link>
          </li>
        ) : null,
      )}
    </ul>
  );
}
