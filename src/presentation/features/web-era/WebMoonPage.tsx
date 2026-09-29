import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getTraveler, openWebEra } from '@/application/usecases';
import {
  areAllMoonsDone,
  areMoonsOpen,
  isMoonBossUnlocked,
  isMoonDone,
  isMoonTrailUnlocked,
  isWebStageDone,
  moonTrailsDone,
  webStageXp,
} from '@/domain/webEra';
import { getWebMoon, webEraCopy, webMoons } from '@/content/webEra';
import { GemBadge, GemIconSvg, Toast } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { PortalPath, type PortalNode } from './PortalPath';
import { SintaxeTalk } from './SintaxeTalk';
import { StageRunner } from './StageRunner';
import { moonBossStage, moonTrailStage } from './stages';
import { useWebEraScreen } from './useWebEraScreen';
import { WebNexus } from './WebNexus';
import styles from './WebEra.module.css';

/** Uma lua da Era da Web (HTML, CSS ou JS): 5 trilhas em sequência + chefe, e a insígnia exclusiva. */
export function WebMoonPage() {
  const { moonId = '' } = useParams();
  const { progressRepository, analytics } = useServices();
  const screen = useWebEraScreen();
  const moon = getWebMoon(moonId);
  const { web, nexusSeen } = screen.view;

  useEffect(() => {
    if (moon) openWebEra({ analytics }, { moon: moon.id });
  }, [analytics, moon]);

  if (!getTraveler({ repository: progressRepository }).prologueSeen) return <Navigate to="/prologo" replace />;
  if (!moon) return <Navigate to="/era-da-web" replace />;

  if (!areMoonsOpen(web)) {
    return (
      <div className={styles.page}>
        <h1 className={styles.brand}>{moon.name}</h1>
        <SintaxeTalk lines={[webEraCopy.moonsLocked]} />
        <Link to="/era-da-web" className={styles.chip}>
          Ir para a Era da Web ▸
        </Link>
      </div>
    );
  }

  const done = moonTrailsDone(moon, web);
  const bossOpen = isMoonBossUnlocked(moon, web);
  const bossDown = isMoonDone(moon, web);
  const allMoons = areAllMoonsDone(webMoons, web);

  const nodes: PortalNode[] = moon.trails.map((t, i) => {
    const locked = !isMoonTrailUnlocked(moon, i, web);
    const isDone = isWebStageDone(web, t.id);
    return {
      key: t.id,
      color: moon.color,
      locked,
      done: isDone,
      current: !locked && !isDone,
      inner: <GemIconSvg icon={t.icon} size={40} />,
      tag: `${moon.short} · trilha ${i + 1}`,
      title: t.title,
      small: isDone ? 'concluída' : locked ? 'bloqueada' : `${t.rounds.length} missões · +${webStageXp('moon', t.rounds.length)} xp`,
      onClick: () => (locked ? screen.setNotice(webEraCopy.closedPortal) : screen.setStage(moonTrailStage(moon, t))),
    };
  });
  nodes.push({
    key: 'chefe',
    color: moon.color,
    locked: !bossOpen,
    done: bossDown,
    current: bossOpen && !bossDown,
    boss: true,
    inner: bossDown ? <GemBadge gem={moon.gem} size={64} /> : <span className={styles.bossFaceSmall}>{moon.boss.face}</span>,
    tag: 'chefe da lua',
    title: moon.boss.name,
    small: `insígnia exclusiva: ${moon.gem.name}`,
    onClick: () => (bossOpen ? screen.setStage(moonBossStage(moon)) : screen.setNotice('Termine as 5 trilhas da lua primeiro.')),
  });

  return (
    <div className={styles.page} style={{ ['--c' as string]: moon.color }}>
      <header className={styles.hud}>
        <h1 className={styles.brand} style={{ color: moon.color }}>
          {moon.name}
        </h1>
        <Link to="/era-da-web" className={styles.chip}>
          ◂ Era da Web
        </Link>
      </header>
      <SintaxeTalk key={`${done}-${bossDown}`} lines={[bossDown ? `Você venceu ${moon.boss.name}. A ${moon.gem.name} é sua!` : moon.description]} />

      <div className={styles.secTitle}>
        <h2 style={{ color: moon.color }}>5 trilhas + chefe</h2>
        <span className={styles.eyebrow}>
          {done}/{moon.trails.length}
        </span>
      </div>
      <PortalPath nodes={nodes} doneLinks={done + (bossDown ? 1 : 0)} />

      {allMoons ? (
        <>
          <div className={styles.secTitle}>
            <h2>Ramificações</h2>
            <span className={styles.eyebrow}>Evento Nexus ativo</span>
          </div>
          <WebNexus open playOnMount={!nexusSeen} />
        </>
      ) : null}

      {screen.stage ? (
        <StageRunner
          stage={screen.stage}
          onClose={screen.closeStage}
          onSeeBranches={() => {
            screen.closeStage();
            // As Ramificações aparecem nesta mesma tela assim que as três luas caem.
            window.setTimeout(() => document.getElementById('ramificacoes')?.scrollIntoView({ behavior: 'smooth' }), 80);
          }}
        />
      ) : null}
      {screen.notice ? <Toast message={screen.notice} /> : null}
    </div>
  );
}
