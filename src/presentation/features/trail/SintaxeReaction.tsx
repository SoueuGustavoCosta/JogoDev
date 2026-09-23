import { useEffect } from 'react';
import { playCorrectSound, playWrongSound, SintaxeFace } from '@/presentation/design-system';
import styles from './SintaxeReaction.module.css';

/**
 * A Sintaxe reagindo a cada resposta do quiz: expressão muda (feliz/triste) e toca um
 * "ding"/"vups" curto (`sound.ts`, sintetizado — sem arquivo de áudio), do jeito que o
 * autor pediu pra deixar o quiz menos "didático e cansativo" e mais parecido com
 * Duolingo. `signal` deve mudar a cada tentativa nova (mesmo quando o tipo continua
 * "wrong" de novo), pra tocar o som e reiniciar a animação em cada uma.
 */
export function SintaxeReaction({
  type,
  signal,
  xpGained = 0,
}: {
  type: 'correct' | 'wrong' | null;
  signal: number;
  /** XP ganho nesta resposta; > 0 mostra o "+100 XP" subindo ao lado da Sintaxe. */
  xpGained?: number;
}) {
  useEffect(() => {
    if (type === 'correct') playCorrectSound();
    else if (type === 'wrong') playWrongSound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);

  const expression = type === 'wrong' ? 'sad' : type === 'correct' ? 'happy' : 'neutral';
  const pulseClass = type === 'correct' ? styles.correct : type === 'wrong' ? styles.wrong : '';

  return (
    <div className={styles.root} aria-hidden="true">
      <SintaxeFace key={signal} size={48} expression={expression} className={`${styles.face} ${pulseClass}`} />
      {xpGained > 0 ? (
        <span key={`xp-${signal}`} className={styles.xp}>
          +{xpGained} XP
        </span>
      ) : null}
    </div>
  );
}
