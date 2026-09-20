import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { getTrailProgress } from '@/application/usecases';
import { getTrailById } from '@/content/registry';
import { DEFAULT_EXPLORATION_MODE } from '@/config/exploration';
import { isModuleUnlocked } from '@/domain/progress';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './TrailShell.module.css';

export type TrailOutletContext = { refresh: () => void };

/** Moldura de uma ilha: trilha de fases numerada (rail) + conteúdo da rota. */
export function TrailShell() {
  const { trailId, moduleId } = useParams<{ trailId: string; moduleId?: string }>();
  const { progressRepository } = useServices();
  const location = useLocation();
  const [, setTick] = useState(0);

  const trail = trailId ? getTrailById(trailId) : undefined;
  if (!trail) return <Navigate to="/" replace />;

  const { trailProgress } = getTrailProgress({ repository: progressRepository }, { trail });
  const firstOpen = trail.modules.findIndex((m) => !trailProgress?.modules[m.id]?.completed);
  const allDone = firstOpen === -1;
  const onLab = location.pathname.endsWith('/laboratorio');

  return (
    <div className={styles.layout}>
      <nav className={styles.rail} aria-label="Fases da ilha">
        <Link to={`/trilhas/${trail.id}`} className={`${styles.node} ${!moduleId && !onLab ? styles.sel : ''}`}>
          <span className={styles.dot}>◈</span>
          <span className={styles.label}>Início da era</span>
        </Link>
        {trail.modules.map((module, index) => {
          const done = Boolean(trailProgress?.modules[module.id]?.completed);
          const unlocked = isModuleUnlocked(trail, module.id, trailProgress, DEFAULT_EXPLORATION_MODE);
          const isCurrent = index === firstOpen;
          const classes = [
            styles.node,
            done ? styles.done : '',
            isCurrent ? styles.cur : '',
            !unlocked ? styles.lock : '',
            moduleId === module.id ? styles.sel : '',
          ].join(' ');
          const content = (
            <>
              <span className={styles.dot}>{done ? '✓' : index + 1}</span>
              <span className={styles.label}>{module.short}</span>
            </>
          );
          return unlocked ? (
            <Link key={module.id} to={`/trilhas/${trail.id}/modulos/${module.id}`} className={classes}>
              {content}
            </Link>
          ) : (
            <span key={module.id} className={classes} aria-disabled="true">
              {content}
            </span>
          );
        })}
        <span
          className={`${styles.node} ${styles.trophy} ${trailProgress?.trophyAwarded ? styles.done : ''} ${allDone ? '' : styles.lock}`}
          aria-disabled={!allDone}
        >
          <span className={styles.dot}>🏆</span>
          <span className={styles.label}>Artefato da era</span>
        </span>
      </nav>
      <section className={styles.content}>
        <Outlet context={{ refresh: () => setTick((t) => t + 1) } satisfies TrailOutletContext} />
      </section>
    </div>
  );
}
