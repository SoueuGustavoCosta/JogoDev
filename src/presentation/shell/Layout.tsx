import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  backupProgress,
  bootstrapTravelerIdentity,
  getLooksOf,
  getPresence,
  getLessonMode,
  getProfileSummary,
  getTraveler,
  needsSignInAgain,
  openTimeline,
  sendHeartbeat,
} from '@/application/usecases';
import type { ProfileSummary } from '@/application/usecases';
import type { OnlinePlayer } from '@/application/ports';
import { trailRegistry } from '@/content/registry';
import { badgeCatalog } from '@/content/badges/catalog';
import { cosmetics } from '@/content/cosmetics';
import type { AvatarLook } from '@/domain/cosmetics';
import { SUPPORT_COPY } from '@/domain/support';
import { DEFAULT_LESSON_MODE } from '@/config/exploration';
import type { TimelineStatus } from '@/domain/traveler';
import { HallIcon, HomeIcon, MapIcon, TravelerIcon } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { SupportModal } from '@/presentation/features/support';
import { AccountSheetProvider } from '@/presentation/features/account';
import { ProfileHeader } from './ProfileHeader';
import { LineBranched } from './LineBranched';
import styles from './Layout.module.css';

/** Batimento de presença ("estou aqui"): a cada ~90s enquanto o app está aberto. */
const HEARTBEAT_INTERVAL_MS = 90_000;

const FULL_SCREEN_PATHS = new Set(['/prologo', '/entrar', '/cadastro', '/esqueci-senha', '/conta']);

export type LayoutOutletContext = {
  summary: ProfileSummary;
  onlinePlayers: OnlinePlayer[];
  /** Cosméticos de quem está online, por uuid (Etapa 9). */
  onlineLooks: Record<string, AvatarLook>;
  /** Recalcula o resumo do cabeçalho sem trocar de tela (ex.: depois de comprar na Loja). */
  refreshSummary: () => void;
};

function NavItem({
  to,
  label,
  icon,
  end,
  alert,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  /** Pontinho discreto de "precisa de atenção" (ex.: sessão da conta expirou), sem cobrir nada. */
  alert?: string;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={alert ? `${label} (${alert})` : undefined}
      className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
    >
      <span className={styles.navIcon}>
        {icon}
        {alert ? <i className={styles.navAlert} aria-hidden="true" /> : null}
      </span>
      <span>{label}</span>
    </NavLink>
  );
}

/** Rota de um salto (módulo): ele desenha o próprio cabeçalho compacto de uma linha. */
const MODULE_PATH = /^\/trilhas\/[^/]+\/modulos\/[^/]+\/?$/;

export function Layout() {
  const { progressRepository, leaderboard } = useServices();
  const location = useLocation();
  const [supportOpen, setSupportOpen] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  // Linha do Tempo conferida ao abrir (uma vez por sessão): dia perdido abre "A linha ramificou".
  const [branch, setBranch] = useState<Extract<TimelineStatus, { kind: 'can-anchor' | 'broken' }> | null>(null);
  const closeBranch = useCallback(() => setBranch(null), []);

  const isMap = location.pathname === '/mapa';
  const isHome = location.pathname === '/';
  // Telas cheias, sem navegação nem cabeçalho do viajante: o prólogo e as telas de conta.
  const isFullScreen = FULL_SCREEN_PATHS.has(location.pathname);
  const isModule = MODULE_PATH.test(location.pathname);
  // Lição em telas curtas: tela cheia, sem a navegação do app (o × da lição leva de volta à era).
  const lessonFullScreen =
    isModule && getLessonMode({ repository: progressRepository }, { fallback: DEFAULT_LESSON_MODE }) === 'telas';

  const [summaryVersion, setSummaryVersion] = useState(0);
  const refreshSummary = useCallback(() => setSummaryVersion((v) => v + 1), []);
  const [onlineLooks, setOnlineLooks] = useState<Record<string, AvatarLook>>({});
  const summary = useMemo(
    () => getProfileSummary({ repository: progressRepository }, { trails: trailRegistry, badgeCatalog, cosmetics }),
    // recalcula ao trocar de tela, quando o progresso pode ter mudado
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progressRepository, location.pathname, summaryVersion],
  );

  // Sessão da conta perdida: aviso discreto na aba Viajante (lá fica o "Entrar de novo").
  const sessionExpired = useMemo(
    () => needsSignInAgain({ repository: progressRepository }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progressRepository, location.pathname],
  );

  // Só quem passou pelo prólogo (nome escolhido ou "Pular") vira viajante no Supabase:
  // quem abre o link e fecha, ou um robô de pré-visualização, não cria conta anônima nem
  // aparece no Hall. Relido a cada troca de tela, pra ligar assim que o prólogo terminar.
  const prologueSeen = useMemo(
    () => getTraveler({ repository: progressRepository }).prologueSeen,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progressRepository, location.pathname],
  );

  // Identidade (login anônimo do Supabase, ver `bootstrapTravelerIdentity`) + check-in
  // diário (uma vez por sessão do app) + batimento de presença (uma vez já, depois a
  // cada ~90s), que também carrega o backup silencioso do progresso completo (ver
  // `backupProgress`). Fica aqui porque Layout é o elemento de rota pai — persiste
  // durante toda a navegação, só remonta se o app inteiro recarregar.
  useEffect(() => {
    if (!prologueSeen) return;
    let cancelled = false;

    const refreshPresence = () => {
      sendHeartbeat({ repository: progressRepository, leaderboard });
      void backupProgress({ repository: progressRepository, leaderboard });
      getPresence({ leaderboard })
        .then((players) => {
          if (cancelled) return;
          setOnlinePlayers(players);
          void getLooksOf({ leaderboard }, { uuids: players.map((p) => p.uuid), catalog: cosmetics }).then((looks) => {
            if (!cancelled) setOnlineLooks(looks);
          });
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
      // Abrir o app não conta como dia jogado (Etapa 8); só confere a linha e sincroniza.
      const status = openTimeline({ repository: progressRepository, leaderboard });
      if (status.kind === 'can-anchor' || status.kind === 'broken') setBranch(status);
      refreshPresence();
    });

    const id = window.setInterval(refreshPresence, HEARTBEAT_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prologueSeen]);

  // A gaveta de conta (Entrar / Criar conta) abre por cima de qualquer tela, sem trocar de rota.
  if (isFullScreen) {
    return (
      <AccountSheetProvider>
        <Outlet />
      </AccountSheetProvider>
    );
  }

  return (
    <AccountSheetProvider>
      <div className={styles.root}>
        {lessonFullScreen ? null : (
          <nav className={styles.nav} aria-label="Navegação principal">
            <NavItem to="/" end label="Início" icon={<HomeIcon />} />
            <NavItem to="/mapa" label="Mapa" icon={<MapIcon />} />
            {/* A Liga semanal chega na Etapa 10; até lá a aba abre o Hall dos Viajantes. */}
            <NavItem to="/hall" label="Liga" icon={<HallIcon />} />
            <NavItem
              to="/configuracoes"
              label="Viajante"
              icon={<TravelerIcon />}
              alert={sessionExpired ? 'entre de novo na sua conta' : undefined}
            />
          </nav>
        )}

        {isMap || lessonFullScreen ? (
          <Outlet context={{ summary, onlinePlayers, onlineLooks, refreshSummary } satisfies LayoutOutletContext} />
        ) : (
          <div className={styles.column}>
            {/* Dentro de um salto, o perfil e os contadores saem da frente (continuam na aba Viajante). */}
            {isModule ? null : (
              <header className={styles.top}>
                {isHome ? null : (
                  <Link to="/mapa" className={styles.back}>
                    ◂ Voltar ao mapa
                  </Link>
                )}
                <ProfileHeader summary={summary} onlinePlayers={onlinePlayers} onlineLooks={onlineLooks} hideStreak={isHome} />
              </header>
            )}
            <main className={`${styles.main} ${isModule ? styles.mainBare : ''}`}>
              <div key={location.pathname} className={styles.page}>
                <Outlet context={{ summary, onlinePlayers, onlineLooks, refreshSummary } satisfies LayoutOutletContext} />
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

        {/* A linha ramificou: única tela que pode aparecer por cima do hub (é sobre o dia perdido). */}
        {branch && !lessonFullScreen ? <LineBranched status={branch} onClose={closeBranch} /> : null}

        {supportOpen ? <SupportModal onClose={() => setSupportOpen(false)} /> : null}
      </div>
    </AccountSheetProvider>
  );
}
