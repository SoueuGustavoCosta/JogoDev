import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { completeModule } from '@/application/usecases';
import { getTrailById } from '@/content/registry';
import { XP_MODULE_COMPLETION_BONUS } from '@/domain/progress';
import { BlockRenderer } from '@/presentation/blocks';
import { Confetti, SintaxeFace } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { QuizRunner } from './QuizRunner';
import type { TrailOutletContext } from './TrailShell';
import styles from './ModulePage.module.css';

export function ModulePage() {
  const { trailId, moduleId } = useParams<{ trailId: string; moduleId: string }>();
  const navigate = useNavigate();
  const { refresh } = useOutletContext<TrailOutletContext>();
  const { progressRepository, analytics } = useServices();
  const [result, setResult] = useState<{ fresh: boolean; trailCompleted: boolean } | null>(null);

  const trail = trailId ? getTrailById(trailId) : undefined;
  const moduleIndex = trail?.modules.findIndex((m) => m.id === moduleId) ?? -1;
  const module = trail && moduleIndex >= 0 ? trail.modules[moduleIndex] : undefined;

  useEffect(() => {
    setResult(null);
    window.scrollTo({ top: 0 });
    if (trail && module) analytics.track('module_started', { island: trail.id, module: module.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trail?.id, module?.id]);

  if (!trail || !module) return <Navigate to="/" replace />;

  function handleFinished() {
    const outcome = completeModule(
      { repository: progressRepository, analytics },
      { trail: trail!, moduleId: module!.id },
    );
    setResult({ fresh: !outcome.alreadyCompleted, trailCompleted: outcome.trailCompleted });
    refresh();
  }

  const next = trail.modules[moduleIndex + 1];

  return (
    <article>
      <p className="eyebrow">
        Salto {moduleIndex + 1} de {trail.modules.length} · {module.level}
      </p>
      <h1>{module.title}</h1>
      <p className={styles.lead}>{module.lead}</p>

      <div className={styles.sintaxe}>
        <SintaxeFace size={44} />
        <p>
          <b>Senhorita Sintaxe</b> · Toda lição parte de um problema real. Leia com calma; quando estiver pronto, o
          paradoxo no fim destrava o próximo salto.
        </p>
      </div>

      {module.blocks.map((block, i) => (
        <BlockRenderer
          key={i}
          block={block}
          onOpenInLab={(sql) => navigate(`/trilhas/${trail.id}/laboratorio`, { state: { sql } })}
        />
      ))}

      {result ? (
        <div className={styles.done}>
          {result.fresh ? <Confetti /> : null}
          <p>
            <b>Cristal aceso!</b>{' '}
            {result.fresh
              ? `Salto concluído: +${XP_MODULE_COMPLETION_BONUS} XP.`
              : 'Você já passou por aqui e o XP foi contabilizado.'}
          </p>
          {next ? (
            <button type="button" className={styles.next} onClick={() => navigate(`/trilhas/${trail.id}/modulos/${next.id}`)}>
              Saltar para o próximo ano ▸
            </button>
          ) : (
            <button type="button" className={styles.next} onClick={() => navigate(`/trilhas/${trail.id}`)}>
              {result.trailCompleted ? 'Ver o artefato da era ▸' : 'Voltar ao início da era ▸'}
            </button>
          )}
        </div>
      ) : (
        <QuizRunner key={module.id} trailId={trail.id} moduleId={module.id} quiz={module.quiz} onFinished={handleFinished} />
      )}
    </article>
  );
}
