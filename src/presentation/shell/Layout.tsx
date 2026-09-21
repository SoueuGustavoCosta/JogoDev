import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  backupProgress,
  bootstrapTravelerIdentity,
  checkInDaily,
  getPresence,
  getProfileSummary,
  sendHeartbeat,
} from '@/application/usecases';
import type { ProfileSummary } from '@/application/usecases';
import type { OnlinePlayer } from '@/application/ports';
import { trailRegistry } from '@/content/registry';
import { badgeCatalog } from '@/content/badges/catalog';
import { SUPPORT_COPY } from '@/domain/support';
import { HallIcon, MapIcon, TravelerIcon } from '@/presentation/design-system';
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

  // Identidade (login anônimo do Supabase, ver `bootstrapTravelerIdentity`) + check-in
  // diário (uma vez por sessão do app) + batimento de presença (uma vez já, depois a
  // cada ~90s), que também carrega o backup silencioso do progresso completo (ver
  // `backupProgress`). Fica aqui porque Layout é o elemento de rota pai — persiste
  // durante toda a navegação, só remonta se o app inteiro recarregar.
  useEffect(() => {
    let cancelled = false;

    const refreshPresence = () => {
      sendHeartbeat({ repository: progressRepository, leaderboard });
      backupProgress({ repository: progressRepository, leaderboard });
      getPresence({ leaderboard })
        .then((players) => {
          if (!cancelled) setOnlinePlayers(players);
        })
        .catch(() => {
          // Leitura pode falhar (rede fora do ar, projeto pausado): mantém a lista anterior.
        });
    };

    // Aguarda a identidade real (ou a falha silenciosa dela) antes do primeiro check-in/
    // batimento, para que já usem o `auth.uid()` assim que possível nesta sessão — sem
    // travar a tela: nada aqui é aguardado por fora deste efeito, e o app já é 100%
    // navegável enquanto isto roda em segundo plano.
    bootstrapTravelerIdentity({ repository: progressRepository, leaderboard }).finally(() => {
      if (cancelled) return;
      checkInDaily({ repository: progressRepository, leaderboard });
      refreshPresence();
    });

    const id = window.setInterval(refreshPresence, HEARTBEAT_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
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
        <NavItem to="/hall" label="Hall dos Viajantes" icon={<HallIcon />} />
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
            {' · '}
            <Link className={styles.footerLink} to="/privacidade">
              Privacidade
            </Link>
          </footer>
        </div>
      )}

      {supportOpen ? <SupportModal onClose={() => setSupportOpen(false)} /> : null}
    </div>
  );
}
