import { useParams } from 'react-router-dom';
import { getTrailById } from '@/content/registry';
import { GitLabPage } from './GitLabPage';
import { SqlLabPage } from './SqlLabPage';

/**
 * Ponto de entrada da rota `trilhas/:trailId/laboratorio`: cada trilha tem no máximo
 * um tipo de laboratório (`trail.lab`), e esta página só decide qual motor renderizar.
 * Nenhuma regra de negócio vive aqui — cada laboratório cuida da própria.
 */
export function LabPage() {
  const { trailId } = useParams<{ trailId: string }>();
  const trail = trailId ? getTrailById(trailId) : undefined;
  if (!trail) return null;

  if (trail.lab === 'git') return <GitLabPage trail={trail} />;
  return <SqlLabPage trail={trail} />;
}
