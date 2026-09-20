import { useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { getTraveler, getTrailProgress } from '@/application/usecases';
import { trailRegistry } from '@/content/registry';
import { SUPPORT_COPY } from '@/domain/support';
import { LabIcon, MapIcon, Modal, MoreIcon, TravelerIcon } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { SupportModal } from '@/presentation/features/support';
import styles from './Layout.module.css';

function NavItem({ to, label, icon, end }: { to: string; label: string; icon: ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export function Layout() {
  const { progressRepository } = useServices();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const isMap = location.pathname === '/';
  const isPrologue = location.pathname === '/prologo';

  const hud = useMemo(() => {
    let xp = 0;
    let crystals = 0;
    for (const trail of trailRegistry) {
      const view = getTrailProgress({ repository: progressRepository }, { trail });
      xp += view.xp;
      crystals += trail.modules.filter((m) => view.trailProgress?.modules[m.id]?.completed).length;
    }
    return { xp, crystals, name: getTraveler({ repository: progressRepository }).name };
    // recalcula ao trocar de tela, quando o progresso pode ter mudado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressRepository, location.pathname]);

  if (isPrologue) return <Outlet />;

  return (
    <div className={styles.root}>
      <button type="button" className={styles.pix} onClick={() => setSupportOpen(true)} aria-label="Contribua com o meu Pix">
        <span aria-hidden="true">♥</span>
        Contribua com o meu Pix
      </button>
      <nav className={styles.nav} aria-label="Navegação principal">
        <NavItem to="/" end label="Mapa" icon={<MapIcon />} />
        <NavItem to="/configuracoes" label="Viajante" icon={<TravelerIcon />} />
        <NavItem to="/trilhas/banco-de-dados/laboratorio" label="Máquina" icon={<LabIcon />} />
        <button type="button" className={styles.navLink} onClick={() => setMoreOpen(true)}>
          <MoreIcon />
          <span>Mais</span>
        </button>
      </nav>

      {isMap ? (
        <Outlet />
      ) : (
        <div className={styles.column}>
          <header className={styles.top}>
            <Link to="/" className={styles.back}>
              ◂ Voltar ao mapa
            </Link>
            <Link to="/" className={styles.brand}>
              <span className={styles.brandDot} />
              Viajante {hud.name}
            </Link>
            <div className={styles.xp}>
              CRISTAIS <b>{hud.crystals}</b> · XP <b>{hud.xp}</b>
            </div>
          </header>
          <main className={styles.main}>
            <div key={location.pathname} className={styles.page}>
              <Outlet />
            </div>
          </main>
          <footer className={styles.footer}>
            <button type="button" className={styles.footerLink} onClick={() => setSupportOpen(true)}>
              {SUPPORT_COPY.footerLinkLabel}
            </button>
            {' · '}
            <Link to="/privacidade" className={styles.footerLink}>
              Privacidade
            </Link>
          </footer>
        </div>
      )}

      {moreOpen ? (
        <Modal title="Mais" onClose={() => setMoreOpen(false)}>
          <div className={styles.more}>
            <h2>Mais</h2>
            <Link to="/prologo" onClick={() => setMoreOpen(false)}>
              Refazer o prólogo / trocar meu nome
            </Link>
            <Link to="/configuracoes" onClick={() => setMoreOpen(false)}>
              Exportar / importar meu progresso
            </Link>
            <Link to="/privacidade" onClick={() => setMoreOpen(false)}>
              Privacidade
            </Link>
            <p>
              Se o mapa te ajudou e você quiser colaborar,{' '}
              <button
                type="button"
                className={styles.footerLink}
                onClick={() => {
                  setMoreOpen(false);
                  setSupportOpen(true);
                }}
              >
                {SUPPORT_COPY.footerLinkLabel.toLowerCase()}
              </button>
              .
            </p>
          </div>
        </Modal>
      ) : null}
      {supportOpen ? <SupportModal onClose={() => setSupportOpen(false)} /> : null}
    </div>
  );
}
