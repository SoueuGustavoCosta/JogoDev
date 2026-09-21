import { useMemo, useState } from 'react';
import { Button, NotebookFrame } from '@/presentation/design-system';
import styles from './GuessTheLanguageWidget.module.css';

type PhpType = 'Integer' | 'Float' | 'String' | 'Boolean' | 'Array' | 'NULL';

type Round = { code: string; type: PhpType };

const ROUNDS: Round[] = [
  { code: '$idade = 25;', type: 'Integer' },
  { code: '$preco = 19.90;', type: 'Float' },
  { code: '$nome = "Filipe";', type: 'String' },
  { code: '$ativo = true;', type: 'Boolean' },
  { code: '$notas = [7, 8.5, 6];', type: 'Array' },
  { code: '$vazio = null;', type: 'NULL' },
];

const OPTIONS: PhpType[] = ['Integer', 'Float', 'String', 'Boolean', 'Array', 'NULL'];

function shuffled(): Round[] {
  const arr = ROUNDS.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Farol 3 (variaveis.ts): laboratório de tipos em forma de jogo — o viajante vê uma
 * variável PHP e adivinha o tipo antes de seguir para a tabela comparativa. Widget
 * registrado como `{ t: 'gui', widget: 'qual-tipo' }`.
 */
export function GuessTypeWidget() {
  const [rounds] = useState(shuffled);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState<PhpType | null>(null);
  const [score, setScore] = useState(0);

  const round = rounds[index];
  const done = index >= rounds.length;
  const correct = guess === round?.type;

  const feedback = useMemo(() => {
    if (!guess) return null;
    if (correct) return 'Isso mesmo!';
    return `Quase — essa variável é do tipo ${round.type}.`;
  }, [guess, correct, round]);

  function pick(option: PhpType) {
    if (guess) return;
    setGuess(option);
    if (option === round.type) setScore((s) => s + 1);
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
              ? 'Reconheceu cada caixinha pelo conteúdo. É exatamente isso que o PHP faz sozinho.'
              : 'O PHP decide o tipo sozinho, pelo valor. Jogue de novo se quiser fixar.'}
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
        <p className={styles.prompt}>Qual é o tipo dessa variável?</p>
        <pre className={styles.code}>{round.code}</pre>
        <div className={styles.options}>
          {OPTIONS.map((option) => {
            const isPicked = guess === option;
            const isAnswer = guess !== null && option === round.type;
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
