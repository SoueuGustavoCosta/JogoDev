import { useReducer, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getTrailProgress } from '@/application/usecases';
import { xpForModule } from '@/domain/progress';
import type { Module, Trail } from '@/domain/trail';
import { BlockRenderer } from '@/presentation/blocks';
import { SintaxeFace } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { QuizRunner } from './QuizRunner';
import { useModuleLeftTracking } from './useModuleLeftTracking';
import styles from './ModulePage.module.css';

/**
 * "Modo leitura": o salto inteiro numa página só, com o quiz no fim (o formato de antes das
 * telas curtas, escolhido em Viajante → Modo leitura). `completion` substitui o quiz depois
 * que o salto é concluído.
 */
export function ScrollLesson({
  trail,
  module,
  moduleIndex,
  travelerName,
  completion,
  onFinished,
  onOpenInLab,
}: {
  trail: Trail;
  module: Module;
  moduleIndex: number;
  travelerName: string;
  completion: ReactNode;
  onFinished: () => void;
  onOpenInLab: (sql: string) => void;
}) {
  const { progressRepository } = useServices();
  // Relê o progresso depois de cada resposta, para o XP do cabeçalho acompanhar o quiz.
  const [, bumpXp] = useReducer((n: number) => n + 1, 0);
  const articleRef = useRef<HTMLElement>(null);
  useModuleLeftTracking(articleRef, trail.id, module.id);

  const { trailProgress } = getTrailProgress({ repository: progressRepository }, { trail });
  const moduleXp = xpForModule(module, trailProgress?.modules[module.id]);

  return (
    <article ref={articleRef}>
      {/* Cabeçalho compacto, uma linha só: o conteúdo começa logo no topo da tela. */}
      <header className={styles.bar}>
        <Link to={`/trilhas/${trail.id}`} className={styles.barBack} aria-label={`Voltar para ${trail.title}`}>
          ◂
        </Link>
        <span className={styles.barTitle}>
          <span className={styles.barStep}>
            {moduleIndex + 1}/{trail.modules.length}
          </span>{' '}
          {module.short}
        </span>
        <span className={styles.barXp} aria-label={`${moduleXp} XP neste salto`}>
          {moduleXp} XP
        </span>
      </header>
      <h1>{module.title}</h1>
      <p className={styles.lead}>{module.lead}</p>

      <div className={styles.sintaxe}>
        <SintaxeFace size={44} />
        <p>
          <b>Senhorita Sintaxe</b> · Bora, {travelerName}. Cada bloco é curtinho e no fim tem um paradoxo pra
          resolver.
        </p>
      </div>

      {module.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} travelerName={travelerName} onOpenInLab={onOpenInLab} />
      ))}

      {completion ?? (
        <QuizRunner
          key={module.id}
          trailId={trail.id}
          moduleId={module.id}
          quiz={module.quiz}
          onFinished={onFinished}
          onAnswered={bumpXp}
        />
      )}
    </article>
  );
}
