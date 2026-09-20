import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getTrailProgress } from '@/application/usecases';
import { isModuleUnlocked } from '@/domain/progress';
import { SUPPORT_COPY } from '@/domain/support';
import { getTrailById } from '@/content/registry';
import { DEFAULT_EXPLORATION_MODE } from '@/config/exploration';
import { Button, ProgressBar } from '@/presentation/design-system';
import { SupportModal } from '@/presentation/features/support';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './TrailOverview.module.css';

export function TrailOverview() {
  const { trailId } = useParams<{ trailId: string }>();
  const { progressRepository, analytics } = useServices();
  const [supportOpen, setSupportOpen] = useState(false);

  const trail = trailId ? getTrailById(trailId) : undefined;

  useEffect(() => {
    if (trail) analytics.track('island_opened', { island: trail.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trail?.id]);

  if (!trail) return <Navigate to="/" replace />;

  const { trailProgress, xp, maxXp } = getTrailProgress({ repository: progressRepository }, { trail });
  const trophyAwarded = Boolean(trailProgress?.trophyAwarded);

  return (
    <div>
      <p className="eyebrow">Ilha</p>
      <h1>{trail.title}</h1>
      <p>{trail.tagline}</p>
      <ProgressBar value={xp} max={maxXp} label={`Progresso em ${trail.title}`} />
      <p>
        {xp} / {maxXp} XP
      </p>

      {trail.lab ? (
        <Link to={`/trilhas/${trail.id}/laboratorio`}>
          <Button variant="ghost">Ir para o laboratório</Button>
        </Link>
      ) : null}

      <div className={styles.list}>
        {trail.modules.map((module, index) => {
          const unlocked = isModuleUnlocked(trail, module.id, trailProgress, DEFAULT_EXPLORATION_MODE);
          const completed = Boolean(trailProgress?.modules[module.id]?.completed);
          return (
            <Link
              key={module.id}
              to={unlocked ? `/trilhas/${trail.id}/modulos/${module.id}` : '#'}
              className={`${styles.item} ${unlocked ? '' : styles.itemLocked}`}
              aria-disabled={!unlocked}
            >
              <span>
                {index + 1}. {module.short}
              </span>
              <span className={styles.badge}>{completed ? '✓ concluído' : unlocked ? module.level : '🔒'}</span>
            </Link>
          );
        })}
      </div>

      {trophyAwarded ? (
        <div className={styles.trophy}>
          <p>🏆 Troféu da ilha conquistado!</p>
          <p>
            {SUPPORT_COPY.trophyInvite}{' '}
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Colabore com o projeto
            </button>
          </p>
        </div>
      ) : null}

      {supportOpen ? <SupportModal onClose={() => setSupportOpen(false)} /> : null}
    </div>
  );
}
