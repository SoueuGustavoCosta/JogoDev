import { useState, type CSSProperties } from 'react';
import type { TuneMission as Tune, TuneMode } from '@/domain/webEra';
import styles from '../Stage.module.css';
import type { EngineProps } from './types';

const camel = (p: string) => p.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
const toStyle = (v: Record<string, string>): CSSProperties =>
  Object.fromEntries(Object.entries(v).map(([k, x]) => [camel(k), x])) as CSSProperties;

/** O que aparece na arena: o alvo tracejado (fantasma) ou a versão do viajante. */
function Scene({ mode, values, ghost }: { mode: TuneMode; values: Record<string, string>; ghost: boolean }) {
  const who = ghost ? styles.gh : styles.me;
  const style = toStyle(values);
  if (mode === 'box')
    return (
      <div className={styles.lay}>
        <div className={`${styles.bx} ${who}`} style={{ ...style, borderStyle: ghost ? 'dashed' : 'solid' }}>
          Card
        </div>
      </div>
    );
  if (mode === 'flex')
    return (
      <div className={styles.lay} style={{ display: 'flex', ...style }}>
        {[1, 2, 3].map((n) => (
          <div key={n} className={`${styles.it} ${who}`}>
            {n}
          </div>
        ))}
      </div>
    );
  if (mode === 'grid')
    return (
      <div className={styles.lay} style={{ display: 'grid', ...style }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`${styles.it} ${who}`} style={{ width: 'auto' }}>
            {n}
          </div>
        ))}
      </div>
    );
  return (
    <div className={styles.lay} style={{ position: 'relative' }}>
      <div className={styles.cardp}>Projeto</div>
      <div className={`${styles.selo} ${who}`} style={style}>
        NOVO
      </div>
    </div>
  );
}

const SELECTOR: Record<TuneMode, string> = { box: '.card', pos: '.selo', flex: '.container', grid: '.container' };

/** Arena com alvo tracejado: ajuste as propriedades CSS até a cena encaixar. */
export function TuneMission({ mission, api }: EngineProps<Tune>) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(mission.ctrls.map((c) => [c.p, c.o[0]!])));
  const [solved, setSolved] = useState(false);

  const choose = (prop: string, value: string) => {
    if (solved) return;
    const next = { ...values, [prop]: value };
    setValues(next);
    if (Object.entries(mission.target).every(([k, v]) => next[k] === v)) {
      setSolved(true);
      api.ok();
      window.setTimeout(api.win, 700);
    }
  };

  return (
    <>
      <div className={`${styles.tscene} ${solved ? styles.okGlow : ''}`} role="img" aria-label="Arena: o alvo tracejado e as suas caixas">
        <div className={styles.layer}>
          <Scene mode={mission.mode} values={mission.target} ghost />
        </div>
        <div className={styles.layer}>
          <Scene mode={mission.mode} values={values} ghost={false} />
        </div>
      </div>
      <div className={styles.ctrls}>
        {mission.ctrls.map((c) => (
          <div key={c.p} className={styles.ctrl} role="group" aria-label={c.p}>
            <span>{c.p}:</span>
            <div className={styles.opts}>
              {c.o.map((o) => (
                <button key={o} type="button" className={values[c.p] === o ? styles.on : ''} aria-pressed={values[c.p] === o} onClick={() => choose(c.p, o)}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={`${styles.status} ${styles.mono}`}>
        {SELECTOR[mission.mode]} {'{ '}
        {Object.entries(values)
          .map(([k, v]) => `${k}: ${v};`)
          .join(' ')}
        {' }'}
      </div>
    </>
  );
}
