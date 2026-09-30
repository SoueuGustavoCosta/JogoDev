import { useMemo } from 'react';
import type { OrderMission as Order, PortalMission as Portal } from '@/domain/webEra';
import styles from '../Stage.module.css';
import { OrderMission } from './OrderMission';
import type { EngineProps } from './types';

/**
 * Portal instável: as peças na ordem antes que o portal feche. O anel encolhe junto com a
 * barra de tempo do palco (variável CSS `--tf`, de 1 a 0).
 */
export function PortalMission(props: EngineProps<Portal>) {
  // Objeto estável: um novo a cada render reembaralharia as peças do OrderMission.
  const order = useMemo<Order>(() => ({ ...props.mission, type: 'order' }), [props.mission]);
  return (
    <>
      <div className={styles.portalBox} aria-hidden="true">
        <div className={styles.pring} />
        <span>portal instável</span>
      </div>
      <OrderMission {...props} mission={order} />
    </>
  );
}
