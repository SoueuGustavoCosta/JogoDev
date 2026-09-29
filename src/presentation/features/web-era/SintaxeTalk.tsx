import { useEffect, useRef, useState } from 'react';
import { SintaxeFace } from '@/presentation/design-system';
import styles from './Stage.module.css';
import { reducedMotion } from './engines/types';

const CHAR_MS = 16;

/**
 * Balão da Senhorita Sintaxe com o texto "digitando". `auto`: as falas seguem sozinhas;
 * `tap`: um toque no balão completa a fala ou passa para a próxima. Com
 * `prefers-reduced-motion`, o texto aparece inteiro.
 */
export function SintaxeTalk({
  lines,
  mode = 'auto',
  size = 64,
  onLastLine,
}: {
  lines: readonly string[];
  mode?: 'auto' | 'tap';
  size?: number;
  /** Chamado quando a última fala termina de aparecer. */
  onLastLine?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(() => (reducedMotion() ? (lines[0] ?? '') : ''));
  const line = lines[index] ?? '';
  const typing = shown.length < line.length;
  const onLastRef = useRef(onLastLine);
  onLastRef.current = onLastLine;

  useEffect(() => {
    setIndex(0);
    setShown(reducedMotion() ? (lines[0] ?? '') : '');
  }, [lines]);

  useEffect(() => {
    if (!typing) {
      if (index === lines.length - 1) onLastRef.current?.();
      if (mode === 'auto' && index < lines.length - 1) {
        const t = window.setTimeout(() => {
          setIndex((i) => i + 1);
          setShown(reducedMotion() ? (lines[index + 1] ?? '') : '');
        }, 900);
        return () => window.clearTimeout(t);
      }
      return;
    }
    const t = window.setTimeout(() => setShown(line.slice(0, shown.length + 1)), CHAR_MS);
    return () => window.clearTimeout(t);
  }, [typing, shown, line, index, lines, mode]);

  const advance = () => {
    if (typing) setShown(line);
    else if (index < lines.length - 1) {
      setIndex(index + 1);
      setShown(reducedMotion() ? (lines[index + 1] ?? '') : '');
    }
  };

  const content = (
    <>
      <span className={styles.who}>Srta. Sintaxe</span>
      <span aria-hidden="true">
        {shown}
        {typing || (mode === 'tap' && index < lines.length - 1) ? <span className={styles.caret} /> : null}
      </span>
    </>
  );

  return (
    <div className={styles.talk}>
      <SintaxeFace size={size} className={styles.sx} />
      {mode === 'tap' ? (
        <button type="button" className={`${styles.bubble} ${styles.bubbleButton}`} onClick={advance}>
          {content}
          <span className={styles.srOnly}>(toque para avançar)</span>
        </button>
      ) : (
        <div className={styles.bubble}>{content}</div>
      )}
      {/* Leitor de tela recebe a fala inteira de uma vez, sem o efeito de digitação. */}
      <span className={styles.srOnly} aria-live="polite">
        {line}
      </span>
    </div>
  );
}
