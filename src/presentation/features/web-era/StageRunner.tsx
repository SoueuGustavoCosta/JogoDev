import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getWebEra, loseWebStage, saveWebPortfolioPiece, startWebStage, winWebStage } from '@/application/usecases';
import {
  areAllMoonsDone,
  badgesForWebStage,
  WEB_HEARTS,
  WEB_XP_BONUS,
  WEB_XP_PER_MISSION,
  type DocLink,
  type GemSpec,
  type WebMission,
  type WebPortfolio,
  type WebStageKind,
} from '@/domain/webEra';
import { webEraCopy, webMoons, webSpecialGems } from '@/content/webEra';
import { GemBadge, SintaxeFace } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { MissionEngine, type MissionApi } from './engines';
import { reducedMotion } from './engines/types';
import { SintaxeTalk } from './SintaxeTalk';
import styles from './Stage.module.css';

/** Uma etapa jogável: trilha da era, Eco, trilha de lua ou chefe de lua. */
export type WebStage = {
  kind: WebStageKind;
  stageId: string;
  title: string;
  color: string;
  say: readonly string[];
  doc?: DocLink;
  rounds: readonly WebMission[];
  /** Chefe: nome e rosto glitch. */
  boss?: { name: string; face: string };
  /** Insígnia da trilha (era) ou exclusiva da lua (chefe de lua). */
  gem?: GemSpec;
  pieceName?: string;
  moonName?: string;
};

type Phase = 'intro' | 'play' | 'over' | 'won';
type Reward = { medals: GemSpec[]; title: string; line: string; xp: string; story?: string };

/**
 * Palco da Era da Web (runner comum): missão X/N, barra de tempo, 3 corações, +10 XP por
 * missão, dica da Sintaxe depois de um erro, "A linha do tempo ramificou" quando os
 * corações acabam, e a recompensa no fim. Em tela cheia, por cima do app.
 */
export function StageRunner({
  stage,
  onClose,
  onSeePortfolio,
  onSeeBranches,
}: {
  stage: WebStage;
  onClose: () => void;
  onSeePortfolio?: () => void;
  onSeeBranches?: () => void;
}) {
  const { progressRepository, analytics, leaderboard } = useServices();
  const isBoss = stage.kind === 'boss' || stage.kind === 'moonboss';
  const total = stage.rounds.length;
  const [phase, setPhase] = useState<Phase>('intro');
  const [i, setI] = useState(0);
  const [hearts, setHearts] = useState(WEB_HEARTS);
  const [lost, setLost] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1);
  const [toast, setToast] = useState<{ msg: string; bad: boolean; n: number } | null>(null);
  const [flash, setFlash] = useState<{ color: string; n: number } | null>(null);
  const [hurt, setHurt] = useState(0);
  const [reward, setReward] = useState<Reward | null>(null);
  const roundOver = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const mission = stage.rounds[i];

  // Tela cheia: a página de trás não rola, e o foco vem para o palco.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    rootRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((msg: string, bad = false) => setToast((t) => ({ msg, bad, n: (t?.n ?? 0) + 1 })), []);
  const doFlash = useCallback((color: string) => setFlash((f) => ({ color, n: (f?.n ?? 0) + 1 })), []);

  const finish = useCallback(
    (heartsLost: number) => {
      const medals = badgesForWebStage({ kind: stage.kind, gem: stage.gem }, webSpecialGems, heartsLost);
      const { xpGained } = winWebStage(
        { repository: progressRepository, analytics, leaderboard },
        { stageId: stage.stageId, kind: stage.kind, missions: total, badgeIds: medals.map((g) => g.badgeId) },
      );
      const xp = xpGained > 0 ? `+${xpGained} XP` : 'XP desta etapa já estava contado';
      let r: Reward;
      if (stage.kind === 'trail') r = { medals, title: stage.gem?.name ?? stage.title, line: `Peça do portfólio liberada: ${stage.pieceName}.`, xp };
      else if (stage.kind === 'boss')
        r = {
          medals,
          title: 'Eco derrotado!',
          line:
            heartsLost === 0
              ? 'Sem perder um coração. Insígnia LENDÁRIA!'
              : `Você perdeu ${heartsLost} ${heartsLost === 1 ? 'coração' : 'corações'}. Vença sem perder nenhum para a lendária.`,
          xp,
          story: webEraCopy.ecoDefeated,
        };
      else if (stage.kind === 'moon')
        r = { medals, title: `${stage.title} concluída`, line: `+${WEB_XP_BONUS.moon} XP de bônus. Continue até o chefe da lua.`, xp };
      else {
        const allMoons = areAllMoonsDone(webMoons, getWebEra({ repository: progressRepository }).web);
        r = { medals, title: stage.gem?.name ?? stage.title, line: `Insígnia exclusiva da ${stage.moonName}!`, xp, story: allMoons ? webEraCopy.nexus : undefined };
      }
      setReward(r);
      setPhase('won');
    },
    [stage, total, progressRepository, analytics, leaderboard],
  );

  const startRound = useCallback(() => {
    roundOver.current = false;
    setTimeLeft(1);
    setAttempt((a) => a + 1);
    setPhase('play');
  }, []);

  const api: MissionApi = useMemo(
    () => ({
      win: () => {
        if (roundOver.current) return;
        roundOver.current = true;
        setShowHint(false);
        showToast(`${webEraCopy.cheers[Math.floor(Math.random() * webEraCopy.cheers.length)]} +${WEB_XP_PER_MISSION} xp`);
        if (isBoss) setHurt((h) => h + 1);
        window.setTimeout(() => {
          const next = i + 1;
          if (next >= total) finish(lost);
          else {
            setI(next);
            startRound();
          }
        }, 850);
      },
      fail: (msg: string) => {
        if (roundOver.current) return;
        roundOver.current = true;
        showToast(msg || 'Ops!', true);
        doFlash('var(--web-bad)');
        const left = hearts - 1;
        setHearts(left);
        setLost((l) => l + 1);
        setShowHint(true);
        if (left <= 0) {
          loseWebStage({ analytics }, { stageId: stage.stageId, kind: stage.kind, mission: i + 1 });
          window.setTimeout(() => setPhase('over'), 700);
        } else window.setTimeout(startRound, 900);
      },
      err: () => {
        doFlash('var(--web-bad)');
        try {
          navigator.vibrate?.(40);
        } catch {
          // Vibração é um extra.
        }
      },
      ok: () => doFlash('var(--web-neon)'),
      hint: () => setShowHint(true),
      toast: (msg: string) => showToast(msg),
      capture: (patch: Partial<WebPortfolio>) => saveWebPortfolioPiece({ repository: progressRepository }, { patch }),
    }),
    [i, total, hearts, lost, isBoss, stage, analytics, progressRepository, finish, startRound, showToast, doFlash],
  );
  const apiRef = useRef(api);
  apiRef.current = api;

  // Barra de tempo: missão com `time` perde um coração quando o tempo acaba.
  useEffect(() => {
    if (phase !== 'play' || !mission?.time) return;
    const t0 = Date.now();
    const ms = mission.time * 1000;
    const id = window.setInterval(() => {
      const f = 1 - (Date.now() - t0) / ms;
      setTimeLeft(Math.max(0, f));
      if (f <= 0) {
        window.clearInterval(id);
        apiRef.current.fail('Tempo esgotado!');
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, attempt, mission]);

  const begin = () => {
    startWebStage({ analytics }, { stageId: stage.stageId, kind: stage.kind });
    startRound();
  };

  const retry = () => {
    setI(0);
    setHearts(WEB_HEARTS);
    setLost(0);
    setShowHint(false);
    startRound();
  };

  const hp = total - i - (phase === 'won' ? 1 : 0);
  const accent = reward && reward.medals.some((g) => g.tier === 'lendaria') ? 'var(--web-gold)' : stage.color;

  return createPortal(
    <div ref={rootRef} className={styles.stage} style={{ ['--c' as string]: stage.color }} role="dialog" aria-modal="true" aria-label={stage.title} tabIndex={-1}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <button type="button" className={styles.x} onClick={onClose} aria-label="Sair">
            ✕
          </button>
          <div className={styles.prog} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(i, total)} aria-label="Missões concluídas">
            <i style={{ width: `${((phase === 'won' ? total : i) / total) * 100}%` }} />
          </div>
          <span className={styles.hearts} aria-label={`${hearts} de ${WEB_HEARTS} corações`}>
            {Array.from({ length: WEB_HEARTS }, (_, k) => (
              <span key={k} className={k < hearts ? undefined : styles.heartOff}>
                ♥
              </span>
            ))}
          </span>
        </div>

        {isBoss && stage.boss && phase !== 'won' ? (
          <div className={styles.bossbar}>
            <div key={hurt} className={`${styles.bossFace} ${hurt ? styles.hurt : ''}`} aria-hidden="true">
              {stage.boss.face}
            </div>
            <div className={styles.bossTop}>
              <b>{stage.boss.name}</b>
              <span>
                {Math.max(0, hp)}/{total}
              </span>
            </div>
            <div className={styles.hp} role="progressbar" aria-label={`Vida de ${stage.boss.name}`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.max(0, hp)}>
              <i style={{ width: `${(Math.max(0, hp) / total) * 100}%` }} />
            </div>
          </div>
        ) : null}

        {phase === 'intro' ? (
          <>
            <div className={styles.mission}>
              <span className={styles.eyebrow}>{isBoss ? 'batalha' : 'portal'}</span>
              <h3>{stage.title}</h3>
            </div>
            <SintaxeTalk lines={stage.say} />
            <div className={styles.row}>
              <button type="button" className={`${styles.btn} ${isBoss ? styles.red : styles.hot}`} onClick={begin} autoFocus>
                {isBoss ? 'Lutar!' : 'Bora!'}
              </button>
              {stage.doc ? (
                <p className={styles.docl}>
                  doc ·{' '}
                  <a href={stage.doc.url} target="_blank" rel="noopener noreferrer">
                    {stage.doc.label}
                  </a>
                </p>
              ) : null}
            </div>
          </>
        ) : null}

        {phase === 'play' && mission ? (
          <>
            <div className={styles.mission}>
              <span className={styles.eyebrow}>
                missão {i + 1}/{total}
                {mission.time ? ` · ${mission.time}s` : ''}
              </span>
              <h3>{mission.title}</h3>
              <p>{mission.sub}</p>
            </div>
            {mission.time ? (
              <div className={styles.timer} aria-hidden="true">
                <i className={timeLeft < 0.3 ? styles.low : undefined} style={{ width: `${timeLeft * 100}%` }} />
              </div>
            ) : null}
            <div className={styles.arena}>
              <MissionEngine key={attempt} mission={mission} api={api} />
            </div>
            {showHint ? (
              <div className={styles.hintbar}>
                <SintaxeFace size={40} />
                <div className={styles.bubble}>{mission.hint ? `Dica: ${mission.hint}` : webEraCopy.retryHint}</div>
              </div>
            ) : null}
          </>
        ) : null}

        {phase === 'over' ? (
          <div className={styles.reward}>
            <SintaxeFace size={110} expression="sad" />
            <h2>{webEraCopy.gameOver}</h2>
            <p className={styles.docl}>
              {isBoss ? `${stage.boss?.name} levou essa.` : 'O Eco levou essa.'} A etapa recomeça, e o XP entra quando você vencer.
            </p>
            <div className={`${styles.row} ${styles.center}`}>
              <button type="button" className={`${styles.btn} ${styles.hot}`} onClick={retry} autoFocus>
                Tentar de novo
              </button>
              <button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={onClose}>
                Voltar
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'won' && reward ? (
          <div className={styles.reward} style={{ ['--c' as string]: accent }}>
            <div className={styles.medals}>
              {reward.medals.length ? (
                reward.medals.map((g) => (
                  <div key={g.badgeId} className={styles.rays}>
                    <div className={styles.medal}>
                      <GemBadge gem={g} size={reward.medals.length > 1 ? 140 : 180} />
                    </div>
                  </div>
                ))
              ) : (
                <SintaxeFace size={110} />
              )}
            </div>
            <p className={styles.eyebrow}>{reward.medals.length ? 'nova insígnia' : 'trilha concluída'}</p>
            <h2>{reward.title}</h2>
            <p className={styles.xpup}>{reward.line}</p>
            <p className={styles.xpup}>{reward.xp}</p>
            {reward.story ? <p className={styles.story}>{reward.story}</p> : null}
            <div className={`${styles.row} ${styles.center}`}>
              {(stage.kind === 'trail' || stage.kind === 'boss') && onSeePortfolio ? (
                <button type="button" className={styles.btn} onClick={onSeePortfolio} autoFocus>
                  Ver meu portfólio
                </button>
              ) : null}
              {reward.story === webEraCopy.nexus && onSeeBranches ? (
                <button type="button" className={`${styles.btn} ${styles.yel}`} onClick={onSeeBranches} autoFocus>
                  Ver as Ramificações
                </button>
              ) : null}
              <button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={onClose}>
                Voltar
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {toast ? (
        <div key={`toast-${toast.n}`} className={`${styles.toast} ${toast.bad ? styles.toastBad : ''}`} role="status">
          {toast.msg}
        </div>
      ) : null}
      {flash && !reducedMotion() ? <div key={`flash-${flash.n}`} className={styles.flash} style={{ background: flash.color }} aria-hidden="true" /> : null}
    </div>,
    document.body,
  );
}
