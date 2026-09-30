import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getTraveler, markWebEraIntroSeen, openWebEra } from '@/application/usecases';
import {
  areAllMoonsDone,
  areMoonsOpen,
  eraTrailsDone,
  isEcoDefeated,
  isEcoUnlocked,
  isEraTrailUnlocked,
  isMoonDone,
  isWebStageDone,
  moonTrailsDone,
  portfolioPercent,
  webStageXp,
} from '@/domain/webEra';
import { webEraCopy, webEraGems, webEraTrails, webMoons } from '@/content/webEra';
import { GemBadge, Toast } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { BadgeShelf } from './BadgeShelf';
import { PortalPath, type PortalNode } from './PortalPath';
import { PortfolioDrawer } from './PortfolioDrawer';
import { SintaxeTalk } from './SintaxeTalk';
import { StageRunner } from './StageRunner';
import { ecoStage, eraTrailStage } from './stages';
import { useWebEraScreen } from './useWebEraScreen';
import { WebNexus } from './WebNexus';
import stage from './Stage.module.css';
import styles from './WebEra.module.css';

/**
 * Era da Web: só a trilha da era (10 trilhas em sequência + o chefe Eco), o portfólio que o
 * viajante constrói e a estante de insígnias. As luas nascem do Eco e orbitam o portal no
 * mapa principal; as Ramificações aparecem aqui quando as três luas caem.
 */
export function WebEraPage() {
  const { progressRepository, analytics } = useServices();
  const screen = useWebEraScreen();
  const { web, travelerName, badgesEarned, nexusSeen } = screen.view;
  const [introOpen, setIntroOpen] = useState(() => !web.introSeen);
  const [introReady, setIntroReady] = useState(false);
  const shelfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    openWebEra({ analytics });
  }, [analytics]);

  if (!getTraveler({ repository: progressRepository }).prologueSeen) return <Navigate to="/prologo" replace />;

  if (introOpen) {
    return (
      <div className={`${styles.page} ${styles.intro}`}>
        <p className={styles.docl}>Jogo do Desenvolvedor · nova era</p>
        <h1>
          <span className={styles.g1}>Era</span>
          <span className={styles.g2}>da</span>
          <span className={styles.g3}>Web</span>
        </h1>
        <SintaxeTalk lines={webEraCopy.intro} onLastLine={() => setIntroReady(true)} />
        <p className={styles.docl}>Toque no balão para avançar.</p>
        <div className={styles.row}>
          <button
            type="button"
            className={`${stage.btn} ${stage.hot}`}
            onClick={() => {
              markWebEraIntroSeen({ repository: progressRepository });
              setIntroOpen(false);
              screen.refresh();
            }}
          >
            {introReady ? `Entrar na Era, ${travelerName}` : 'Pular e entrar na Era'}
          </button>
        </div>
      </div>
    );
  }

  const done = eraTrailsDone(webEraTrails, web);
  const next = webEraTrails.find((t) => !isWebStageDone(web, t.id));
  const ecoOpen = isEcoUnlocked(webEraTrails, web);
  const ecoDown = isEcoDefeated(web);
  const moonsOpen = areMoonsOpen(web);
  const allMoons = areAllMoonsDone(webMoons, web);
  const eraXp = Object.values(web.done).reduce((s, r) => s + (r?.xp ?? 0), 0);
  const earnedCount = webEraGems.filter((g) => badgesEarned[g.badgeId]).length;
  const closed = () => screen.setNotice(webEraCopy.closedPortal);

  const nodes: PortalNode[] = webEraTrails.map((t, i) => {
    const locked = !isEraTrailUnlocked(webEraTrails, i, web);
    const isDone = isWebStageDone(web, t.id);
    return {
      key: t.id,
      color: t.color,
      locked,
      done: isDone,
      current: !locked && !isDone,
      inner: isDone ? <GemBadge gem={t.gem} size={46} /> : <span className={styles.portalNum}>{String(i + 1).padStart(2, '0')}</span>,
      tag: t.year,
      title: t.title,
      small: isDone ? `insígnia: ${t.gem.name}` : locked ? 'bloqueada' : `${t.rounds.length} missões · +${webStageXp('trail', t.rounds.length)} xp`,
      onClick: () => (locked ? closed() : screen.setStage(eraTrailStage(t))),
    };
  });
  nodes.push({
    key: 'eco',
    color: 'var(--web-bad)',
    locked: !ecoOpen,
    done: ecoDown,
    current: ecoOpen && !ecoDown,
    boss: true,
    inner: <span className={styles.bossFaceSmall}>ECO</span>,
    tag: 'chefe da era',
    title: 'Eco',
    small: ecoDown ? 'derrotado' : ecoOpen ? 'insígnia rara + lendária' : 'termine as 10 trilhas',
    onClick: () => (ecoOpen ? screen.setStage(ecoStage()) : screen.setNotice('O Eco só aparece depois das 10 trilhas.')),
  });

  return (
    <div className={styles.page}>
      <header className={styles.hud}>
        <h1 className={styles.brand}>
          <span className={styles.trio} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          Era da Web
        </h1>
        <span className={styles.chip}>
          xp <b>{eraXp}</b>
        </span>
        <button type="button" className={styles.chip} onClick={() => shelfRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          insígnias{' '}
          <b>
            {earnedCount}/{webEraGems.length}
          </b>
        </button>
        <button type="button" className={styles.chip} onClick={() => screen.setPortfolioOpen(true)}>
          portfólio <b>{portfolioPercent(webEraTrails, web)}%</b>
        </button>
      </header>

      <SintaxeTalk
        key={`${done}-${ecoDown}-${allMoons}`}
        lines={[
          webEraCopy.story({ name: travelerName, nextTitle: next?.title, nextYear: next?.year, done, ecoDefeated: ecoDown, moonsDone: allMoons }),
        ]}
      />

      <div className={styles.secTitle}>
        <h2>Trilhas da Era</h2>
        <span className={styles.eyebrow}>{done}/10 · HTML · CSS · JS</span>
      </div>
      <PortalPath nodes={nodes} doneLinks={done + (ecoDown ? 1 : 0)} />

      <div className={styles.secTitle}>
        <h2>Luas</h2>
        <span className={styles.eyebrow}>{moonsOpen ? 'orbitando o portal no mapa' : 'nascem ao vencer o Eco'}</span>
      </div>
      {moonsOpen ? (
        <div className={styles.moonList}>
          {webMoons.map((m) => (
            <Link key={m.id} to={`/era-da-web/lua/${m.id}`} className={styles.mcard} style={{ ['--c' as string]: m.color }}>
              <b>{m.name}</b>
              <small>
                {isMoonDone(m, web) ? `✓ ${m.boss.name} vencido` : `${moonTrailsDone(m, web)}/${m.trails.length} trilhas · chefe: ${m.boss.name}`}
              </small>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.docl}>{webEraCopy.moonsLocked}</p>
      )}

      {moonsOpen ? (
        <>
          <div className={styles.secTitle}>
            <h2>Ramificações</h2>
            <span className={styles.eyebrow}>{allMoons ? 'Evento Nexus ativo' : 'após as 3 luas'}</span>
          </div>
          <WebNexus open={allMoons} playOnMount={allMoons && !nexusSeen} />
        </>
      ) : null}

      <div className={styles.secTitle} ref={shelfRef}>
        <h2>Estante de insígnias</h2>
      </div>
      <BadgeShelf gems={webEraGems} earned={badgesEarned} />

      <p className={`${styles.docl} ${styles.foot}`}>Seu progresso fica salvo com o resto do jogo.</p>

      {screen.stage ? (
        <StageRunner
          stage={screen.stage}
          travelerName={travelerName}
          onClose={screen.closeStage}
          onSeePortfolio={() => {
            screen.closeStage();
            screen.setPortfolioOpen(true);
          }}
        />
      ) : null}
      {screen.portfolioOpen ? <PortfolioDrawer onClose={() => screen.setPortfolioOpen(false)} /> : null}
      {screen.notice ? <Toast message={screen.notice} /> : null}
    </div>
  );
}
