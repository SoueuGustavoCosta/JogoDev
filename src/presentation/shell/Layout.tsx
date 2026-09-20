import { useState, type ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { SUPPORT_COPY } from '@/domain/support';
import { SupportModal } from '@/presentation/features/support';
import styles from './Layout.module.css';

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export function Layout({ children }: { children?: ReactNode }) {
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <div className={styles.root}>
      <nav className={styles.nav} aria-label="Navegação principal">
        <NavItem to="/" label="Início" icon="🗺️" />
        <NavItem to="/trilhas/banco-de-dados" label="Ilha atual" icon="🏝️" />
        <NavItem to="/trilhas/banco-de-dados/laboratorio" label="Laboratório" icon="🧪" />
        <NavItem to="/configuracoes" label="Mais" icon="⚙️" />
      </nav>
      <main className={styles.main}>
        {children ?? <Outlet />}
        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.footerLink}
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
            onClick={() => setSupportOpen(true)}
          >
            {SUPPORT_COPY.footerLinkLabel}
          </button>
        </footer>
      </main>
      {supportOpen ? <SupportModal onClose={() => setSupportOpen(false)} /> : null}
    </div>
  );
}
