import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { getLessonMode, getMyBadges, getTrailProgress } from '@/application/usecases';
import { getTrailById } from '@/content/registry';
import { badgeCatalog, BADGE_TRAIL_TO_TRAIL_ID } from '@/content/badges/catalog';
import { DEFAULT_EXPLORATION_MODE, DEFAULT_LESSON_MODE } from '@/config/exploration';
import { isModuleUnlocked } from '@/domain/progress';
import { BadgeMedal, Modal } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './TrailShell.module.css';

export type TrailOutletContext = { refresh: () => void };

/** Moldura de uma ilha: trilha de fases numerada (rail) + conteúdo da rota. */
export function TrailShell() {
  const { trailId, moduleId } = useParams<{ trailId: string; moduleId?: string }>();
  const { progressRepository } = useServices();
  const location = useLocation();
  const [, setTick] = useState(0);
  const [badgesOpen, setBadgesOpen] = useState(false);

  const trail = trailId ? getTrailById(trailId) : undefined;
  if (!trail) return <Navigate to="/" replace />;

  const { trailProgress } = getTrailProgress({ repository: progressRepository }, { trail });
  const firstOpen = trail.modules.findIndex((m) => !trailProgress?.modules[m.id]?.completed);
  const allDone = firstOpen === -1;
  const onLab = location.pathname.endsWith('/laboratorio');
  const onBoss = location.pathname.endsWith('/chefe');

  const myBadges = getMyBadges({ repository: progressRepository });
  const trailBadges = badgeCatalog.filter((b) => BADGE_TRAIL_TO_TRAIL_ID[b.trail] === trail.id);
  const badgesEarnedCount = trailBadges.filter((b) => Boolean(myBadges[b.id])).length;
  const bossDefeated = Boolean(trailProgress?.bossDefeated);

  // Lição em telas curtas ocupa a tela toda: sem a lista de fases ao lado (nem no desktop).
  if (moduleId && getLessonMode({ repository: progressRepository }, { fallback: DEFAULT_LESSON_MODE }) === 'telas') {
    return <Outlet context={{ refresh: () => setTick((t) => t + 1) } satisfies TrailOutletContext} />;
  }

  return (
    <div className={styles.layout}>
      <nav className={`${styles.rail} ${moduleId ? styles.railInModule : ''}`} aria-label="Fases da era">
        <Link to={`/trilhas/${trail.id}`} className={`${styles.node} ${!moduleId && !onLab && !onBoss ? styles.sel : ''}`}>
          <span className={styles.dot}>◈</span>
          <span className={styles.label}>Início da era</span>
        </Link>
        {trailBadges.length ? (
          <button type="button" className={styles.node} onClick={() => setBadgesOpen(true)}>
            <span className={styles.dot}>★</span>
            <span className={styles.label}>
              Coleção de insígnias ({badgesEarnedCount}/{trailBadges.length})
            </span>
          </button>
        ) : null}
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
        {trail.bossFight ? (
          allDone ? (
            <Link
              to={`/trilhas/${trail.id}/chefe`}
              className={`${styles.node} ${styles.trophy} ${bossDefeated ? styles.done : ''} ${onBoss ? styles.sel : ''}`}
            >
              <span className={styles.dot}>☠</span>
              <span className={styles.label}>Chefe: {trail.bossFight.bossName}</span>
            </Link>
          ) : (
            <span className={`${styles.node} ${styles.trophy} ${styles.lock}`} aria-disabled="true">
              <span className={styles.dot}>☠</span>
              <span className={styles.label}>Chefe: {trail.bossFight.bossName}</span>
            </span>
          )
        ) : null}
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

      {badgesOpen ? (
        <Modal title={`Insígnias — ${trail.title}`} onClose={() => setBadgesOpen(false)}>
          <h2 className={styles.badgesTitle}>
            {trail.title} · {badgesEarnedCount}/{trailBadges.length}
          </h2>
          <div className={styles.badgesGrid}>
            {trailBadges.map((badge) => (
              <BadgeMedal key={badge.id} badge={badge} earned={Boolean(myBadges[badge.id])} size={84} />
            ))}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
