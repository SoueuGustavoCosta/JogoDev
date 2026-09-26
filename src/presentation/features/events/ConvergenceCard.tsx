import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActiveConvergence, getActiveEvents, loadConvergence, type ConvergenceView } from '@/application/usecases';
import { eventCalendar } from '@/content/events/calendar';
import { useServices } from '@/presentation/app/ServicesContext';
import { untilLabel } from './multiplier';
import styles from './Events.module.css';

/**
 * Card da Convergência (Etapa 11): a meta da turma no período, com a contagem do Supabase.
 * Batida a meta, o cosmético fica liberado para todos (e aparece na Loja). Sem Convergência
 * ativa, não aparece. Sem rede, mostra a meta sem a contagem.
 */
export function ConvergenceCard({ onUnlocked }: { onUnlocked?: () => void }) {
  const { progressRepository, leaderboard, analytics } = useServices();
  const active = useMemo(() => getActiveConvergence({ calendar: eventCalendar }), []);
  const [view, setView] = useState<ConvergenceView | null>(null);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    void loadConvergence({ repository: progressRepository, leaderboard, analytics }, { active }).then((v) => {
      if (!alive || !v) return;
      setView(v);
      if (v.unlocked) onUnlocked?.();
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.event.id]);

  if (!active || active.event.kind !== 'convergencia') return null;
  const event = active.event;
  const progress = view?.progress;
  const today = getActiveEvents({ calendar: eventCalendar }).day;

  return (
    <section className={styles.convergence} aria-labelledby="convergencia-titulo">
      <div className={styles.convergenceHead}>
        <h2 id="convergencia-titulo">{event.title}</h2>
        <span className={styles.convergenceUntil}>{untilLabel(today, active.until)}</span>
      </div>
      <p className={styles.convergenceText}>{event.description}</p>
      <div
        className={styles.meter}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={event.target}
        aria-valuenow={progress?.count ?? undefined}
        aria-label="Anomalias consertadas pela turma"
      >
        <i style={{ width: `${progress?.percent ?? 0}%` }} />
      </div>
      <p className={styles.convergenceCount}>
        {progress && progress.count !== null ? `${Math.min(progress.count, event.target)} / ${event.target}` : `meta: ${event.target} · contagem indisponível agora`}
      </p>
      {view?.unlocked ? (
        <p className={styles.convergenceDone}>
          Meta batida! O prêmio já está liberado na sua <Link to="/configuracoes/loja">Loja do Viajante</Link>.
        </p>
      ) : null}
    </section>
  );
}
