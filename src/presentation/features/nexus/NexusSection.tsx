import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNexus, markNexusPlayed } from '@/application/usecases';
import { nexusForIsland } from '@/domain/nexus';
import type { Trail } from '@/domain/trail';
import { nexusEvents } from '@/content/nexus';
import { trailRegistry } from '@/content/registry';
import { useServices } from '@/presentation/app/ServicesContext';
import { NexusScene } from './NexusScene';

/** Ramificações na tela de uma lua de linguagem (só quando a lua tem um Evento Nexus). */
export function NexusSection({ trail }: { trail: Trail }) {
  const { progressRepository, analytics } = useServices();
  const navigate = useNavigate();
  const event = nexusForIsland(nexusEvents, trail.id);
  // Lido uma vez: marcar a cena como vista não pode interromper a animação desta visita.
  const [view] = useState(() => (event ? getNexus({ repository: progressRepository }, { event, trails: trailRegistry }) : null));
  const onPlayed = useMemo(
    () => () => markNexusPlayed({ repository: progressRepository, analytics }, { island: trail.id }),
    [progressRepository, analytics, trail.id],
  );
  if (!event || !view) return null;

  return (
    <NexusScene
      islandName={trail.title.replace(/^Lua de /, '')}
      islandColor={trail.accent}
      bossName={trail.bossFight?.bossName}
      state={view.state}
      branches={view.branches}
      play={view.play}
      onPlayed={onPlayed}
      onEnter={(id) => navigate(`/trilhas/${id}`)}
    />
  );
}
