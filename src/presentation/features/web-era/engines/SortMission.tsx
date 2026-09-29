import { useMemo, useState } from 'react';
import type { SortMission as Sort } from '@/domain/webEra';
import styles from '../Stage.module.css';
import { toneVar } from '../tones';
import { shuffle, type EngineProps } from './types';

/** Uma carta por vez: toque no balde certo. */
export function SortMission({ mission, api }: EngineProps<Sort>) {
  const queue = useMemo(() => shuffle(mission.items), [mission]);
  const max = mission.maxErr ?? 3;
  const [k, setK] = useState(0);
  const [errs, setErrs] = useState(0);
  const card = queue[k];

  const pick = (bucketId: string) => {
    if (!card) return;
    if (bucketId === card[1]) {
      const next = k + 1;
      setK(next);
      if (next >= queue.length) {
        api.ok();
        api.win();
      }
      return;
    }
    const e = errs + 1;
    setErrs(e);
    api.err();
    if (e >= max) api.fail('Muitos erros de classificação');
  };

  return (
    <>
      <div className={styles.score}>
        <span>
          erros <b>{errs}/{max}</b>
        </span>
        <span>
          {k}/{queue.length}
        </span>
      </div>
      {/* A chave muda a cada carta e a cada erro: a carta nova "pula" e o erro treme. */}
      <div key={`${k}-${errs}`} className={`${styles.sortcard} ${errs > 0 ? styles.shake : ''}`} aria-live="polite">
        {card ? card[0] : '✓'}
      </div>
      <div className={styles.buckets}>
        {mission.buckets.map((b) => (
          <button key={b.id} type="button" className={styles.bucket} style={{ ['--c' as string]: toneVar(b.tone) }} onClick={() => pick(b.id)}>
            {b.label}
            {b.s ? <small>{b.s}</small> : null}
          </button>
        ))}
      </div>
    </>
  );
}
