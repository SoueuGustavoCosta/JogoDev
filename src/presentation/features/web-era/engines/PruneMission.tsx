import { useState } from 'react';
import type { PruneMission as Prune } from '@/domain/webEra';
import styles from '../Stage.module.css';
import type { EngineProps } from './types';

/** Poda: 3 trechos de código, 1 inválido. Corte o inválido, rodada após rodada. */
export function PruneMission({ mission, api }: EngineProps<Prune>) {
  const max = mission.maxErr ?? 3;
  const [k, setK] = useState(0);
  const [errs, setErrs] = useState(0);
  const [cut, setCut] = useState<number | null>(null);
  const [wrong, setWrong] = useState<{ i: number; n: number } | null>(null);
  const set = mission.sets[k]!;

  const tap = (i: number) => {
    if (cut !== null) return;
    if (i === set.bad) {
      setCut(i);
      if (set.why) api.toast(set.why);
      if (k + 1 >= mission.sets.length) {
        api.ok();
        window.setTimeout(api.win, 500);
      } else {
        window.setTimeout(() => {
          setK(k + 1);
          setCut(null);
        }, 550);
      }
      return;
    }
    const e = errs + 1;
    setErrs(e);
    setWrong((w) => ({ i, n: (w?.n ?? 0) + 1 }));
    api.err();
    if (e >= max) api.fail('Cortou código bom demais!');
  };

  return (
    <>
      <div className={styles.score}>
        <span>
          erros <b>{errs}/{max}</b>
        </span>
        <span>
          poda {k + 1}/{mission.sets.length}
        </span>
      </div>
      <div className={styles.snips}>
        {set.snips.map((snip, i) => (
          <button
            key={`${k}-${i}-${wrong?.i === i ? wrong.n : 0}`}
            type="button"
            className={`${styles.snip} ${cut === i ? styles.cutDone : ''} ${wrong?.i === i ? styles.wrong : ''}`}
            onClick={() => tap(i)}
            aria-label={`Cortar: ${snip}`}
          >
            <span className={styles.cut} aria-hidden="true">
              ✂
            </span>
            <code>{snip}</code>
          </button>
        ))}
      </div>
    </>
  );
}
