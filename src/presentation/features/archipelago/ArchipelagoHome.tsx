import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getTraveler, getTrailProgress } from '@/application/usecases';
import { trailRegistry } from '@/content/registry';
import { useServices } from '@/presentation/app/ServicesContext';
import type { MapEra } from './mapData';
import { TimeMap, type EraProgress } from './TimeMap';

/** Home do app: o Mini Mapa do Tempo. */
export function ArchipelagoHome() {
  const { progressRepository, analytics } = useServices();
  const navigate = useNavigate();

  const traveler = getTraveler({ repository: progressRepository });

  const summary = useMemo(() => {
    let xp = 0;
    let crystals = 0;
    const byEra: Record<string, EraProgress> = {};
    for (const trail of trailRegistry) {
      const view = getTrailProgress({ repository: progressRepository }, { trail });
      const done = trail.modules.filter((m) => view.trailProgress?.modules[m.id]?.completed).length;
      xp += view.xp;
      crystals += done;
      byEra[trail.id] = { done, total: trail.modules.length };
    }
    return { xp, crystals, byEra };
  }, [progressRepository]);

  useEffect(() => {
    analytics.track('page_view');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!traveler.prologueSeen) return <Navigate to="/prologo" replace />;

  const progress: Record<string, EraProgress> = {};
  if (summary.byEra['banco-de-dados']) progress.dados = summary.byEra['banco-de-dados'];

  return (
    <TimeMap
      travelerName={traveler.name}
      crystals={summary.crystals}
      xp={summary.xp}
      progress={progress}
      onEnterEra={(era: MapEra) => era.trailId && navigate(`/trilhas/${era.trailId}`)}
    />
  );
}
