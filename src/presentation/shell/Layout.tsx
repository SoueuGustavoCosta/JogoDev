import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { checkInDaily, getPresence, getProfileSummary, sendHeartbeat } from '@/application/usecases';
import type { ProfileSummary } from '@/application/usecases';
import type { OnlinePlayer } from '@/application/ports';
import { trailRegistry } from '@/content/registry';
import { badgeCatalog } from '@/content/badges/catalog';
import { SUPPORT_COPY } from '@/domain/support';
import { LabIcon, MapIcon, Modal, MoreIcon, TravelerIcon } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { SupportModal } from '@/presentation/features/support';
import { ProfileHeader } from './ProfileHeader';
import styles from './Layout.module.css';

/** Batimento de presença ("estou aqui"): a cada ~90s enquanto o app está aberto. */
const HEARTBEAT_INTERVAL_MS = 90_000;

export type LayoutOutletContext = { summary: ProfileSummary; onlinePlayers: OnlinePlayer[] };

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
  const { progressRepository, leaderboard } = useServices();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);

  const isMap = location.pathname === '/';
  const isPrologue = location.pathname === '/prologo';

  const summary = useMemo(
    () => getProfileSummary({ repository: progressRepository }, { trails: trailRegistry, badgeCatalog }),
    // recalcula ao trocar de tela, quando o progresso pode ter mudado
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progressRepository, location.pathname],
  );

  // Check-in diário (uma vez por sessão do app) + batimento de presença (uma vez já,
  // depois a cada ~90s). Fica aqui porque Layout é o elemento de rota pai — persiste
  // durante toda a navegação, só remonta se o app inteiro recarregar.
  useEffect(() => {
    checkInDaily({ repository: progressRepository, leaderboard });

    const refreshPresence = () => {
      sendHeartbeat({ repository: progressRepository, leaderboard });
      getPresence({ leaderboard })
        .then(setOnlinePlayers)
        .catch(() => {
          // Leitura pode falhar (rede fora do ar, projeto pausado): mantém a lista anterior.
        });
    };
    refreshPresence();
    const id = window.setInterval(refreshPresence, HEARTBEAT_INTERVAL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isPrologue) return <Outlet />;

  return (
    <div className={styles.root}>
      <button type="button" className={styles.pix} onClick={() => setSupportOpen(true)} aria-label="Contribua com o meu Pix">
        Pix
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
        <Outlet context={{ summary, onlinePlayers } satisfies LayoutOutletContext} />
      ) : (
        <div className={styles.column}>
          <header className={styles.top}>
            <Link to="/" className={styles.back}>
              ◂ Voltar ao mapa
            </Link>
            <ProfileHeader summary={summary} onlinePlayers={onlinePlayers} />
          </header>
          <main className={styles.main}>
            <div key={location.pathname} className={styles.page}>
              <Outlet context={{ summary, onlinePlayers } satisfies LayoutOutletContext} />
            </div>
          </main>
          <footer className={styles.footer}>
            <button type="button" className={styles.footerLink} onClick={() => setSupportOpen(true)}>
              {SUPPORT_COPY.footerLinkLabel}
            </button>
          </footer>
        </div>
      )}

      {moreOpen ? (
        <Modal title="Mais" onClose={() => setMoreOpen(false)}>
          <div className={styles.more}>
            <section className={styles.moreSection}>
              <h3>Perfil</h3>
              <Link to="/configuracoes" onClick={() => setMoreOpen(false)}>
                Exportar / importar meu progresso
              </Link>
              <Link to="/prologo" onClick={() => setMoreOpen(false)}>
                Refazer o prólogo / trocar meu nome
              </Link>
              <Link to="/insignias" onClick={() => setMoreOpen(false)}>
                Meu passaporte de insígnias
              </Link>
            </section>

            <section className={styles.moreSection}>
              <h3>Comunidade</h3>
              <Link to="/hall" onClick={() => setMoreOpen(false)}>
                Hall dos Viajantes
              </Link>
            </section>

            <section className={styles.moreSection}>
              <h3>Projeto</h3>
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
            </section>
          </div>
        </Modal>
      ) : null}
      {supportOpen ? <SupportModal onClose={() => setSupportOpen(false)} /> : null}
    </div>
  );
}
