import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import { getTraveler, getTrailProgress } from '@/application/usecases';
import { trailRegistry } from '@/content/registry';
import { isEraRestored } from '@/domain/progress';
import { useServices } from '@/presentation/app/ServicesContext';
import type { LayoutOutletContext } from '@/presentation/shell';
import { ERAS, type MapEra } from './mapData';
import { TimeMap, type EraProgress } from './TimeMap';

/** Home do app: o Mini Mapa do Tempo. */
export function ArchipelagoHome() {
  const { progressRepository, analytics } = useServices();
  const navigate = useNavigate();
  const { summary, onlinePlayers } = useOutletContext<LayoutOutletContext>();

  const traveler = getTraveler({ repository: progressRepository });

  const byEra = useMemo(() => {
    const map: Record<string, EraProgress> = {};
    for (const trail of trailRegistry) {
      const view = getTrailProgress({ repository: progressRepository }, { trail });
      const done = trail.modules.filter((m) => view.trailProgress?.modules[m.id]?.completed).length;
      map[trail.id] = { done, total: trail.modules.length, restored: isEraRestored(trail, view.trailProgress) };
    }
    return map;
  }, [progressRepository]);

  useEffect(() => {
    analytics.track('page_view');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!traveler.prologueSeen) return <Navigate to="/prologo" replace />;

  // Contador "X/Y módulos" de cada era ativa, não só a Era dos Dados: cada era aponta
  // pra sua trilha por `trailId` (ids diferentes: 'dados' → 'banco-de-dados', 'git' →
  // 'git-github'), então o mapeamento não pode ser um `byEra[era.id]` direto. As luas
  // (satélites) entram do mesmo jeito, por `sat.trailId`, para o TimeMap saber quando
  // cada uma foi restaurada (chefe vencido) e mostrar "X/Y módulos" na lua também.
  const progress: Record<string, EraProgress> = {};
  for (const era of ERAS) {
    if (era.trailId && byEra[era.trailId]) progress[era.id] = byEra[era.trailId];
    for (const sat of era.satellites ?? []) {
      if (sat.trailId && byEra[sat.trailId]) progress[sat.id] = byEra[sat.trailId];
    }
  }

  return (
    <TimeMap
      summary={summary}
      onlinePlayers={onlinePlayers}
      progress={progress}
      onEnterEra={(era: MapEra) => era.trailId && navigate(`/trilhas/${era.trailId}`)}
    />
  );
}
