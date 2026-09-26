import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { completeModule, getLessonMode, getOrCreateTravelerUuid, getTraveler } from '@/application/usecases';
import { getTrailById } from '@/content/registry';
import { badgeCatalog } from '@/content/badges/catalog';
import { DEFAULT_LESSON_MODE } from '@/config/exploration';
import { playModuleCompleteSound } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { LessonPlayer } from './LessonPlayer';
import { ModuleCompletion, type ModuleResult } from './ModuleCompletion';
import { ScrollLesson } from './ScrollLesson';
import type { TrailOutletContext } from './TrailShell';

/**
 * Um salto (módulo). Mostra a lição em telas curtas (`LessonPlayer`, padrão) ou tudo numa
 * página ("Modo leitura", `ScrollLesson`), conforme a escolha do viajante. Os dois terminam
 * no mesmo fechamento (`completeModule` + `ModuleCompletion`).
 */
export function ModulePage() {
  const { trailId, moduleId } = useParams<{ trailId: string; moduleId: string }>();
  const navigate = useNavigate();
  const { refresh } = useOutletContext<TrailOutletContext>();
  const { progressRepository, analytics, leaderboard } = useServices();
  const [result, setResult] = useState<ModuleResult | null>(null);

  const trail = trailId ? getTrailById(trailId) : undefined;
  const moduleIndex = trail?.modules.findIndex((m) => m.id === moduleId) ?? -1;
  const module = trail && moduleIndex >= 0 ? trail.modules[moduleIndex] : undefined;
  const travelerName = getTraveler({ repository: progressRepository }).name;
  const lessonMode = getLessonMode({ repository: progressRepository }, { fallback: DEFAULT_LESSON_MODE });

  useEffect(() => {
    setResult(null);
    window.scrollTo({ top: 0 });
    if (trail && module) analytics.track('module_started', { island: trail.id, module: module.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trail?.id, module?.id]);

  if (!trail || !module) return <Navigate to="/" replace />;

  function handleFinished() {
    const uuid = getOrCreateTravelerUuid({ repository: progressRepository });
    const { name } = getTraveler({ repository: progressRepository });
    const outcome = completeModule(
      { repository: progressRepository, analytics, leaderboard },
      { trail: trail!, moduleId: module!.id, traveler: { uuid, name }, badgeCatalog },
    );
    setResult({
      fresh: !outcome.alreadyCompleted,
      trailCompleted: outcome.trailCompleted,
      recap: outcome.recap,
      firstBadge: outcome.firstBadge,
    });
    if (!outcome.alreadyCompleted) playModuleCompleteSound();
    refresh();
  }

  const completion = result ? (
    <ModuleCompletion
      trail={trail}
      next={trail.modules[moduleIndex + 1]}
      result={result}
      travelerName={travelerName}
      onNavigate={navigate}
    />
  ) : null;
  const onOpenInLab = (sql: string) => navigate(`/trilhas/${trail.id}/laboratorio`, { state: { sql } });
  const Lesson = lessonMode === 'rolagem' ? ScrollLesson : LessonPlayer;

  return (
    <Lesson
      key={module.id}
      trail={trail}
      module={module}
      moduleIndex={moduleIndex}
      travelerName={travelerName}
      completion={completion}
      onFinished={handleFinished}
      onOpenInLab={onOpenInLab}
    />
  );
}
