import { useState } from 'react';
import { getTimeline, resolveTimeline } from '@/application/usecases';
import type { TimelineStatus } from '@/domain/traveler';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './LineBranched.module.css';

function days(n: number): string {
  return n === 1 ? '1 dia' : `${n} dias`;
}

/**
 * "A linha ramificou" (mockup novo-6-f-ramificou): aparece ao abrir o app depois de perder
 * dia(s). Com âncoras que bastem, o viajante escolhe gastar ou recomeçar; sem elas, a linha
 * já ramificou (o Eco avançou) e a tela só explica. XP, insígnias e módulos nunca somem.
 */
export function LineBranched({ status, onClose }: { status: Extract<TimelineStatus, { kind: 'can-anchor' | 'broken' }>; onClose: () => void }) {
  const { progressRepository, leaderboard } = useServices();
  const [view] = useState(() => getTimeline({ repository: progressRepository }));
  const canAnchor = status.kind === 'can-anchor';

  function choose(choice: 'anchor' | 'restart') {
    resolveTimeline({ repository: progressRepository, leaderboard }, { choice });
    onClose();
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="ramificou-titulo">
      <div className={styles.panel}>
        <svg className={styles.art} viewBox="0 0 320 150" aria-hidden="true">
          <path d="M10 90 H150" className={styles.lineOn} />
          <path d="M150 90 C200 90 230 125 310 125" className={styles.lineOff} />
          <path d="M150 90 C190 80 220 50 262 42" className={styles.lineEco} />
          <circle cx="150" cy="90" r="10" className={styles.knot} />
          <g transform="translate(262 18)">
            <rect x="0" y="0" width="44" height="40" rx="9" className={styles.eco} />
            <circle cx="15" cy="16" r="3" className={styles.ecoEye} />
            <circle cx="29" cy="16" r="3" className={styles.ecoEye} />
            <path d="M13 30 Q22 23 31 30" className={styles.ecoMouth} />
            <text x="22" y="56" textAnchor="middle" className={styles.ecoLabel}>
              o Eco
            </text>
          </g>
        </svg>

        <h2 id="ramificou-titulo" className={styles.title}>
          A linha ramificou
        </h2>
        {canAnchor ? (
          <p className={styles.text}>
            Você ficou {days(status.missed)} sem consertar anomalia nem concluir lição, e o Eco tentou avançar. Seus{' '}
            {days(view.state.current)} ainda podem ser salvos.
          </p>
        ) : (
          <p className={styles.text}>
            Você ficou {days(status.missed)} sem jogar e o Eco avançou uma era. A linha recomeça do dia 1, mas XP, insígnias e
            módulos continuam todos seus.
          </p>
        )}

        {canAnchor ? (
          <div className={styles.anchor}>
            <span className={styles.anchorCount}>{view.state.anchors}</span>
            <span>
              <b>
                Você tem {view.state.anchors} {view.state.anchors === 1 ? 'Âncora Temporal' : 'Âncoras Temporais'}
              </b>
              <small>{status.missed === 1 ? 'Uma âncora cobre o dia perdido' : `Cobre os ${status.missed} dias perdidos`}</small>
            </span>
          </div>
        ) : null}

        <div className={styles.actions}>
          {canAnchor ? (
            <button type="button" className={styles.gold} onClick={() => choose('anchor')}>
              Usar a âncora
            </button>
          ) : null}
          <button type="button" className={styles.ghost} onClick={() => (canAnchor ? choose('restart') : onClose())}>
            Recomeçar do dia 1
          </button>
        </div>
      </div>
    </div>
  );
}
