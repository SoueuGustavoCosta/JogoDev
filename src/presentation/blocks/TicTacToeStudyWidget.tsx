import { useState } from 'react';
import {
  emptyBoard,
  evaluate,
  isOccupied,
  isStepComplete,
  machineMove,
  playerMove,
  type Board,
  type GameResult,
} from '@/domain/ticTacToe';
import { ticTacToeSteps } from '@/content/trails/logica/ticTacToeSteps';
import { Button, NotebookFrame } from '@/presentation/design-system';
import styles from './TicTacToeStudyWidget.module.css';

const RESULT_TEXT: Record<Exclude<GameResult, 'playing'>, string> = {
  jogador: 'Você venceu! O laço, enfim, encontrou a condição de parada.',
  maquina: 'A máquina venceu essa. Tente de novo?',
  empate: 'Deu velha — e a máquina não travou: livres() protegeu o jogo.',
};

/**
 * Farol "velha": primeiro o aluno preenche as 5 lacunas do arquivo do professor (mesmo
 * código de `modules/velha.ts`), depois um tabuleiro de verdade aparece pra jogar contra a
 * máquina. Widget registrado no BlockRenderer como `{ t: 'gui', widget: 'jogo-da-velha' }`.
 */
export function TicTacToeStudyWidget() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => Array(ticTacToeSteps[0].blanks.length).fill(''));
  const [wrong, setWrong] = useState(false);
  const [studyDone, setStudyDone] = useState(false);

  const [board, setBoard] = useState<Board>(emptyBoard);
  const [turnBusy, setTurnBusy] = useState(false);
  const [history, setHistory] = useState({ vitorias: 0, derrotas: 0, empates: 0 });

  const step = ticTacToeSteps[stepIndex];
  const result = evaluate(board);

  function updateAnswer(i: number, value: string) {
    setAnswers((prev) => {
      const next = prev.slice();
      next[i] = value;
      return next;
    });
    setWrong(false);
  }

  function verifyStep() {
    if (isStepComplete(step, answers)) {
      const next = stepIndex + 1;
      if (next >= ticTacToeSteps.length) {
        setStudyDone(true);
      } else {
        setStepIndex(next);
        setAnswers(Array(ticTacToeSteps[next].blanks.length).fill(''));
      }
      setWrong(false);
    } else {
      setWrong(true);
    }
  }

  function play(l: number, c: number) {
    if (turnBusy || result !== 'playing' || isOccupied(board, l, c)) return;
    const afterPlayer = playerMove(board, l, c, 'J');
    setBoard(afterPlayer);
    const afterPlayerResult = evaluate(afterPlayer);
    if (afterPlayerResult !== 'playing') {
      recordResult(afterPlayerResult);
      return;
    }
    setTurnBusy(true);
    window.setTimeout(() => {
      const move = machineMove(afterPlayer, (max) => Math.floor(Math.random() * max));
      const afterMachine = move ? playerMove(afterPlayer, move.l, move.c, 'M') : afterPlayer;
      setBoard(afterMachine);
      setTurnBusy(false);
      const finalResult = evaluate(afterMachine);
      if (finalResult !== 'playing') recordResult(finalResult);
    }, 260);
  }

  function recordResult(r: Exclude<GameResult, 'playing'>) {
    setHistory((prev) => ({
      vitorias: prev.vitorias + (r === 'jogador' ? 1 : 0),
      derrotas: prev.derrotas + (r === 'maquina' ? 1 : 0),
      empates: prev.empates + (r === 'empate' ? 1 : 0),
    }));
  }

  function restart() {
    setBoard(emptyBoard());
    setTurnBusy(false);
  }

  if (!studyDone) {
    return (
      <NotebookFrame title={step.title}>
        <div className={styles.study}>
          <p className={styles.stepCount}>
            Passo {stepIndex + 1} de {ticTacToeSteps.length}
          </p>
          {step.blanks.map((blank, i) => (
            <label key={i} className={styles.blankRow}>
              <span className={styles.hint}>{blank.hint}</span>
              <input
                type="text"
                value={answers[i] ?? ''}
                onChange={(e) => updateAnswer(i, e.target.value)}
                placeholder="___"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className={styles.blankInput}
              />
            </label>
          ))}
          {wrong ? <p className={styles.wrong}>Ainda não é isso — confira a dica de cada lacuna e tente de novo.</p> : null}
          <Button size="sm" onClick={verifyStep}>
            Verificar
          </Button>
        </div>
      </NotebookFrame>
    );
  }

  return (
    <NotebookFrame title="jogo-da-velha.php">
      <div className={styles.game}>
        <p className={styles.stats}>
          Vitórias {history.vitorias} · Derrotas {history.derrotas} · Empates {history.empates}
        </p>
        <div className={styles.board} role="grid" aria-label="Tabuleiro do jogo da velha">
          {board.map((row, l) =>
            row.map((cell, c) => (
              <button
                key={`${l}-${c}`}
                type="button"
                className={styles.cell}
                onClick={() => play(l, c)}
                disabled={cell !== '0' || result !== 'playing' || turnBusy}
                aria-label={`Linha ${l + 1}, coluna ${c + 1}${cell !== '0' ? `, ocupada por ${cell === 'J' ? 'você' : 'máquina'}` : ', livre'}`}
              >
                {cell === 'J' ? 'X' : cell === 'M' ? 'O' : ''}
              </button>
            )),
          )}
        </div>
        <div className={styles.status} aria-live="polite">
          {result === 'playing'
            ? turnBusy
              ? 'A máquina está jogando...'
              : 'Sua vez: toque numa casa livre.'
            : RESULT_TEXT[result]}
        </div>
        {result !== 'playing' ? (
          <Button size="sm" variant="ghost" onClick={restart}>
            Jogar de novo
          </Button>
        ) : null}
      </div>
    </NotebookFrame>
  );
}
