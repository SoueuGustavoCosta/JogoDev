import type { ReactNode } from 'react';
import styles from './NotebookFrame.module.css';

/** A moldura "notebook" (tela de MacBook com barra de título e três bolinhas): a marca visual do projeto. */
export function NotebookFrame({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.mac}>
      <div className={styles.lid}>
        <div className={styles.screen}>
          <div className={styles.bar}>
            <i />
            <i />
            <i />
            <span className={styles.title}>{title}</span>
            {action ? <span className={styles.action}>{action}</span> : null}
          </div>
          <div className={styles.body}>{children}</div>
        </div>
      </div>
      <div className={styles.base} />
    </div>
  );
}
