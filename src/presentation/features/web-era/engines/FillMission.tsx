import { useMemo, useRef, useState } from 'react';
import { buildCodePreview, fillTemplate, isFillAnswer, type FillMission as Fill } from '@/domain/webEra';
import styles from '../Stage.module.css';
import { shuffle, type EngineProps } from './types';

const MAX_ERR = 3;

/** Completar a lacuna: toque na peça que falta e veja a prévia mudar na hora. */
export function FillMission({ mission, api, travelerName }: EngineProps<Fill>) {
  const t = (s: string) => fillTemplate(s, travelerName);
  const options = useMemo(() => shuffle(mission.options), [mission]);
  const pre = t(mission.pre);
  const post = t(mission.post);
  const html = mission.html === undefined ? undefined : t(mission.html);
  const [chosen, setChosen] = useState<string | null>(null);
  const [wrongs, setWrongs] = useState<ReadonlySet<string>>(new Set());
  const frameRef = useRef<HTMLIFrameElement>(null);
  const src = pre + (chosen === null ? '' : t(chosen)) + post;

  const onLoad = () => {
    const frame = frameRef.current;
    if (chosen === null || !frame?.contentDocument || !frame.contentWindow) return;
    if (mission.capture) {
      try {
        api.capture(mission.capture({ win: frame.contentWindow, doc: frame.contentDocument, src }));
      } catch {
        // Guardar no portfólio é um extra: a missão continua vencida.
      }
    }
    api.ok();
    window.setTimeout(api.win, 1000);
  };

  const pick = (option: string) => {
    if (chosen !== null || wrongs.has(option)) return;
    if (isFillAnswer(mission, option)) {
      setChosen(option);
      return;
    }
    const next = new Set(wrongs).add(option);
    setWrongs(next);
    api.err();
    if (next.size >= MAX_ERR) api.fail('Peça errada 3 vezes');
  };

  return (
    <>
      <pre className={styles.fillcode}>
        {pre}
        <span className={`${styles.gap} ${chosen !== null ? styles.gapOk : ''}`}>{chosen === null ? '___' : t(chosen)}</span>
        {post}
      </pre>
      <div className={styles.chips}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            className={`${styles.tok} ${chosen === o ? styles.tokGood : ''} ${wrongs.has(o) ? styles.tokBad : ''}`}
            onClick={() => pick(o)}
            disabled={wrongs.has(o) || chosen !== null}
          >
            {t(o)}
          </button>
        ))}
      </div>
      <iframe
        ref={frameRef}
        className={`${styles.preview} ${mission.narrow ? styles.narrow : ''}`}
        title="Prévia ao vivo"
        srcDoc={buildCodePreview({ lang: mission.lang, html }, src)}
        onLoad={onLoad}
      />
      <div className={styles.score}>
        <span>
          erros <b>{wrongs.size}/{MAX_ERR}</b>
        </span>
        <span>toque na peça que falta</span>
      </div>
    </>
  );
}
