import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { completeModule } from '@/application/usecases';
import { getTrailById } from '@/content/registry';
import { BlockRenderer } from '@/presentation/blocks';
import { Button } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { QuizRunner } from './QuizRunner';

export function ModulePage() {
  const { trailId, moduleId } = useParams<{ trailId: string; moduleId: string }>();
  const navigate = useNavigate();
  const { progressRepository, analytics } = useServices();
  const [finished, setFinished] = useState(false);

  const trail = trailId ? getTrailById(trailId) : undefined;
  const moduleIndex = trail?.modules.findIndex((m) => m.id === moduleId) ?? -1;
  const module = moduleIndex !== undefined && moduleIndex >= 0 ? trail?.modules[moduleIndex] : undefined;

  useEffect(() => {
    if (trail && module) analytics.track('module_started', { island: trail.id, module: module.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trail?.id, module?.id]);

  if (!trail || !module) return <Navigate to="/" replace />;

  function handleFinished() {
    completeModule({ repository: progressRepository, analytics }, { trail: trail!, moduleId: module!.id });
    setFinished(true);
  }

  function goNext() {
    const nextModule = trail!.modules[moduleIndex + 1];
    if (nextModule) navigate(`/trilhas/${trail!.id}/modulos/${nextModule.id}`);
    else navigate(`/trilhas/${trail!.id}`);
  }

  function openInLab(sql: string) {
    navigate(`/trilhas/${trail!.id}/laboratorio`, { state: { sql } });
  }

  return (
    <article>
      <p className="eyebrow">{module.level}</p>
      <h1>{module.title}</h1>
      <p>{module.lead}</p>

      {module.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} onOpenInLab={openInLab} />
      ))}

      {!finished ? (
        <QuizRunner trailId={trail.id} moduleId={module.id} quiz={module.quiz} onFinished={handleFinished} />
      ) : (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p>
            <strong>Módulo concluído.</strong> Você já passou por aqui e o XP foi contabilizado.
          </p>
          <Button onClick={goNext}>
            {trail.modules[moduleIndex + 1] ? 'Próximo módulo' : 'Voltar para a ilha'}
          </Button>
        </div>
      )}
    </article>
  );
}
