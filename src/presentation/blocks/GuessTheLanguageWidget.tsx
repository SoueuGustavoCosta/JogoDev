import { useMemo, useState } from 'react';
import { Button, NotebookFrame } from '@/presentation/design-system';
import styles from './GuessTheLanguageWidget.module.css';

type Lang = 'PHP' | 'Python' | 'Java' | 'C';

type Round = { lang: Lang; file: string; code: string };

const ROUNDS: Round[] = [
  { lang: 'Python', file: 'ola.py', code: 'print("Olá, Mundo!")' },
  {
    lang: 'Java',
    file: 'Ola.java',
    code: 'public class Ola {\n    public static void main(String[] args) {\n        System.out.println("Olá, Mundo!");\n    }\n}',
  },
  { lang: 'PHP', file: 'ola.php', code: '<?php\necho "Olá, Mundo!";\n?>' },
  {
    lang: 'C',
    file: 'ola.c',
    code: '#include <stdio.h>\nint main() {\n    printf("Ola, Mundo!\\n");\n    return 0;\n}',
  },
];

const OPTIONS: Lang[] = ['PHP', 'Python', 'Java', 'C'];

function shuffled(): Round[] {
  const arr = ROUNDS.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Farol 2 (ola.ts): em vez de só mostrar a tabela comparativa, o viajante tenta reconhecer
 * cada linguagem pelo código antes de ver a resposta. Widget registrado como
 * `{ t: 'gui', widget: 'qual-linguagem' }`.
 */
export function GuessTheLanguageWidget() {
  const [rounds] = useState(shuffled);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState<Lang | null>(null);
  const [score, setScore] = useState(0);

  const round = rounds[index];
  const done = index >= rounds.length;
  const correct = guess === round?.lang;

  const feedback = useMemo(() => {
    if (!guess) return null;
    if (correct) return 'Isso mesmo! Você reconheceu pelo jeito de escrever.';
    return `Quase — esse código é ${round.lang}.`;
  }, [guess, correct, round]);

  function pick(option: Lang) {
    if (guess) return;
    setGuess(option);
    if (option === round.lang) setScore((s) => s + 1);
  }

  function next() {
    setGuess(null);
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setGuess(null);
    setScore(0);
  }

  if (done) {
    return (
      <NotebookFrame title="placar.txt">
        <div className={styles.end}>
          <p className={styles.endScore}>
            Você acertou {score} de {rounds.length}.
          </p>
          <p className={styles.endText}>
            {score === rounds.length
              ? 'Bateu o olho e já viu a diferença. É isso que a prática ensina.'
              : 'Com o tempo o jeito de cada linguagem fica automático. Jogue de novo se quiser treinar.'}
          </p>
          <Button size="sm" variant="ghost" onClick={restart}>
            Jogar de novo
          </Button>
        </div>
      </NotebookFrame>
    );
  }

  return (
    <NotebookFrame title={`Rodada ${index + 1} de ${rounds.length}`}>
      <div className={styles.game}>
        <p className={styles.prompt}>Que linguagem é essa?</p>
        <pre className={styles.code}>{round.code}</pre>
        <div className={styles.options}>
          {OPTIONS.map((option) => {
            const isPicked = guess === option;
            const isAnswer = guess !== null && option === round.lang;
            const state = isAnswer ? 'right' : isPicked ? 'wrong' : 'idle';
            return (
              <button
                key={option}
                type="button"
                className={`${styles.option} ${styles[state]}`}
                onClick={() => pick(option)}
                disabled={guess !== null}
              >
                {option}
              </button>
            );
          })}
        </div>
        {feedback ? (
          <div className={styles.feedbackRow}>
            <p className={correct ? styles.feedbackGood : styles.feedbackBad}>{feedback}</p>
            <Button size="sm" onClick={next}>
              {index + 1 < rounds.length ? 'Próxima' : 'Ver placar'}
            </Button>
          </div>
        ) : null}
      </div>
    </NotebookFrame>
  );
}
