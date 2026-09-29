import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { NexusBranchView } from '@/application/usecases';
import type { NexusState } from '@/domain/nexus';
import { SintaxeFace } from '@/presentation/design-system';
import { BRANCH_POS, BRANCH_R, ISLAND, NEXUS_ANCHOR, SX, SY, VIEW, spiralPath, threadPath } from './geometry';
import styles from './NexusScene.module.css';

type Props = {
  islandName: string;
  islandColor: string;
  bossName?: string;
  state: NexusState;
  branches: NexusBranchView[];
  /** Toca a cena completa (flash, distorção, fios crescendo) e depois chama `onPlayed`. */
  play: boolean;
  onPlayed?: () => void;
  onEnter?: (trailId: string) => void;
  /** Rola a tela até os portais ao abrir (a cena fica no fim da tela da lua). */
  focus?: boolean;
};


/**
 * Evento Nexus (referência: docs/expansao/prototipos/prototipo_cometa.html). O portal da lua
 * embaixo e três fios de luz trançados subindo até três portais de frameworks. Só
 * `transform` e `opacity` animam; com `prefers-reduced-motion` a cena
 * já aparece no estado final (ver o CSS).
 */
export function NexusScene({
  islandName,
  islandColor,
  bossName,
  state,
  branches,
  play,
  onPlayed,
  onEnter,
  focus = false,
}: Props) {
  const [opened, setOpened] = useState(state === 'open' && !play);
  const [flash, setFlash] = useState(false);
  // A cena só toca (e só fica marcada como vista) quando os portais aparecem na tela.
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!focus || !el) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Espera o layout da tela assentar (a página começa no topo) antes de rolar.
    const t = window.setTimeout(
      () => el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }),
      150,
    );
    return () => window.clearTimeout(t);
  }, [focus]);

  useEffect(() => {
    const el = sectionRef.current;
    if (state !== 'open' || !play || !el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [state, play]);

  useEffect(() => {
    if (state !== 'open') return;
    if (!play) {
      setOpened(true);
      return;
    }
    if (!inView) return;
    setFlash(true);
    const open = window.setTimeout(() => setOpened(true), 300);
    const done = window.setTimeout(() => onPlayed?.(), 2600);
    return () => {
      window.clearTimeout(open);
      window.clearTimeout(done);
    };
    // A cena toca uma vez por montagem; `onPlayed` muda a cada render do pai.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, play, inView]);

  const threads = useMemo(
    () =>
      [0, 1, 2].map(
        (i) => [threadPath(i, 0), threadPath(i, Math.PI), threadPath(i, 0, 0)] as const,
      ),
    [],
  );
  const bigSpiral = useMemo(() => spiralPath(ISLAND.r), []);
  const smallSpiral = useMemo(() => spiralPath(BRANCH_R), []);

  const legend =
    state === 'soon'
      ? 'Ramificações em breve: os portais ainda estão se formando.'
      : state === 'locked'
        ? `Vença ${bossName ?? 'o chefe'} para abrir os portais.`
        : 'Evento Nexus: novos portais se abriram.';

  return (
    <section
      ref={sectionRef}
      id={NEXUS_ANCHOR}
      className={styles.nexus}
      aria-labelledby="nexus-title"
    >
      <h2 id="nexus-title" className={styles.title}>
        Ramificações de {islandName}
      </h2>
      {/* A distorção acontece dentro da moldura (que corta o excesso), nunca alarga a página. */}
      <div className={styles.stage}>
        <svg
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          className={`${styles.svg} ${opened ? styles.open : ''} ${flash ? styles.distort : ''}`}
          role="img"
          aria-label={legend}
        >
          {threads.map(([a, b, base], i) => {
            const color = branches[i]?.color ?? islandColor;
            return (
              <g key={i}>
                <path d={base} className={styles.base} />
                {/* O fio cresce a partir do topo do portal da lua: só transform (scaleY), nada de traço animado. */}
                <g
                  className={styles.grow}
                  style={{
                    transformOrigin: `${ISLAND.x}px ${ISLAND.y - ISLAND.r * SY}px`,
                    transitionDelay: `${i * 0.12}s`,
                  }}
                >
                  <path d={a} className={styles.thread} stroke={color} strokeWidth={2.4} />
                  <path
                    d={b}
                    className={styles.thread}
                    stroke={color}
                    strokeWidth={1.4}
                    opacity={0.55}
                  />
                </g>
              </g>
            );
          })}

          <Portal
            x={ISLAND.x}
            y={ISLAND.y}
            r={ISLAND.r}
            color={islandColor}
            spiral={bigSpiral}
            alwaysOpen
          />
          <text
            x={ISLAND.x}
            y={ISLAND.y + ISLAND.r * SY + 34}
            textAnchor="middle"
            className={styles.islandLabel}
            fill={islandColor}
          >
            {islandName}
          </text>

          {branches.map((b, i) => {
            const [x, y] = BRANCH_POS[i]!;
            const enter = opened && b.exists && onEnter ? () => onEnter(b.trailId) : undefined;
            return (
              <g
                key={b.trailId}
                className={enter ? styles.enter : undefined}
                {...(enter
                  ? {
                      role: 'link',
                      tabIndex: 0,
                      'aria-label': `Entrar na Ramificação ${b.name}`,
                      onClick: enter,
                      onKeyDown: (e: KeyboardEvent) =>
                        (e.key === 'Enter' || e.key === ' ') && enter(),
                    }
                  : {})}
              >
                <Portal
                  x={x}
                  y={y}
                  r={BRANCH_R}
                  color={b.color}
                  spiral={smallSpiral}
                  delay={1.3 + i * 0.12}
                  bob={i}
                />
                <text
                  x={x}
                  y={y - BRANCH_R * SY - 14}
                  textAnchor="middle"
                  className={styles.branchLabel}
                >
                  {b.name}
                </text>
                {state !== 'open' ? (
                  <text x={x} y={y + 5} textAnchor="middle" className={styles.soon}>
                    {state === 'soon' ? 'em breve' : '🔒'}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
        {flash ? <div className={styles.flash} aria-hidden="true" /> : null}
      </div>

      {state === 'open' ? (
        <div className={styles.sintaxe}>
          <SintaxeFace size={40} />
          <p>
            <b>A linha do tempo se ramificou!</b> Assim como um branch no Git, ela se dividiu, e
            cada ramo segue o seu próprio caminho. Escolha um portal.
          </p>
        </div>
      ) : (
        <p className={styles.legend}>{legend}</p>
      )}

      <ul className={styles.list}>
        {branches.map((b) => (
          <li key={b.trailId}>
            {state === 'open' && b.exists && onEnter ? (
              <button
                type="button"
                className={styles.branchButton}
                style={{ borderColor: b.color }}
                onClick={() => onEnter(b.trailId)}
              >
                <span style={{ color: b.color }}>{b.name}</span>
                <small>
                  {b.done}/{b.total} trilhas ▸
                </small>
              </button>
            ) : (
              <span className={styles.branchClosed}>
                <span>{b.name}</span>
                <small>{state === 'locked' ? 'fechado' : 'em breve'}</small>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Portal({
  x,
  y,
  r,
  color,
  spiral,
  alwaysOpen,
  delay = 0,
  bob,
}: {
  x: number;
  y: number;
  r: number;
  color: string;
  spiral: string;
  alwaysOpen?: boolean;
  delay?: number;
  bob?: number;
}) {
  const gradientId = `nexus-g-${x}-${y}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g
        className={bob === undefined ? styles.float : styles.bob}
        style={bob === undefined ? undefined : { animationDelay: `${-bob * 1.3}s` }}
      >
        <g transform={`scale(${SX} ${SY})`}>
          <defs>
            <radialGradient id={gradientId}>
              <stop offset="0%" style={{ stopColor: 'var(--color-bg)' }} />
              <stop offset="70%" style={{ stopColor: 'var(--color-panel)' }} />
              <stop offset="100%" stopColor={color} stopOpacity={0.35} />
            </radialGradient>
          </defs>
          <circle
            r={r + 8}
            fill="none"
            stroke={color}
            strokeWidth={1.2}
            strokeDasharray="10 14"
            className={`${styles.ring} ${styles.spinSlow}`}
          />
          <g
            className={alwaysOpen ? styles.coreOpen : styles.core}
            style={{ transitionDelay: `${delay}s` }}
          >
            <circle r={r} fill={`url(#${gradientId})`} />
            <path
              d={spiral}
              fill="none"
              stroke={color}
              strokeWidth={1.4}
              opacity={0.55}
              className={styles.spin}
            />
            <circle
              r={r * 0.7}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="2 8"
              opacity={0.8}
              className={styles.spinFast}
            />
          </g>
          <circle
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={3}
            className={alwaysOpen ? undefined : styles.edge}
          />
        </g>
      </g>
    </g>
  );
}
