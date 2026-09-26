import type { WeekNode } from '@/domain/traveler';
import styles from './TimelineNodes.module.css';

/**
 * A Linha do Tempo: uma linha de luz com 7 nós. Dias jogados em ciano, dias cobertos por
 * âncora em dourado tracejado, hoje pulsando em laranja (se ainda falta), futuro apagado.
 */
export function TimelineNodes({ nodes, caption }: { nodes: { label: string; state: WeekNode['state'] | 'anchor-goal' }[]; caption?: string }) {
  return (
    <div className={styles.root} role="img" aria-label={caption ?? nodes.map((n) => `${n.label}: ${STATE_LABEL[n.state]}`).join(', ')}>
      <div className={styles.line}>
        {nodes.map((n, i) => (
          <div key={i} className={styles.slot}>
            {i > 0 ? <span className={`${styles.link} ${n.state === 'played' || n.state === 'anchored' ? styles.linkOn : ''}`} /> : null}
            <span className={`${styles.node} ${styles[n.state.replace('-', '_')]}`} />
            <span className={`${styles.label} ${n.state === 'today' ? styles.labelToday : ''} ${n.state === 'anchor-goal' ? styles.labelGoal : ''}`}>
              {n.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATE_LABEL: Record<WeekNode['state'] | 'anchor-goal', string> = {
  played: 'jogado',
  anchored: 'coberto por âncora',
  today: 'hoje, falta jogar',
  missed: 'perdido',
  future: 'ainda não chegou',
  'anchor-goal': 'próxima âncora',
};
