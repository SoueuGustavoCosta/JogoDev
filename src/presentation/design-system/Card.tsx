import type { ReactNode } from 'react';
import styles from './Card.module.css';

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className={styles.card}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
