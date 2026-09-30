import { useMemo, useState } from 'react';
import type { QuizMission as Quiz } from '@/domain/webEra';
import styles from '../Stage.module.css';
import { shuffle, type EngineProps } from './types';

/** Interrogatório da AVT: o chefe mostra um código e pergunta o que ele imprime. Errou, perde vida. */
export function QuizMission({ mission, api }: EngineProps<Quiz>) {
  const options = useMemo(() => shuffle(mission.options), [mission]);
  const [picked, setPicked] = useState<string | null>(null);

  const pick = (o: string) => {
    if (picked !== null) return;
    setPicked(o);
    if (o === mission.answer) {
      api.ok();
      window.setTimeout(api.win, 600);
    } else {
      api.err();
      api.fail('Resposta errada: a AVT tirou uma vida!');
    }
  };

  return (
    <div className={styles.avt}>
      <span className={`${styles.eyebrow} ${styles.avtEyebrow}`}>interrogatório da AVT</span>
      <pre className={styles.fillcode}>{mission.code}</pre>
      <p className={styles.avtQ}>{mission.q ?? 'O que isso imprime?'}</p>
      <div className={`${styles.chips} ${styles.three}`}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            className={`${styles.tok} ${picked === o ? (o === mission.answer ? styles.tokGood : styles.tokBad) : ''}`}
            onClick={() => pick(o)}
            disabled={picked !== null}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
