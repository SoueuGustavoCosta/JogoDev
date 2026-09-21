import { useState } from 'react';
import { NotebookFrame } from '@/presentation/design-system';
import styles from './TruthTableWidget.module.css';

const ROWS: Array<[boolean, boolean]> = [
  [true, true],
  [true, false],
  [false, true],
  [false, false],
];

function label(v: boolean) {
  return v ? 'V' : 'F';
}

/**
 * Farol 4 (operadores.ts): tabela-verdade ao vivo — o viajante alterna $a e $b e vê a
 * linha destacada com o resultado de &&, || e !. Widget registrado como
 * `{ t: 'gui', widget: 'tabela-verdade' }`.
 */
export function TruthTableWidget() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);

  return (
    <NotebookFrame title="tabela-verdade.php">
      <div className={styles.wrap}>
        <div className={styles.toggles}>
          <button type="button" className={styles.toggle} onClick={() => setA((v) => !v)}>
            $a = <b>{label(a)}</b>
          </button>
          <button type="button" className={styles.toggle} onClick={() => setB((v) => !v)}>
            $b = <b>{label(b)}</b>
          </button>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>$a</th>
                <th>$b</th>
                <th>&amp;&amp;</th>
                <th>||</th>
                <th>!$a</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([ra, rb], i) => {
                const active = ra === a && rb === b;
                return (
                  <tr key={i} className={active ? styles.active : undefined}>
                    <td>{label(ra)}</td>
                    <td>{label(rb)}</td>
                    <td>{label(ra && rb)}</td>
                    <td>{label(ra || rb)}</td>
                    <td>{label(!ra)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={styles.hint}>Toque em $a ou $b para trocar o valor e ver a linha destacada.</p>
      </div>
    </NotebookFrame>
  );
}
