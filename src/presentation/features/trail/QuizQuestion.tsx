import { useEffect, useMemo, useState } from 'react';
import { answerQuiz } from '@/application/usecases';
import { fillChoices, quizKind, shuffledOrder, type QuizAnswer } from '@/domain/progress';
import type { QuizItem } from '@/domain/trail';
import { useServices } from '@/presentation/app/ServicesContext';
import { xpMultiplierNow } from '@/presentation/features/events/multiplier';
import { BugChallenge } from './BugChallenge';
import { CodeSnippet } from './CodeSnippet';
import { OrderChallenge } from './OrderChallenge';
import { retryText } from './retryText';
import { SintaxeReaction } from './SintaxeReaction';
import styles from './QuizRunner.module.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Estado da pergunta que quem mostra a pergunta precisa saber (ex.: barra de feedback da lição). */
export type QuizQuestionState =
  | { status: 'idle' }
  | { status: 'wrong'; attempts: number }
  | { status: 'solved'; xpGained: number; firstTry: boolean };

/**
 * Uma pergunta (paradoxo). Errar nunca penaliza: a opção errada apaga e o aluno tenta
 * outra; XP e tentativas seguem `answerQuiz` (domain/progress/xp.ts). Usada pelo quiz no fim
 * da página (Modo leitura, `QuizRunner`) e pela lição em telas curtas (`LessonPlayer`).
 *
 * - `inline`: feedback, explicação e botão "Próximo" aparecem dentro da própria caixa.
 * - `lesson`: só a pergunta; quem chama mostra o feedback na barra de baixo (via `onChange`).
 *
 * Remonte com `key` diferente a cada pergunta para zerar o estado.
 */
export function QuizQuestion({
  trailId,
  moduleId,
  item,
  variant,
  position,
  total,
  nextLabel,
  onNext,
  onChange,
  onAnswered,
  evaluate,
  label,
}: {
  trailId: string;
  moduleId: string;
  item: QuizItem;
  variant: 'inline' | 'lesson';
  /** Número da pergunta (a partir de 1) e total, para o cabeçalho "Paradoxo N de M". */
  position: number;
  total: number;
  /** Só no `inline`: rótulo e ação do botão que aparece depois do acerto. */
  nextLabel?: string;
  onNext?: () => void;
  onChange?: (state: QuizQuestionState) => void;
  /** Chamado depois de cada resposta gravada (ex.: para o cabeçalho atualizar o XP). */
  onAnswered?: () => void;
  /**
   * Conferência própria (ex.: Anomalia do Dia): substitui o `answerQuiz`, que grava a
   * resposta no módulo. Recebe a resposta e devolve se acertou e quanto XP ganhou.
   */
  evaluate?: (answer: QuizAnswer) => { correct: boolean; xpGained: number };
  /** Troca o cabeçalho "Paradoxo N de M". */
  label?: string;
}) {
  const { progressRepository, analytics } = useServices();
  const [wrong, setWrong] = useState<number[]>([]);
  const [fillValue, setFillValue] = useState('');
  // Erros das perguntas que não são de escolha (completar, montar a linha, encontre o bug).
  const [missed, setMissed] = useState(false);
  const [misses, setMisses] = useState(0);
  const [wrongLines, setWrongLines] = useState<number[]>([]);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [solved, setSolved] = useState<number | 'done' | null>(null);
  const [wrongBlocks, setWrongBlocks] = useState<string[]>([]);
  const [xpGained, setXpGained] = useState(0);

  const kind = quizKind(item);
  const isChoice = kind === 'choice' || kind === 'output';
  const attempts = isChoice ? wrong.length : misses;
  // Sorteado de novo a cada pergunta: a resposta certa não pode cair sempre no mesmo lugar.
  const optionOrder = useMemo(() => ('options' in item ? shuffledOrder(item.options.length, Math.random) : []), [item]);
  const blocks = useMemo(() => fillChoices(item, Math.random), [item]);
  const isSolved = solved !== null;

  useEffect(() => {
    if (!onChange) return;
    if (isSolved) onChange({ status: 'solved', xpGained, firstTry: attempts === 0 });
    else if (attempts > 0) onChange({ status: 'wrong', attempts });
    else onChange({ status: 'idle' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolved, attempts]);

  function submit(answer: QuizAnswer, choiceIndex?: number) {
    const result = evaluate
      ? evaluate(answer)
      : answerQuiz({ repository: progressRepository, analytics }, { trailId, moduleId, item, answer, xpMultiplier: xpMultiplierNow() });
    onAnswered?.();
    if (result.correct) {
      setXpGained(result.xpGained);
      setSolved(choiceIndex ?? 'done');
      setMissed(false);
    } else if (choiceIndex !== undefined) {
      setWrong((w) => [...w, choiceIndex]);
    } else {
      if (answer.kind === 'fill') setWrongBlocks((b) => [...b, answer.text]);
      if (answer.kind === 'line') setWrongLines((l) => [...l, answer.line]);
      setMissed(true);
      setMisses((t) => t + 1);
    }
  }

  // A partir da 3ª tentativa (2 erros), a dica aparece sozinha; antes disso, quem quiser pode pedir.
  const hintForced = attempts >= 2;
  const showHint = !isSolved && !!item.hint && (hintRevealed || hintForced);

  // A Sintaxe reage a cada tentativa: "signal" muda mesmo quando o tipo continua "wrong"
  // de novo (outra opção errada, outro fill errado), pra tocar o som e reiniciar a
  // animação em cada uma — não só na primeira vez que o tipo muda.
  const reactionType: 'correct' | 'wrong' | null = isSolved ? 'correct' : missed || wrong.length > 0 ? 'wrong' : null;
  const reactionSignal = (isSolved ? 1000 : 0) + wrong.length + misses;
  const inline = variant === 'inline';

  return (
    <>
      <SintaxeReaction type={reactionType} signal={reactionSignal} xpGained={isSolved ? xpGained : 0} />
      <div className={inline ? styles.box : styles.lessonBox}>
        <div className={styles.top}>
          <span>{label ?? `Paradoxo ${position} de ${total}`}</span>
          {inline && !label ? <span>{total - position + (isSolved ? 0 : 1)} restantes</span> : null}
        </div>
        <p className={styles.question}>{item.q}</p>

        {item.kind === 'output' ? <CodeSnippet code={item.code} lang={item.lang} /> : null}

        {item.kind === 'order' ? (
          <OrderChallenge
            item={item}
            solved={isSolved}
            missed={missed}
            onSubmit={(pieces) => submit({ kind: 'order', pieces })}
          />
        ) : item.kind === 'bug' ? (
          <BugChallenge
            item={item}
            solved={isSolved}
            wrongLines={wrongLines}
            onPick={(line) => submit({ kind: 'line', line })}
          />
        ) : 'fill' in item && blocks.length > 0 ? (
          <>
            <pre className={styles.clozeCode}>
              {item.pre ? <span>{item.pre} </span> : null}
              <span className={`${styles.clozeSlot} ${isSolved ? styles.clozeSlotOk : ''}`}>
                {isSolved ? item.accept[0] : '____'}
              </span>
              {item.post ? <span> {item.post}</span> : null}
            </pre>
            <div className={styles.blocks} role="group" aria-label="Blocos para completar">
              {blocks.map((block) => {
                const no = wrongBlocks.includes(block);
                const ok = isSolved && block === item.accept[0];
                return (
                  <button
                    key={block}
                    type="button"
                    className={`${styles.block} ${ok ? styles.used : ''} ${no ? styles.no : ''}`}
                    disabled={isSolved || no}
                    aria-hidden={ok || undefined}
                    onClick={() => submit({ kind: 'fill', text: block })}
                  >
                    {block}
                  </button>
                );
              })}
            </div>
          </>
        ) : 'fill' in item ? (
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
        ) : 'options' in item ? (
          <div className={styles.opts}>
            {optionOrder.map((i, pos) => {
              const option = item.options[i];
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
                  <b>{LETTERS[pos]}</b>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {inline && !isSolved && (missed || wrong.length > 0) ? (
          <div className={`${styles.fb} ${styles.bad}`} role="status">
            Ainda não. {retryText(item)}
          </div>
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

        {inline && isSolved ? (
          <>
            <div className={`${styles.fb} ${styles.good}`} role="status">
              {/* `explain` é conteúdo do próprio projeto (pode ter <code>, <b>), como nas lições. */}
              <b>Paradoxo resolvido.</b> <span dangerouslySetInnerHTML={{ __html: item.explain }} />
            </div>
            <div className={styles.act}>
              <button type="button" className={styles.next} onClick={onNext}>
                {nextLabel}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
