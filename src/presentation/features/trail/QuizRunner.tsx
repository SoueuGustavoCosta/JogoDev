import { useState } from 'react';
import type { QuizItem } from '@/domain/trail';
import { QuizQuestion } from './QuizQuestion';
import styles from './QuizRunner.module.css';

/** Quiz no fim da página (Modo leitura): um paradoxo por vez, na ordem do módulo. */
export function QuizRunner({
  trailId,
  moduleId,
  quiz,
  onFinished,
  onAnswered,
}: {
  trailId: string;
  moduleId: string;
  quiz: QuizItem[];
  onFinished: () => void;
  /** Chamado depois de cada resposta gravada (ex.: para o cabeçalho atualizar o XP). */
  onAnswered?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const last = index + 1 >= quiz.length;

  return (
    <section className={styles.quiz} aria-label="Paradoxo do salto">
      <QuizQuestion
        key={index}
        trailId={trailId}
        moduleId={moduleId}
        quizIndex={index}
        item={quiz[index]}
        variant="inline"
        position={index + 1}
        total={quiz.length}
        nextLabel={last ? 'Acender o cristal ▸' : 'Próximo paradoxo ▸'}
        onNext={() => (last ? onFinished() : setIndex(index + 1))}
        onAnswered={onAnswered}
      />
    </section>
  );
}
