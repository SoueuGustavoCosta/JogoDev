import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { countAnomalySolvers, getContinueLesson, getDailyAnomaly, getTimeline, getTraveler } from '@/application/usecases';
import { anomalies } from '@/content/anomalies';
import { trailRegistry } from '@/content/registry';
import { TimelineNodes } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { ConvergenceCard, EventStrip } from '@/presentation/features/events';
import { xpMultiplierNow } from '@/presentation/features/events/multiplier';
import styles from './HomePage.module.css';

function closesIn(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `fecha em ${hours}h`;
  return `fecha em ${Math.max(1, Math.ceil(ms / 60_000))} min`;
}

function eraName(id: string): string {
  const title = trailRegistry.find((t) => t.id === id)?.title ?? id;
  return title.toLowerCase();
}

/** Tela Início (Etapa 7): a Anomalia do Dia no topo e o "Continuar de onde parou". */
export function HomePage() {
  const { progressRepository, leaderboard, analytics } = useServices();
  const traveler = getTraveler({ repository: progressRepository });
  const daily = useMemo(
    () => getDailyAnomaly({ repository: progressRepository }, { pool: anomalies, xpMultiplier: xpMultiplierNow() }),
    [progressRepository],
  );
  const next = useMemo(() => getContinueLesson({ repository: progressRepository }, { trails: trailRegistry }), [progressRepository]);
  const timeline = useMemo(() => getTimeline({ repository: progressRepository }), [progressRepository]);
  const [solvers, setSolvers] = useState<number | null>(null);

  useEffect(() => {
    analytics.track('page_view');
    let alive = true;
    void countAnomalySolvers({ leaderboard }, daily.day).then((n) => alive && setSolvers(n));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daily.day]);

  if (!traveler.prologueSeen) return <Navigate to="/prologo" replace />;

  const { anomaly, solved } = daily;

  return (
    <div className={styles.root}>
      <section className={styles.timeline} aria-labelledby="linha-titulo">
        <div className={styles.timelineHead}>
          <h2 id="linha-titulo">Linha do tempo</h2>
          <span>
            {timeline.state.current === 1 ? '1 dia estável' : `${timeline.state.current} dias estável`}
            {timeline.state.anchors > 0 ? ` · ${timeline.state.anchors} ⚓` : ''}
          </span>
        </div>
        <TimelineNodes nodes={timeline.week} />
      </section>

      <section className={`${styles.anomaly} ${solved ? styles.anomalySolved : ''}`} aria-labelledby="anomalia-titulo">
        <div className={styles.eyebrow}>
          <span>
            anomalia #{daily.number} · {eraName(anomaly.era)}
          </span>
          <span className={styles.closes}>{solved ? 'consertada ✓' : closesIn(daily.closesInMs)}</span>
        </div>
        <h1 id="anomalia-titulo" className={styles.title}>
          {anomaly.title}
        </h1>
        <p className={styles.story}>{anomaly.story}</p>
        <div className={styles.chips}>
          <span className={styles.chip}>3 min</span>
          <span className={`${styles.chip} ${styles.chipXp}`}>+{daily.reward.xp} XP</span>
          <span className={`${styles.chip} ${styles.chipFragment}`}>+{daily.reward.fragments} ◆</span>
        </div>
        {solved ? (
          <p className={styles.done}>Linha estável por hoje. Amanhã surge outra anomalia.</p>
        ) : (
          <Link to="/anomalia" className={styles.cta}>
            Consertar a anomalia
          </Link>
        )}
        {solvers !== null ? (
          <p className={styles.solvers}>
            {solvers === 0
              ? 'Ninguém da turma consertou ainda. Seja a primeira pessoa!'
              : `${solvers} ${solvers === 1 ? 'viajante da turma já consertou' : 'viajantes da turma já consertaram'}`}
          </p>
        ) : null}
      </section>

      {next ? (
        <Link to={`/trilhas/${next.trailId}/modulos/${next.moduleId}`} className={styles.continue}>
          <span className={styles.continueIcon} aria-hidden="true">
            ▸
          </span>
          <span className={styles.continueText}>
            <b>Continuar: {next.moduleTitle}</b>
            <span>
              {next.trailTitle} · tela {next.screen} de {next.screens}
            </span>
            <span className={styles.bar} aria-hidden="true">
              <i style={{ width: `${Math.round((next.screen / next.screens) * 100)}%` }} />
            </span>
          </span>
        </Link>
      ) : (
        <Link to="/mapa" className={styles.continue}>
          <span className={styles.continueIcon} aria-hidden="true">
            ▸
          </span>
          <span className={styles.continueText}>
            <b>Escolha uma era no mapa</b>
            <span>Comece pela Era da Lógica, se não souber por onde.</span>
          </span>
        </Link>
      )}

      <Link to="/oficina" className={styles.continue}>
        <span className={`${styles.continueIcon} ${styles.workshopIcon}`} aria-hidden="true">
          {'{ }'}
        </span>
        <span className={styles.continueText}>
          <b>Oficina do Viajante</b>
          <span>Mini projetos para resolver do seu jeito, em PHP ou JS.</span>
        </span>
      </Link>

      <EventStrip />
      <ConvergenceCard />
    </div>
  );
}
