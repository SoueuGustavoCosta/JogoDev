import { useState } from 'react';
import type { BugMission as Bug } from '@/domain/webEra';
import styles from '../Stage.module.css';
import type { EngineProps } from './types';

/** Caça aos bugs: toque nas linhas erradas. Ao achar uma, a Sintaxe diz por quê (quando há). */
export function BugMission({ mission, api }: EngineProps<Bug>) {
  const max = mission.maxErr ?? 3;
  const [found, setFound] = useState<ReadonlySet<number>>(new Set());
  const [errs, setErrs] = useState(0);
  const [wrong, setWrong] = useState<{ i: number; n: number } | null>(null);

  const tap = (i: number) => {
    if (found.has(i)) return;
    if (mission.bad.includes(i)) {
      const next = new Set(found).add(i);
      setFound(next);
      const why = mission.why?.[i];
      if (why) api.toast(why);
      if (next.size === mission.bad.length) {
        api.ok();
        window.setTimeout(api.win, 500);
      }
      return;
    }
    const e = errs + 1;
    setErrs(e);
    setWrong((w) => ({ i, n: (w?.n ?? 0) + 1 }));
    api.err();
    if (e >= max) api.fail('Essa linha estava certa!');
  };

  return (
    <>
      <div className={styles.score}>
        <span>
          erros <b>{errs}/{max}</b>
        </span>
        <span>
          bugs <b>{found.size}/{mission.bad.length}</b>
        </span>
      </div>
      <div className={styles.lines}>
        {mission.lines.map((line, i) => (
          <button
            key={wrong?.i === i ? `${i}-${wrong.n}` : i}
            type="button"
            className={`${styles.ln} ${found.has(i) ? styles.found : ''} ${wrong?.i === i ? styles.wrong : ''}`}
            onClick={() => tap(i)}
            aria-label={`Linha ${i + 1}: ${line}${found.has(i) ? ' (bug encontrado)' : ''}`}
          >
            <i>{i + 1}</i>
            {line}
          </button>
        ))}
      </div>
    </>
  );
}
