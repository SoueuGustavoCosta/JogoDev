import { useMemo, useState } from 'react';
import { Button, NotebookFrame } from '@/presentation/design-system';
import styles from './SelectionSortWidget.module.css';

const INITIAL = [5, 2, 1, 4, 3];

type Frame = { arr: number[]; i: number; j: number | null; menor: number; message: string };

function traceSelectionSort(initial: number[]): Frame[] {
  const arr = initial.slice();
  const frames: Frame[] = [];
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let menor = i;
    frames.push({ arr: arr.slice(), i, j: null, menor, message: `Supõe que o menor é a posição ${i} (valor ${arr[i]}).` });
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[menor]) {
        menor = j;
        frames.push({ arr: arr.slice(), i, j, menor, message: `Posição ${j} (valor ${arr[j]}) é menor. Agora o menor é a posição ${menor}.` });
      } else {
        frames.push({ arr: arr.slice(), i, j, menor, message: `Posição ${j} (valor ${arr[j]}) não é menor que a posição ${menor} (valor ${arr[menor]}).` });
      }
    }
    if (menor !== i) {
      [arr[i], arr[menor]] = [arr[menor], arr[i]];
      frames.push({ arr: arr.slice(), i, j: null, menor, message: `Troca: posição ${i} com posição ${menor}.` });
    }
  }
  frames.push({ arr: arr.slice(), i: n, j: null, menor: n, message: 'Array ordenado!' });
  return frames;
}

/**
 * Farol 7 (arrays.ts): passo a passo da ordenação por seleção no exemplo da apostila
 * (5, 2, 1, 4, 3). Widget registrado como `{ t: 'gui', widget: 'ordenacao-selecao' }`.
 */
export function SelectionSortWidget() {
  const frames = useMemo(() => traceSelectionSort(INITIAL), []);
  const [index, setIndex] = useState(0);
  const frame = frames[index];
  const done = index === frames.length - 1;

  return (
    <NotebookFrame title="ordenacao.php (passo a passo)">
      <div className={styles.wrap}>
        <div className={styles.array}>
          {frame.arr.map((value, pos) => {
            const isI = pos === frame.i;
            const isJ = pos === frame.j;
            const isMenor = pos === frame.menor;
            return (
              <div
                key={pos}
                className={`${styles.box} ${isMenor ? styles.menor : ''} ${isJ ? styles.j : ''} ${isI ? styles.i : ''}`}
              >
                <span className={styles.value}>{value}</span>
                <span className={styles.pos}>{pos}</span>
              </div>
            );
          })}
        </div>
        <p className={styles.message}>{frame.message}</p>
        <div className={styles.legend}>
          <span className={styles.legendI}>posição i</span>
          <span className={styles.legendJ}>posição j</span>
          <span className={styles.legendMenor}>menor até aqui</span>
        </div>
        <div className={styles.actions}>
          <Button size="sm" variant="ghost" onClick={() => setIndex(0)} disabled={index === 0}>
            Reiniciar
          </Button>
          <Button size="sm" onClick={() => setIndex((i) => Math.min(i + 1, frames.length - 1))} disabled={done}>
            {done ? 'Concluído' : 'Próximo passo ▸'}
          </Button>
        </div>
      </div>
    </NotebookFrame>
  );
}
