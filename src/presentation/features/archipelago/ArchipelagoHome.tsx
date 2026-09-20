import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrailProgress } from '@/application/usecases';
import { isTrailCompleted } from '@/domain/progress';
import { trailRegistry } from '@/content/registry';
import { Button, Card, ProgressBar } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './ArchipelagoHome.module.css';

export function ArchipelagoHome() {
  const { progressRepository, analytics } = useServices();

  useEffect(() => {
    analytics.track('page_view');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1>Arquipélago</h1>
      <p>Escolha uma ilha e comece a estudar. Todas ficam abertas — não existe ordem obrigatória.</p>
      <div className={styles.grid}>
        {trailRegistry.map((trail) => {
          const { trailProgress, xp, maxXp } = getTrailProgress({ repository: progressRepository }, { trail });
          const completed = isTrailCompleted(trail, trailProgress);
          const started = xp > 0;
          const label = completed ? 'Concluída' : started ? 'Continuar' : 'Começar';

          return (
            <Card key={trail.id}>
              <div className={styles.symbol} aria-hidden="true">
                🗄️
              </div>
              <h2>{trail.title}</h2>
              <p className={styles.tagline}>{trail.tagline}</p>
              <p className={styles.state}>
                {xp} / {maxXp} XP {completed ? '· 🏆 Troféu conquistado' : ''}
              </p>
              <ProgressBar value={xp} max={maxXp} label={`Progresso em ${trail.title}`} />
              <div style={{ marginTop: 14 }}>
                <Link to={`/trilhas/${trail.id}`}>
                  <Button>{label}</Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
