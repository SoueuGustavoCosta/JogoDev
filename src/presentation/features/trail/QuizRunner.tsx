import { useState } from 'react';
import { answerQuiz } from '@/application/usecases';
import type { QuizAnswer } from '@/domain/progress';
import type { QuizItem } from '@/domain/trail';
import { Button } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './QuizRunner.module.css';

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
  const [selected, setSelected] = useState<number | null>(null);
  const [fillValue, setFillValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  const item = quiz[index];
  const isFill = 'fill' in item;

  function check() {
    const answer: QuizAnswer = isFill ? { kind: 'fill', text: fillValue } : { kind: 'choice', optionIndex: selected! };
    const result = answerQuiz(
      { repository: progressRepository, analytics },
      { trailId, moduleId, quizIndex: index, item, answer },
    );
    setCorrect(result.correct);
    setChecked(true);
  }

  function next() {
    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      setSelected(null);
      setFillValue('');
      setChecked(false);
      setCorrect(false);
    } else {
      onFinished();
    }
  }

  const canCheck = isFill ? fillValue.trim().length > 0 : selected !== null;

  return (
    <div className={styles.wrap}>
      <p className={styles.progress}>
        Paradoxo {index + 1} de {quiz.length}
      </p>
      <p className={styles.question}>{item.q}</p>

      {isFill ? (
        <div className={styles.fillRow}>
          <span>{item.pre}</span>
          <input
            className={styles.fillInput}
            value={fillValue}
            onChange={(e) => setFillValue(e.target.value)}
            placeholder={item.placeholder ?? '?'}
            disabled={checked}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Sua resposta"
          />
          <span>{item.post}</span>
        </div>
      ) : (
        <div className={styles.options}>
          {item.options.map((option, i) => {
            const isSelected = selected === i;
            const showCorrect = checked && i === item.answer;
            const showWrong = checked && isSelected && i !== item.answer;
            return (
              <button
                key={i}
                type="button"
                className={`${styles.option} ${showCorrect ? styles.optionCorrect : ''} ${showWrong ? styles.optionWrong : ''}`}
                onClick={() => !checked && setSelected(i)}
                disabled={checked}
                aria-pressed={isSelected}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {!checked ? (
        <div style={{ marginTop: 16 }}>
          <Button onClick={check} disabled={!canCheck}>
            Verificar
          </Button>
        </div>
      ) : (
        <div className={styles.explain}>
          <p>{correct ? 'Isso mesmo!' : 'Ainda não, tente outra opção.'}</p>
          {correct ? <p>{item.explain}</p> : null}
          <div style={{ marginTop: 10 }}>
            {correct ? (
              <Button onClick={next}>{index + 1 < quiz.length ? 'Próximo' : 'Concluir'}</Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setChecked(false);
                  setSelected(null);
                  setFillValue('');
                }}
              >
                Tentar de novo
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
