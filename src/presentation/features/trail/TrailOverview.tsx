import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getTrailProgress } from '@/application/usecases';
import { maxXpForTrail } from '@/domain/progress';
import { SUPPORT_COPY } from '@/domain/support';
import { getTrailById } from '@/content/registry';
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

  const { trailProgress, xp } = getTrailProgress({ repository: progressRepository }, { trail });
  const firstOpen = trail.modules.find((m) => !trailProgress?.modules[m.id]?.completed);
  const started = xp > 0 || Object.keys(trailProgress?.modules ?? {}).length > 0;
  const trophy = Boolean(trailProgress?.trophyAwarded);
  const quizCount = trail.modules.reduce((sum, m) => sum + m.quiz.length, 0);

  return (
    <article className={styles.hero}>
      <p className="eyebrow">Era 1 · 1963 → hoje</p>
      <h1>
        <em>{trail.title}</em>
      </h1>
      <p className={styles.lead}>{trail.tagline}</p>

      <div className={styles.row}>
        {firstOpen ? (
          <Link to={`/trilhas/${trail.id}/modulos/${firstOpen.id}`} className={styles.primary}>
            {started ? 'Continuar a viagem' : 'Começar a viagem'} ▸
          </Link>
        ) : null}
        {trail.lab ? (
          <Link to={`/trilhas/${trail.id}/laboratorio`} className={styles.ghost}>
            Máquina do Tempo
          </Link>
        ) : null}
      </div>

      <div className={styles.facts}>
        <span>
          <b>{trail.modules.length}</b>saltos
        </span>
        <span>
          <b>{quizCount}</b>paradoxos
        </span>
        <span>
          <b>{trail.missions?.length ?? 0}</b>missões práticas
        </span>
        <span>
          <b>{maxXpForTrail(trail)}</b>XP no total
        </span>
      </div>

      <div className={styles.how}>
        <div>
          <b>1 · Salte no tempo</b>
          <span>Cada salto parte de um problema real da época e chega na solução que usamos hoje.</span>
        </div>
        <div>
          <b>2 · Resolva o paradoxo</b>
          <span>Errar nunca é punição: é o Eco ganhando uma rodada, e a dica te mostra o caminho.</span>
        </div>
        <div>
          <b>3 · Acenda o cristal</b>
          <span>Cada salto concluído vira um cristal. Pratique de verdade na Máquina do Tempo.</span>
        </div>
      </div>

      {trophy ? (
        <div className={styles.trophy}>
          <div className={styles.trophyIcon} aria-hidden="true">
            🏆
          </div>
          <h2>Artefato da era conquistado!</h2>
          <p>
            {SUPPORT_COPY.trophyInvite}{' '}
            <button type="button" className={styles.link} onClick={() => setSupportOpen(true)}>
              {SUPPORT_COPY.footerLinkLabel}
            </button>
          </p>
        </div>
      ) : null}

      {supportOpen ? <SupportModal onClose={() => setSupportOpen(false)} /> : null}
    </article>
  );
}
