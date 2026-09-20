import type { ReactNode } from 'react';
import styles from './NotebookFrame.module.css';

/** A moldura estilo MacBook (barra de título + três bolinhas) que é a marca visual do projeto. */
export function NotebookFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.frame}>
      <div className={styles.titlebar}>
        <span className={`${styles.dot} ${styles.dotRed}`} />
        <span className={`${styles.dot} ${styles.dotYellow}`} />
        <span className={`${styles.dot} ${styles.dotGreen}`} />
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
