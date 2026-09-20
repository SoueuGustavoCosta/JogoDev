import { useState } from 'react';
import { answerQuiz } from '@/application/usecases';
import type { QuizAnswer } from '@/domain/progress';
import type { QuizItem } from '@/domain/trail';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './QuizRunner.module.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Um paradoxo por vez. Errar nunca penaliza: a opção errada apaga e o aluno tenta outra. */
export function QuizRunner({
  trailId,
  moduleId,
  quiz,
  onFinished,
}: {
  trailId: string;
  moduleId: string;
  quiz: QuizItem[];
  onFinished: () => void;
}) {
  const { progressRepository, analytics } = useServices();
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [fillValue, setFillValue] = useState('');
  const [fillWrong, setFillWrong] = useState(false);
  const [solved, setSolved] = useState<number | 'fill' | null>(null);

  const item = quiz[index];
  const isFill = 'fill' in item;

  function submit(answer: QuizAnswer, choiceIndex?: number) {
    const result = answerQuiz(
      { repository: progressRepository, analytics },
      { trailId, moduleId, quizIndex: index, item, answer },
    );
    if (result.correct) {
      setSolved(choiceIndex ?? 'fill');
      setFillWrong(false);
    } else if (choiceIndex !== undefined) {
      setWrong((w) => [...w, choiceIndex]);
    } else {
      setFillWrong(true);
    }
  }

  function next() {
    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      setWrong([]);
      setFillValue('');
      setFillWrong(false);
      setSolved(null);
    } else {
      onFinished();
    }
  }

  const isSolved = solved !== null;

  return (
    <section className={styles.quiz} aria-label="Paradoxo do salto">
      <div className={styles.box}>
        <div className={styles.top}>
          <span>
            Paradoxo {index + 1} de {quiz.length}
          </span>
          <span>{quiz.length - index - (isSolved ? 1 : 0)} restantes</span>
        </div>
        <p className={styles.question}>{item.q}</p>

        {isFill ? (
          <>
            <form
              className={styles.fillRow}
              onSubmit={(e) => {
                e.preventDefault();
                if (!isSolved && fillValue.trim()) submit({ kind: 'fill', text: fillValue });
              }}
            >
              <span>{item.pre}</span>
              <input
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                placeholder={item.placeholder ?? '?'}
                disabled={isSolved}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Sua resposta"
              />
              <span>{item.post}</span>
              {!isSolved ? (
                <button type="submit" className={styles.check} disabled={!fillValue.trim()}>
                  Verificar
                </button>
              ) : null}
            </form>
          </>
        ) : (
          <div className={styles.opts}>
            {item.options.map((option, i) => {
              const ok = solved === i;
              const no = wrong.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  className={`${styles.opt} ${ok ? styles.ok : ''} ${no ? styles.no : ''}`}
                  disabled={isSolved || no}
                  onClick={() => submit({ kind: 'choice', optionIndex: i }, i)}
                >
                  <b>{LETTERS[i]}</b>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {fillWrong || wrong.length > 0 ? (
          !isSolved ? (
            <div className={`${styles.fb} ${styles.bad}`} role="status">
              Ainda não, tente outra opção.
            </div>
          ) : null
        ) : null}

        {isSolved ? (
          <>
            <div className={`${styles.fb} ${styles.good}`} role="status">
              <b>Paradoxo resolvido.</b> {item.explain}
            </div>
            <div className={styles.act}>
              <button type="button" className={styles.next} onClick={next}>
                {index + 1 < quiz.length ? 'Próximo paradoxo ▸' : 'Acender o cristal ▸'}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
