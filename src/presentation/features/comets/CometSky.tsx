import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSky, openCometCard } from '@/application/usecases';
import { formatCountdown, type Comet } from '@/domain/comets';
import { Modal } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { cometPoint, tailAngle } from './path';
import styles from './CometSky.module.css';

type Props = {
  calendar: readonly Comet[];
  /** Quantas trilhas cada cometa tem (pelo trailId), para o card. */
  trailCount: (trailId: string) => number;
};

/**
 * Céu do mapa (expansão Nexus; referência: docs/expansao/prototipos/prototipo_cometa.html).
 * O cometa fica numa camada por cima do mapa, na posição dada só pelo tempo. Anima apenas
 * `transform` e `opacity`; com `prefers-reduced-motion` ele fica parado, sem faíscas.
 */
export function CometSky({ calendar, trailCount }: Props) {
  const { analytics } = useServices();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 30_000);
    const onResize = () => setView({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => {
      window.clearInterval(tick);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const sky = getSky({ calendar, now });

  if (sky.kind !== 'comet') {
    return (
      <div className={styles.pill} role="status">
        <span aria-hidden="true">☄</span>{' '}
        {sky.kind === 'gap' ? <>Céu limpo. Próximo cometa em {formatCountdown(sky.untilMs)}</> : <>Novos cometas em breve</>}
        {' · '}
        <Link to="/arquivo">Arquivo da AVT</Link>
      </div>
    );
  }

  const { comet, progress, remainingMs, urgent } = sky;
  const at = cometPoint(progress);
  // Entra e sai suave nas pontas do caminho.
  const fade = Math.max(0.15, Math.min(1, progress * 12, (1 - progress) * 12));
  const trilhas = trailCount(comet.trailId);

  return (
    <>
      <div className={`${styles.layer} ${urgent ? styles.urgent : ''}`}>
        <button
          type="button"
          className={styles.comet}
          style={{ left: `${at.x}%`, top: `${at.y}%`, opacity: fade }}
          aria-label={`Cometa ${comet.name}: some da linha do tempo em ${formatCountdown(remainingMs)}. Toque para ver.`}
          onClick={() => {
            setOpen(true);
            openCometCard({ analytics }, { comet });
          }}
        >
          <span className={styles.shake}>
            <span className={styles.tail} style={{ transform: `rotate(${tailAngle(progress, view.w, view.h)}deg)` }}>
              <span className={styles.tailBody} />
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={styles.spark} style={{ animationDelay: `${i * 0.35}s`, top: `${(i % 2 ? -1 : 1) * (3 + i)}px` }} />
              ))}
            </span>
            <span className={styles.head} />
          </span>
        </button>
      </div>

      {open ? (
        <Modal title={`Cometa ${comet.name}`} onClose={() => setOpen(false)}>
          <div className={`${styles.card} ${urgent ? styles.urgent : ''}`}>
            <p className={styles.kicker}>{urgent ? 'Últimas horas no céu!' : 'Cometa de tecnologia'}</p>
            <h2>Cometa {comet.name}</h2>
            <p>{trilhas} trilhas. Some da linha do tempo em:</p>
            <p className={styles.countdown}>{formatCountdown(remainingMs)}</p>
            <p className={styles.small}>
              Vença o chefe enquanto ele está no céu para ganhar a insígnia rara. Depois, ele vai para o{' '}
              <Link to="/arquivo">Arquivo da AVT</Link>.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.enter} onClick={() => navigate(`/trilhas/${comet.trailId}`)}>
                Entrar no cometa ▸
              </button>
              <button type="button" className={styles.later} onClick={() => setOpen(false)}>
                Depois
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
