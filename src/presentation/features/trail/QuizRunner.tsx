import { useState } from 'react';
import { answerQuiz } from '@/application/usecases';
import type { QuizAnswer } from '@/domain/progress';
import type { QuizItem } from '@/domain/trail';
import { useServices } from '@/presentation/app/ServicesContext';
import { SintaxeReaction } from './SintaxeReaction';
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
  const [fillTries, setFillTries] = useState(0);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [solved, setSolved] = useState<number | 'fill' | null>(null);

  const item = quiz[index];
  const isFill = 'fill' in item;
  const attempts = isFill ? fillTries : wrong.length;

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
      setFillTries((t) => t + 1);
    }
  }

  function next() {
    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      setWrong([]);
      setFillValue('');
      setFillWrong(false);
      setFillTries(0);
      setHintRevealed(false);
      setSolved(null);
    } else {
      onFinished();
    }
  }

  const isSolved = solved !== null;
  // A partir da 3ª tentativa (2 erros), a dica aparece sozinha; antes disso, quem quiser pode pedir.
  const hintForced = attempts >= 2;
  const showHint = !isSolved && !!item.hint && (hintRevealed || hintForced);

  // A Sintaxe reage a cada tentativa: "signal" muda mesmo quando o tipo continua "wrong"
  // de novo (outra opção errada, outro fill errado), pra tocar o som e reiniciar a
  // animação em cada uma — não só na primeira vez que o tipo muda.
  const reactionType: 'correct' | 'wrong' | null = isSolved ? 'correct' : fillWrong || wrong.length > 0 ? 'wrong' : null;
  const reactionSignal = (isSolved ? 1000 : 0) + wrong.length + fillTries;

  return (
    <section className={styles.quiz} aria-label="Paradoxo do salto">
      <SintaxeReaction type={reactionType} signal={reactionSignal} />
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

        {!isSolved && item.hint ? (
          showHint ? (
            <div className={styles.hintBox} role="status">
              <b>💡 Dica:</b> {item.hint}
            </div>
          ) : attempts >= 1 ? (
            <button type="button" className={styles.hintBtn} onClick={() => setHintRevealed(true)}>
              💡 Ver dica
            </button>
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
