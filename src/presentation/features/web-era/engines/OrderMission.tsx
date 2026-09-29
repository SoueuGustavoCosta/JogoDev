import { useMemo, useState } from 'react';
import { buildOrderPreview, type OrderMission as Order } from '@/domain/webEra';
import styles from '../Stage.module.css';
import { shuffle, type EngineProps } from './types';

const MAX_ERR = 3;

/** Toque as peças na ordem certa: acerto encaixa, erro treme. 3 erros = falha. */
export function OrderMission({ mission, api }: EngineProps<Order>) {
  const pool = useMemo(() => shuffle([...mission.tokens, ...(mission.extra ?? [])]), [mission]);
  const [used, setUsed] = useState<ReadonlySet<number>>(new Set());
  const [pos, setPos] = useState(0);
  const [errs, setErrs] = useState(0);
  const [shaking, setShaking] = useState<{ k: number; n: number } | null>(null);
  const placed = mission.tokens.slice(0, pos);

  const tap = (k: number) => {
    // Peças repetidas (duas `<tr>`) valem igual: confere o texto, não a posição original.
    if (pool[k] === mission.tokens[pos]) {
      const next = pos + 1;
      setPos(next);
      setUsed((u) => new Set(u).add(k));
      if (next === mission.tokens.length) {
        api.ok();
        api.win();
      }
      return;
    }
    const e = errs + 1;
    setErrs(e);
    setShaking((s) => ({ k, n: (s?.n ?? 0) + 1 }));
    api.err();
    if (e >= MAX_ERR) api.fail('Ordem errada 3 vezes');
  };

  return (
    <>
      <div className={`${styles.slots} ${mission.block ? styles.block : ''}`} aria-live="polite">
        {placed.length === 0 ? <span className={styles.slotsEmpty}>toque nas peças abaixo, na ordem certa</span> : null}
        {placed.map((t, i) => (
          <span key={i} className={`${styles.tok} ${styles.placed}`}>
            {t}
          </span>
        ))}
      </div>
      <div className={styles.pool}>
        {pool.map((t, k) => (
          <button
            key={shaking?.k === k ? `${k}-${shaking.n}` : k}
            type="button"
            className={`${styles.tok} ${used.has(k) ? styles.used : ''} ${shaking?.k === k ? styles.shake : ''}`}
            onClick={() => tap(k)}
            disabled={used.has(k)}
          >
            {t}
          </button>
        ))}
      </div>
      {mission.preview ? (
        <iframe className={`${styles.preview} ${styles.previewSmall}`} title="Prévia" sandbox="" srcDoc={buildOrderPreview(placed)} />
      ) : null}
      <div className={styles.score}>
        <span>
          erros <b>{errs}/{MAX_ERR}</b>
        </span>
        <span>
          {pos}/{mission.tokens.length}
        </span>
      </div>
    </>
  );
}
