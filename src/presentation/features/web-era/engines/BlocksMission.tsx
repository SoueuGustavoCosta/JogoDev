import { useMemo, useRef, useState } from 'react';
import { blocksSource, buildCodePreview, fillTemplate, type BlocksMission as Blocks } from '@/domain/webEra';
import styles from '../Stage.module.css';
import { shuffle, type EngineProps } from './types';

const MAX_ERR = 3;

/**
 * Montar código com blocos (estilo Duolingo): toque nas peças na ordem, sem digitar nada. A
 * prévia ao vivo mostra o resultado a cada peça; no fim, o que foi montado vai pro portfólio.
 */
export function BlocksMission({ mission, api, travelerName }: EngineProps<Blocks>) {
  const t = (s: string) => fillTemplate(s, travelerName);
  const tokens = useMemo(() => mission.tokens.map((s) => fillTemplate(s, travelerName)), [mission, travelerName]);
  const pool = useMemo(
    () => shuffle([...tokens, ...(mission.extra ?? []).map((s) => fillTemplate(s, travelerName))]),
    [tokens, mission, travelerName],
  );
  const pre = t(mission.pre ?? '');
  const post = t(mission.post ?? '');
  const [used, setUsed] = useState<ReadonlySet<number>>(new Set());
  const [pos, setPos] = useState(0);
  const [errs, setErrs] = useState(0);
  const [wrong, setWrong] = useState<{ k: number; n: number } | null>(null);
  const [tabTitle, setTabTitle] = useState('Documento sem título');
  const frameRef = useRef<HTMLIFrameElement>(null);
  const done = pos === tokens.length;
  const src = blocksSource({ ...mission, pre, post }, tokens.slice(0, pos));

  const onLoad = () => {
    const frame = frameRef.current;
    if (!frame?.contentDocument || !frame.contentWindow) return;
    if (mission.tab) setTabTitle(frame.contentDocument.title || 'Documento sem título');
    if (!done) return;
    if (mission.capture) {
      try {
        api.capture(mission.capture({ win: frame.contentWindow, doc: frame.contentDocument, src }));
      } catch {
        // Guardar no portfólio é um extra: a missão continua vencida.
      }
    }
    api.ok();
    window.setTimeout(api.win, 900);
  };

  const tap = (k: number) => {
    if (done || used.has(k)) return;
    if (pool[k] === tokens[pos]) {
      setPos(pos + 1);
      setUsed((u) => new Set(u).add(k));
      return;
    }
    const e = errs + 1;
    setErrs(e);
    setWrong((w) => ({ k, n: (w?.n ?? 0) + 1 }));
    api.err();
    if (e >= MAX_ERR) api.fail('Bloco errado 3 vezes');
  };

  return (
    <>
      {pre ? <pre className={styles.ctx}>{pre}</pre> : null}
      <div className={`${styles.slots} ${mission.block ? styles.block : ''}`} aria-live="polite">
        {pos === 0 ? <span className={styles.slotsEmpty}>toque nos blocos abaixo, na ordem certa</span> : null}
        {tokens.slice(0, pos).map((tok, i) => (
          <span key={i} className={`${styles.tok} ${styles.placed}`}>
            {tok}
          </span>
        ))}
      </div>
      {post ? <pre className={styles.ctx}>{post}</pre> : null}
      <div className={styles.pool}>
        {pool.map((tok, k) => (
          <button
            key={wrong?.k === k ? `${k}-${wrong.n}` : k}
            type="button"
            className={`${styles.tok} ${used.has(k) ? styles.used : ''} ${wrong?.k === k ? styles.shake : ''}`}
            onClick={() => tap(k)}
            disabled={used.has(k)}
          >
            {tok}
          </button>
        ))}
      </div>
      {mission.tab ? (
        <div className={styles.tabbar}>
          <i aria-hidden="true" />
          <span>{tabTitle}</span>
        </div>
      ) : null}
      <iframe
        ref={frameRef}
        className={`${styles.preview} ${mission.narrow ? styles.narrow : ''}`}
        title="Prévia ao vivo"
        srcDoc={buildCodePreview(mission, src)}
        onLoad={onLoad}
      />
      <div className={styles.score}>
        <span>
          erros <b>{errs}/{MAX_ERR}</b>
        </span>
        <span>
          {pos}/{tokens.length}
        </span>
      </div>
    </>
  );
}
