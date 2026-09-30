import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { SintaxeFace } from '@/presentation/design-system';
import styles from './Stage.module.css';
import { reducedMotion } from './engines/types';

/** Velocidade da digitação (antes 16 ms: rápido demais para ler). */
const CHAR_MS = 32;

/**
 * Balão da Senhorita Sintaxe com o texto "digitando". A fala só avança com toque, clique,
 * Enter ou Espaço (nunca sozinha); tocar enquanto digita mostra a fala inteira na hora.
 * Com `prefers-reduced-motion`, o texto aparece inteiro.
 */
export function SintaxeTalk({
  lines,
  size = 64,
  onLastLine,
}: {
  lines: readonly string[];
  size?: number;
  /** Chamado quando a última fala termina de aparecer. */
  onLastLine?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(() => (reducedMotion() ? (lines[0] ?? '') : ''));
  const line = lines[index] ?? '';
  const typing = shown.length < line.length;
  const hasMore = index < lines.length - 1;
  const onLastRef = useRef(onLastLine);
  onLastRef.current = onLastLine;

  useEffect(() => {
    setIndex(0);
    setShown(reducedMotion() ? (lines[0] ?? '') : '');
  }, [lines]);

  useEffect(() => {
    if (!typing) {
      if (!hasMore) onLastRef.current?.();
      return;
    }
    const t = window.setTimeout(() => setShown(line.slice(0, shown.length + 1)), CHAR_MS);
    return () => window.clearTimeout(t);
  }, [typing, shown, line, hasMore]);

  const advance = () => {
    if (typing) setShown(line);
    else if (hasMore) {
      setIndex(index + 1);
      setShown(reducedMotion() ? (lines[index + 1] ?? '') : '');
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      advance();
    }
  };

  // Um balão só com uma fala que já apareceu inteira não precisa de toque.
  const interactive = lines.length > 1 || typing;

  return (
    <div className={styles.talk}>
      <SintaxeFace size={size} className={styles.sx} />
      <div
        className={`${styles.bubble} ${interactive ? styles.bubbleButton : ''}`}
        onClick={interactive ? advance : undefined}
        onKeyDown={interactive ? onKeyDown : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
      >
        <span className={styles.who}>Srta. Sintaxe</span>
        <span aria-hidden="true">
          {shown}
          {typing ? <span className={styles.caret} /> : null}
        </span>
        {!typing && hasMore ? (
          <span className={styles.more} aria-hidden="true">
            toque para continuar ▸
          </span>
        ) : null}
        {interactive ? <span className={styles.srOnly}>(toque para avançar)</span> : null}
      </div>
      {/* Leitor de tela recebe a fala inteira de uma vez, sem o efeito de digitação. */}
      <span className={styles.srOnly} aria-live="polite">
        {line}
      </span>
    </div>
  );
}
