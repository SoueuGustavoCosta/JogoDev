import { Link } from 'react-router-dom';
import { formatCountdown, type Comet } from '@/domain/comets';
import type { Trail } from '@/domain/trail';
import { SintaxeFace } from '@/presentation/design-system';
import styles from './ArchivePage.module.css';

/** Trilha de um cometa que ainda não chegou ao céu (ver `getCometLock`). */
export function CometGate({ trail, comet, now = new Date() }: { trail: Trail; comet: Comet; now?: Date }) {
  return (
    <article className={styles.page}>
      <p className="eyebrow">{trail.eyebrow}</p>
      <h1>{trail.title}</h1>
      <div className={styles.sintaxe}>
        <SintaxeFace size={40} />
        <p>
          Calma, Viajante: o <b>Cometa {comet.name}</b> ainda não entrou na linha do tempo. Ele chega em{' '}
          {formatCountdown(Date.parse(comet.from) - now.getTime())}. Fique de olho no céu do mapa.
        </p>
      </div>
      <Link to="/mapa" className={styles.play}>
        Voltar ao mapa ▸
      </Link>
    </article>
  );
}
