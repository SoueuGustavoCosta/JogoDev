import { useState } from 'react';
import { NotebookFrame } from '@/presentation/design-system';
import styles from './MatrixAddressWidget.module.css';

const MATRIX = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

/**
 * Farol 7 (arrays.ts): endereços da matriz — toque numa casa e veja o índice
 * `$m[linha][coluna]` e o valor guardado ali. Widget registrado como
 * `{ t: 'gui', widget: 'matriz-enderecos' }`.
 */
export function MatrixAddressWidget() {
  const [picked, setPicked] = useState<{ l: number; c: number } | null>({ l: 1, c: 2 });

  return (
    <NotebookFrame title="matriz.php">
      <div className={styles.wrap}>
        <div className={styles.grid}>
          {MATRIX.map((row, l) =>
            row.map((value, c) => {
              const active = picked?.l === l && picked?.c === c;
              return (
                <button
                  key={`${l}-${c}`}
                  type="button"
                  className={`${styles.cell} ${active ? styles.active : ''}`}
                  onClick={() => setPicked({ l, c })}
                >
                  {value}
                </button>
              );
            }),
          )}
        </div>
        <p className={styles.address}>
          {picked ? (
            <>
              <code>
                $m[{picked.l}][{picked.c}]
              </code>{' '}
              = <b>{MATRIX[picked.l][picked.c]}</b>
            </>
          ) : (
            'Toque numa casa para ver o endereço.'
          )}
        </p>
      </div>
    </NotebookFrame>
  );
}
