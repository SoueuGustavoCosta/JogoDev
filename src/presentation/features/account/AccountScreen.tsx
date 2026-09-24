import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Account.module.css';

/** Moldura comum das telas de conta (entrar, criar conta, esqueci a senha, escolha). */
export function AccountScreen({
  title,
  children,
  backTo = '/',
  backLabel = '◂ Voltar ao jogo',
}: {
  title: string;
  children: ReactNode;
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <div className={styles.root}>
      <header className={styles.top}>
        <Link to="/" className={styles.brand}>
          Viajante do Tempo
        </Link>
        <Link to={backTo} className={styles.back}>
          {backLabel}
        </Link>
      </header>
      <main className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        {children}
      </main>
    </div>
  );
}
