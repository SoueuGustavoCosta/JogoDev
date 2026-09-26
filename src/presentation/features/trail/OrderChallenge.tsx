import { useMemo, useState } from 'react';
import { orderBank } from '@/domain/progress';
import type { OrderQuizItem } from '@/domain/trail';
import styles from './Challenges.module.css';

/**
 * "Monte a linha": o aluno toca nas peças para colocá-las na linha, na ordem; tocar numa
 * peça da linha devolve ela ao banco. "Verificar" só libera com a linha completa. Depois de
 * um erro a linha fica como estava, para o aluno corrigir só o que precisa.
 */
export function OrderChallenge({
  item,
  solved,
  missed,
  onSubmit,
}: {
  item: OrderQuizItem;
  solved: boolean;
  /** A última verificação errou (a linha fica vermelha até o aluno mexer nela). */
  missed: boolean;
  onSubmit: (pieces: string[]) => void;
}) {
  const bank = useMemo(() => orderBank(item, Math.random), [item]);
  // Posições no banco (peças com o mesmo texto são peças diferentes).
  const [placed, setPlaced] = useState<number[]>([]);
  const [dirty, setDirty] = useState(false);
  const complete = placed.length === item.pieces.length;
  const lineClass = solved ? styles.lineOk : missed && !dirty ? styles.lineBad : '';

  function place(index: number) {
    if (solved || complete) return;
    setPlaced((p) => [...p, index]);
    setDirty(true);
  }

  function unplace(index: number) {
    if (solved) return;
    setPlaced((p) => p.filter((i) => i !== index));
    setDirty(true);
  }

  function check() {
    setDirty(false);
    onSubmit(placed.map((i) => bank[i]));
  }

  return (
    <>
      <div className={`${styles.code} ${lineClass}`}>
        <div className={styles.line} aria-label="Sua linha de código" aria-live="polite">
          {placed.length === 0 ? <span className={styles.linePlaceholder}>Toque nas peças abaixo, na ordem.</span> : null}
          {placed.map((i) => (
            <button
              key={i}
              type="button"
              className={styles.placed}
              disabled={solved}
              onClick={() => unplace(i)}
              aria-label={`Tirar ${bank[i]} da linha`}
            >
              {bank[i]}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.bank} role="group" aria-label="Peças">
        {bank.map((piece, i) => {
          const used = placed.includes(i);
          return (
            <button
              key={i}
              type="button"
              className={`${styles.piece} ${used ? styles.pieceUsed : ''}`}
              disabled={solved || used || complete}
              aria-hidden={used || undefined}
              onClick={() => place(i)}
            >
              {piece}
            </button>
          );
        })}
      </div>
      {!solved ? (
        <div className={styles.actions}>
          <button type="button" className={styles.check} disabled={!complete} onClick={check}>
            Verificar
          </button>
        </div>
      ) : null}
    </>
  );
}
