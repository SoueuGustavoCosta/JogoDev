import { useEffect } from 'react';
import type { StreakCheckIn } from '@/domain/traveler';
import { SintaxeFace } from '@/presentation/design-system';
import styles from './StreakCelebration.module.css';

const AUTO_CLOSE_MS = 5000;

function copyFor(checkIn: StreakCheckIn): { title: string; line: string } {
  const days = `${checkIn.current} ${checkIn.current === 1 ? 'dia' : 'dias'}`;
  if (checkIn.kind === 'started' || (checkIn.kind === 'restarted' && checkIn.best <= 1)) {
    return { title: 'Sua chama acendeu!', line: 'Primeiro dia da sequência. Volte amanhã pra ela crescer.' };
  }
  if (checkIn.kind === 'restarted') {
    return { title: 'A chama reacendeu!', line: `Seu recorde é de ${checkIn.best} dias. Bora bater?` };
  }
  if (checkIn.newRecord) {
    return { title: `${days} seguidos!`, line: 'Novo recorde pessoal. A Sintaxe está orgulhosa.' };
  }
  return { title: `${days} seguidos!`, line: 'Volte amanhã pra manter a chama acesa.' };
}

export function StreakCelebration({ checkIn, onClose }: { checkIn: StreakCheckIn; onClose: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onClose, AUTO_CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [onClose]);

  const { title, line } = copyFor(checkIn);

  return (
    <div className={styles.card} role="status" aria-live="polite">
      <SintaxeFace size={40} className={styles.face} />
      <span className={styles.flame} aria-hidden="true">
        🔥
      </span>
      <div className={styles.text}>
        <b className={styles.title}>{title}</b>
        <span className={styles.line}>{line}</span>
      </div>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
        ×
      </button>
    </div>
  );
}
