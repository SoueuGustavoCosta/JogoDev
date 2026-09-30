import { useEffect, useState } from 'react';
import type { DefuseMission as Defuse } from '@/domain/webEra';
import styles from '../Stage.module.css';
import type { EngineProps } from './types';

/**
 * Desarme a variante: uma linha com bug e o contador do reset correndo. Quem controla o tempo
 * é o palco (a mesma barra das outras missões); aqui só aparece a contagem grande.
 */
export function DefuseMission({ mission, api, seconds }: EngineProps<Defuse>) {
  const max = mission.maxErr ?? 2;
  const [left, setLeft] = useState(seconds);
  const [errs, setErrs] = useState(0);
  const [found, setFound] = useState(false);
  const [wrong, setWrong] = useState<{ i: number; n: number } | null>(null);

  useEffect(() => {
    if (found || !seconds) return;
    const t0 = Date.now();
    const id = window.setInterval(() => setLeft(Math.max(0, Math.ceil(seconds - (Date.now() - t0) / 1000))), 200);
    return () => window.clearInterval(id);
  }, [seconds, found]);

  const tap = (i: number) => {
    if (found) return;
    if (i === mission.bad) {
      setFound(true);
      if (mission.why) api.toast(mission.why);
      api.ok();
      window.setTimeout(api.win, 600);
      return;
    }
    const e = errs + 1;
    setErrs(e);
    setWrong((w) => ({ i, n: (w?.n ?? 0) + 1 }));
    api.err();
    if (e >= max) api.fail('Linha errada: a variante escapou!');
  };

  return (
    <>
      <div className={styles.bomb} role="timer" aria-label={`Reset em ${left} segundos`}>
        <span className={`${styles.eyebrow} ${styles.avtEyebrow}`}>⚠ variante armada</span>
        <b className={!found && left <= seconds * 0.3 ? styles.bombHot : undefined}>{found ? '✓' : left}</b>
        <small>reset em segundos</small>
      </div>
      <div className={styles.score}>
        <span>
          erros <b>{errs}/{max}</b>
        </span>
        <span>1 bug</span>
      </div>
      <div className={styles.lines}>
        {mission.lines.map((line, i) => (
          <button
            key={wrong?.i === i ? `${i}-${wrong.n}` : i}
            type="button"
            className={`${styles.ln} ${found && i === mission.bad ? styles.found : ''} ${wrong?.i === i ? styles.wrong : ''}`}
            onClick={() => tap(i)}
            aria-label={`Linha ${i + 1}: ${line}`}
          >
            <i>{i + 1}</i>
            {line}
          </button>
        ))}
      </div>
    </>
  );
}
