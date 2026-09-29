import { Link } from 'react-router-dom';
import type { Trail } from '@/domain/trail';
import { SintaxeFace } from '@/presentation/design-system';
import styles from './NexusScene.module.css';

/**
 * Tela de uma Ramificação ainda fechada (ver `getBranchLock`): quem chega pelo endereço antes
 * de vencer o chefe da lua vê esta explicação em vez da trilha.
 */
export function BranchGate({ trail, island }: { trail: Trail; island: Trail | undefined }) {
  return (
    <article className={styles.gate}>
      <p className="eyebrow">{trail.eyebrow}</p>
      <h1>{trail.title}</h1>
      <div className={styles.sintaxe}>
        <SintaxeFace size={40} />
        <p>
          Este portal ainda está fechado, Viajante. Ele só abre quando você vencer{' '}
          <b>{island?.bossFight?.bossName ?? 'o chefe'}</b> na {island?.title ?? 'lua'}: é aí que a linha do tempo se ramifica.
        </p>
      </div>
      {island ? (
        <Link to={`/trilhas/${island.id}`} className={styles.gateLink}>
          Ir para a {island.title} ▸
        </Link>
      ) : null}
    </article>
  );
}
