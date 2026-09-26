import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import type { OnlinePlayer } from '@/application/ports';
import type { ProfileSummary } from '@/application/usecases';
import type { AvatarLook } from '@/domain/cosmetics';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Modal,
  playSelectSound,
  playVortexSound,
  SintaxeFace,
  startHubAmbience,
  stopHubAmbience,
} from '@/presentation/design-system';
import {
  CHARACTERS,
  ERAS,
  HUB,
  ICON_PATHS,
  MAP_H,
  MAP_W,
  pathToEra,
  satellitePosition,
  SATELLITE_ICON_PATHS,
  type MapCharacter,
  type MapEra,
} from './mapData';
import { EraVortex } from './EraVortex';
import { SintaxePlaza } from './SintaxePlaza';
import styles from './TimeMap.module.css';

/** Só mostra no mapa as eras que já têm trilha jogável (trilha registrada). As demais ficam ocultas até existirem. */
const VISIBLE_ERAS = ERAS.filter((e) => e.status === 'ativo');

type Cam = { x: number; y: number; k: number };
type Sheet =
  | { kind: 'era'; era: MapEra }
  | { kind: 'hub' }
  | { kind: 'char'; char: MapCharacter }
  | { kind: 'eco' }
  | null;

export type EraProgress = {
  done: number;
  total: number;
  /** Chefe vencido: a era para de ser puxada pelo Eco e fica estável no mapa. */
  restored?: boolean;
};

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fundo estrelado determinístico (não muda a cada render). */
function buildStars() {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 140 }, () => ({
    cx: rnd() * MAP_W,
    cy: rnd() * MAP_H,
    r: rnd() * 1.6 + 0.4,
    fill: rnd() > 0.5 ? '#c9a2ff' : '#fff',
    opacity: rnd() * 0.5 + 0.15,
  }));
}

export function TimeMap({
  summary,
  onlinePlayers,
  onlineLooks = {},
  progress,
  startHereEraId,
  onEnterEra,
  ecoEra = 0,
}: {
  summary: ProfileSummary;
  onlinePlayers: OnlinePlayer[];
  /** Cosméticos de quem está online (Etapa 9), por uuid. */
  onlineLooks?: Record<string, AvatarLook>;
  progress: Record<string, EraProgress>;
  /** Era com o selo "Comece aqui" (só para quem ainda não concluiu nenhum módulo). */
  startHereEraId?: string;
  onEnterEra: (era: MapEra) => void;
  /** Em que era o Eco está (Linha do Tempo, Etapa 8): aparece como um terminal vermelho perto dela. */
  ecoEra?: number;
}) {
  const travelerName = summary.name;
  const startHereEra = VISIBLE_ERAS.find((e) => e.id === startHereEraId);
  // Enquadramento inicial: a era sugerida para quem está começando, senão a Era dos Dados.
  const initialFocus = useRef(startHereEra ?? ERAS[0]);
  const stars = useMemo(buildStars, []);
  const svgRef = useRef<SVGSVGElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const cam = useRef<Cam>({ x: 0, y: 0, k: 1 });
  const size = useRef({ w: 360, h: 640 });
  const moved = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number; sx: number; sy: number }>());
  const pinch = useRef(0);
  const mounted = useRef(true);
  const [, redraw] = useReducer((n: number) => n + 1, 0);

  const atRef = useRef<MapEra>(ERAS[0]);
  const [me, setMe] = useState({ x: ERAS[0].x, y: ERAS[0].y });
  const [sheet, setSheet] = useState<Sheet>(null);
  const [say, setSay] = useState<ReactNode>(null);
  const [tipVisible, setTipVisible] = useState(true);
  // Mergulho no vórtice: cor da era e o ponto da tela onde ela está (centro do giro/zoom).
  const [entering, setEntering] = useState<{ id: string; color: string; x: number; y: number } | null>(null);

  // Som ambiente calmo enquanto o aluno está no hub; some em fade ao sair do mapa.
  useEffect(() => {
    startHubAmbience();
    return () => stopHubAmbience();
  }, []);

  // Toque macio ao abrir o cartão de uma era, da praça ou do Eco.
  const sheetOpen = sheet !== null;
  useEffect(() => {
    if (sheetOpen) playSelectSound();
  }, [sheetOpen]);

  const clamp = useCallback(() => {
    const { w, h } = size.current;
    const kmin = Math.max((w / MAP_W) * 0.8, h / (MAP_H * 1.15));
    const c = cam.current;
    c.k = Math.max(kmin, Math.min(2.2, c.k));
    const margin = 200 * c.k;
    c.x = Math.min(margin, Math.max(w - MAP_W * c.k - margin, c.x));
    c.y = Math.min(margin, Math.max(h - MAP_H * c.k - margin, c.y));
  }, []);

  const centerOn = useCallback(
    (x: number, y: number, k?: number) => {
      const { w, h } = size.current;
      if (k) cam.current.k = k;
      cam.current.x = w / 2 - x * cam.current.k;
      cam.current.y = h * 0.42 - y * cam.current.k;
      clamp();
      redraw();
    },
    [clamp],
  );

  const zoomAt = useCallback(
    (cx: number, cy: number, factor: number) => {
      const c = cam.current;
      const wx = (cx - c.x) / c.k;
      const wy = (cy - c.y) / c.k;
      c.k *= factor;
      clamp();
      c.x = cx - wx * c.k;
      c.y = cy - wy * c.k;
      clamp();
      redraw();
    },
    [clamp],
  );

  // Tamanho do viewport + enquadramento inicial na Era dos Dados.
  useEffect(() => {
    mounted.current = true;
    const svg = svgRef.current;
    if (!svg) return;
    let first = true;
    const measure = () => {
      const r = svg.getBoundingClientRect();
      size.current = { w: r.width || 360, h: r.height || 640 };
      if (first) {
        first = false;
        const { w } = size.current;
        const focus = initialFocus.current;
        centerOn(focus.x + 90, focus.y + 40, Math.min(1.05, Math.max((w / MAP_W) * 1.55, 0.62)));
      } else {
        clamp();
        redraw();
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(svg);
    const hide = window.setTimeout(() => setTipVisible(false), 6000);
    return () => {
      mounted.current = false;
      ro.disconnect();
      window.clearTimeout(hide);
    };
  }, [centerOn, clamp]);

  useEffect(() => {
    setSay(
      startHereEra ? (
        <>
          <b>SINTAXE</b> · Este é o mapa do tempo, {travelerName}. Comece pela <b>{startHereEra.name}</b>: toque nela
          para viajar até lá. As outras eras também estão abertas.
        </>
      ) : (
        <>
          <b>SINTAXE</b> · Este é o mapa do tempo, {travelerName}. Toque numa era para ver detalhes e viajar até
          ela.
        </>
      ),
    );
  }, [travelerName, startHereEra]);

  // Zoom com roda do mouse (precisa de listener não passivo).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = svg.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 0.89);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  // Minimapa
  useEffect(() => {
    const canvas = miniRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const s = Math.min(w / MAP_W, h / MAP_H);
    const ox = (w - MAP_W * s) / 2;
    const oy = (h - MAP_H * s) / 2;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0912';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2c2647';
    ctx.lineWidth = 2;
    VISIBLE_ERAS.forEach((e) => {
      ctx.beginPath();
      ctx.moveTo(ox + HUB.x * s, oy + HUB.y * s);
      ctx.lineTo(ox + e.x * s, oy + e.y * s);
      ctx.stroke();
    });
    VISIBLE_ERAS.forEach((e) => {
      ctx.fillStyle = e.status === 'nevoa' ? '#4a4560' : e.color;
      ctx.beginPath();
      ctx.arc(ox + e.x * s, oy + e.y * s, e.status === 'ativo' ? 9 : 6, 0, 7);
      ctx.fill();
    });
    ctx.fillStyle = '#9b4dff';
    ctx.beginPath();
    ctx.arc(ox + HUB.x * s, oy + HUB.y * s, 10, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#ffd479';
    ctx.strokeStyle = '#0a0912';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ox + me.x * s, oy + me.y * s, 6, 0, 7);
    ctx.fill();
    ctx.stroke();
    const c = cam.current;
    ctx.strokeStyle = '#5ee7ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(ox + (-c.x / c.k) * s, oy + (-c.y / c.k) * s, (size.current.w / c.k) * s, (size.current.h / c.k) * s);
  });

  const onMiniClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = miniRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const w = canvas.width;
    const h = canvas.height;
    const s = Math.min(w / MAP_W, h / MAP_H);
    const px = ((e.clientX - r.left) / r.width) * w;
    const py = ((e.clientY - r.top) / r.height) * h;
    centerOn((px - (w - MAP_W * s) / 2) / s, (py - (h - MAP_H * s) / 2) / s);
  };

  // --- arrastar / pinçar ---
  const onPointerDown = (e: PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
    moved.current = false;
    setTipVisible(false);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const onPointerMove = (e: PointerEvent) => {
    const p = pointers.current.get(e.pointerId);
    if (!p) return;
    if (pointers.current.size === 1) {
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 7) moved.current = true;
      cam.current.x += dx;
      cam.current.y += dy;
      p.x = e.clientX;
      p.y = e.clientY;
      clamp();
      redraw();
    } else if (pointers.current.size === 2) {
      p.x = e.clientX;
      p.y = e.clientY;
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current) {
        const r = svgRef.current!.getBoundingClientRect();
        zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / pinch.current);
      }
      pinch.current = d;
      moved.current = true;
    }
  };
  const onPointerUp = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId);
    pinch.current = 0;
    if (!pointers.current.size) window.setTimeout(() => (moved.current = false), 30);
  };

  const activate = (fn: () => void) => ({
    onClick: () => {
      if (!moved.current) fn();
    },
    onKeyDown: (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        fn();
      }
    },
  });

  // Entra direto na era ao tocar "Viajar até aqui": sem o marcador andando pelo caminho
  // luminoso até lá (decisão do autor) — só centraliza o mapa nela e segue pro portal.
  const goTo = (era: MapEra) => {
    setSheet(null);
    atRef.current = era;
    setMe({ x: era.x, y: era.y });
    centerOn(era.x, era.y);
    if (era.trailId) {
      setSay(
        <>
          <b>SINTAXE</b> · Chegamos à <b>{era.name}</b>. Entrando...
        </>,
      );
      if (reducedMotion()) onEnterEra(era);
      else {
        const cc = cam.current;
        setEntering({ id: era.id, color: era.color, x: era.x * cc.k + cc.x, y: era.y * cc.k + cc.y });
        stopHubAmbience(0.9);
        playVortexSound(1.15);
        window.setTimeout(() => mounted.current && onEnterEra(era), 1150);
      }
    } else {
      setSay(
        <>
          <b>SINTAXE</b> · Chegamos à <b>{era.name}</b>. Esta era ainda está em construção, mas já dá para ver o
          caminho.
        </>,
      );
    }
  };

  const c = cam.current;

  return (
    <div className={`${styles.root} ${entering ? styles.leaving : ""}`}>
      {entering ? <div className={styles.portal} style={{ ["--portal" as string]: entering.color, ["--px" as string]: `${entering.x}px`, ["--py" as string]: `${entering.y}px` }} aria-hidden="true" /> : null}
      <svg
        ref={svgRef}
        className={styles.map}
        role="img"
        aria-label="Mapa das eras. Toque em uma era para ver detalhes."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <radialGradient id="tm-glow">
            <stop offset="0" stopColor="#9b4dff" stopOpacity=".35" />
            <stop offset="1" stopColor="#9b4dff" stopOpacity="0" />
          </radialGradient>
          <filter id="tm-blur">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {/* O mergulho gira e aproxima em torno do núcleo da era (CSS num <g> por fora da
            câmera: no mesmo <g>, o transform do CSS apagaria o da câmera). */}
        <g
          className={entering ? styles.dive : undefined}
          style={entering ? { transformOrigin: `${entering.x}px ${entering.y}px` } : undefined}
        >
        <g transform={`translate(${c.x} ${c.y}) scale(${c.k})`} className={entering ? styles.diving : undefined}>
          {stars.map((s, i) => (
            <circle key={i} {...s} className={styles.star} />
          ))}
          <circle cx={HUB.x} cy={HUB.y} r={380} fill="url(#tm-glow)" />
          {[140, 250, 360].map((r) => (
            <circle key={r} cx={HUB.x} cy={HUB.y} r={r} fill="none" stroke="#2c2647" strokeWidth={1.5} strokeDasharray="3 9" />
          ))}

          {VISIBLE_ERAS.map((e) => {
            const fog = e.status === 'nevoa';
            const d = pathToEra(e);
            return (
              <g key={e.id}>
                <path d={d} fill="none" stroke="#2c2647" strokeWidth={10} strokeLinecap="round" opacity={fog ? 0.4 : 1} />
                <path
                  d={d}
                  fill="none"
                  stroke={e.color}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeDasharray="2 12"
                  className={fog ? undefined : styles.flow}
                  opacity={fog ? 0.35 : 0.9}
                />
              </g>
            );
          })}

          {VISIBLE_ERAS.map((e) => {
            const pr = progress[e.id];
            const labelW = e.name.length * 10.5 + 26;
            return (
              <g
                key={e.id}
                className={`${styles.node} ${entering?.id === e.id ? styles.diveTarget : ''}`}
                transform={`translate(${e.x} ${e.y})`}
                tabIndex={0}
                role="button"
                aria-label={`${e.name}${e.id === startHereEra?.id ? ' (comece aqui)' : ''}. ${e.description}`}
                {...activate(() => setSheet({ kind: 'era', era: e }))}
              >
                <EraVortex id={e.id} color={e.color} iconPath={ICON_PATHS[e.icon]} progress={pr} />
                <g className={styles.eraMeta}>
                <g transform="translate(0 88)">
                  <rect x={-labelW / 2} y={-20} width={labelW} height={34} rx={17} fill="#151225" stroke={e.color} strokeWidth={2} />
                  <text y={3} textAnchor="middle" fill="#ece9f8" fontSize={20} fontWeight={700} fontFamily="Instrument Sans, sans-serif">
                    {e.name}
                  </text>
                </g>
                {e.id === startHereEra?.id ? (
                  <g transform="translate(0 126)" className={styles.startHere}>
                    <rect x={-62} y={-15} width={124} height={30} rx={15} fill="#5ee7ff" />
                    <text y={6} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0a0912" fontFamily="JetBrains Mono, monospace">
                      COMECE AQUI
                    </text>
                  </g>
                ) : e.status === 'ativo' && pr ? (
                  <g transform="translate(46 -46)">
                    <circle r={19} fill="#ffd479" />
                    <text y={6} textAnchor="middle" fontSize={16} fontWeight={800} fill="#0a0912" fontFamily="JetBrains Mono, monospace">
                      {pr.done}/{pr.total}
                    </text>
                  </g>
                ) : null}
                {e.status === 'novo' ? (
                  <g transform="translate(48 -44)">
                    <rect x={-26} y={-13} width={52} height={26} rx={13} fill="#ffd479" />
                    <text y={6} textAnchor="middle" fontSize={14} fontWeight={800} fill="#0a0912" fontFamily="JetBrains Mono, monospace">
                      NOVA
                    </text>
                  </g>
                ) : null}
                </g>
              </g>
            );
          })}

          {(() => {
            // O Eco (a cópia com defeito do viajante) avança uma era a cada linha ramificada.
            const era = VISIBLE_ERAS[Math.min(ecoEra, VISIBLE_ERAS.length - 1)];
            if (!era) return null;
            return (
              <g transform={`translate(${era.x - 140} ${era.y + 20})`} aria-label={`O Eco está perto da ${era.name}`} role="img">
                <rect x={-26} y={-24} width={52} height={46} rx={11} fill="#0a0912" stroke="#ff5d7a" strokeWidth={4} />
                <circle cx={-9} cy={-6} r={4} fill="#ff5d7a" />
                <circle cx={9} cy={-6} r={4} fill="#ff5d7a" />
                <path d="M-10 12 Q0 4 10 12" fill="none" stroke="#ff5d7a" strokeWidth={4} strokeLinecap="round" />
                <text y={44} textAnchor="middle" fontSize={17} fill="#ff5d7a" fontFamily="JetBrains Mono, monospace">
                  o Eco
                </text>
              </g>
            );
          })()}

          {VISIBLE_ERAS.flatMap((e) =>
            (e.satellites ?? []).map((sat, i) => {
              const pos = satellitePosition(e, sat);
              // Uma lua só fica clicável (com trilha própria) depois que a era-mãe é
              // restaurada (chefe vencido) E o conteúdo dela já existe (`trailId`).
              const unlocked = Boolean(sat.trailId) && Boolean(progress[e.id]?.restored);
              const satEra: MapEra = {
                id: sat.id,
                name: sat.name,
                x: pos.x,
                y: pos.y,
                color: sat.color ?? e.color,
                icon: e.icon,
                status: unlocked ? 'ativo' : 'breve',
                years: sat.years ?? 'EM BREVE',
                trailId: unlocked ? sat.trailId : undefined,
                description:
                  sat.description ??
                  `A lua de ${sat.name} ainda está guardada na névoa... em breve chega uma trilha só dela!`,
              };
              const label = sat.trailId && !unlocked ? `${sat.name}. Vença o chefe da Lógica para abrir.` : `${sat.name}.`;
              return (
                <g
                  key={sat.id}
                  className={styles.node}
                  transform={`translate(${pos.x} ${pos.y})`}
                  tabIndex={0}
                  role="button"
                  aria-label={unlocked ? `${sat.name}. ${satEra.description}` : label}
                  {...activate(() => {
                    if (unlocked) {
                      setSheet({ kind: 'era', era: satEra });
                    } else if (sat.trailId) {
                      setSay(
                        <>
                          <b>SINTAXE</b> · A lua de <b>{sat.name}</b> já existe, mas só abre depois que você vencer
                          o chefe da Era da Lógica.
                        </>,
                      );
                    } else {
                      setSay(
                        <>
                          <b>SINTAXE</b> · {sat.name} ainda está guardada na névoa... em breve chega uma lua só
                          dela!
                        </>,
                      );
                    }
                  })}
                >
                  <line x1={(e.x - pos.x) * 0.35} y1={(e.y - pos.y) * 0.35} x2={0} y2={0} stroke="#2c2647" strokeWidth={2} strokeDasharray="1 6" />
                  {/* Animação num <g> interno: no externo, o transform do CSS apagaria o translate da posição. */}
                  <g className={styles.satellite} style={{ animationDelay: `${(-i * 0.8).toFixed(1)}s` }}>
                    <circle r={24} fill="#0d0b18" stroke={unlocked ? satEra.color : '#3a3454'} strokeWidth={2} opacity={unlocked ? 1 : 0.75} />
                    <g
                      stroke={unlocked ? satEra.color : '#6a6483'}
                      strokeWidth={2.4}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={unlocked ? 1 : 0.7}
                    >
                      <path d={SATELLITE_ICON_PATHS[sat.icon]} />
                    </g>
                    <text
                      y={40}
                      textAnchor="middle"
                      fill={unlocked ? satEra.color : '#6a6483'}
                      fontSize={12}
                      fontWeight={700}
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {unlocked ? 'nova lua' : 'em breve'}
                    </text>
                  </g>
                </g>
              );
            }),
          )}

          <g
            className={styles.node}
            transform={`translate(${ERAS[0].x - 100} ${ERAS[0].y + 35})`}
            tabIndex={0}
            role="button"
            aria-label="Rastro do Eco"
            {...activate(() => setSheet({ kind: 'eco' }))}
          >
            <g className={styles.eco}>
              <path d="M0 -18l16 28h-32z" fill="#ff5d7a" opacity={0.9} />
              <text y={8} textAnchor="middle" fontSize={18} fontWeight={800} fill="#0a0912" fontFamily="JetBrains Mono, monospace">
                !
              </text>
              <circle r={30} fill="none" stroke="#ff5d7a" strokeWidth={2} className={styles.pulse} />
            </g>
          </g>

          {CHARACTERS.map((ch) => (
            <g
              key={ch.name}
              className={styles.node}
              transform={`translate(${ch.x} ${ch.y})`}
              tabIndex={0}
              role="button"
              aria-label={ch.name}
              {...activate(() => setSheet({ kind: 'char', char: ch }))}
            >
              <g className={styles.bob}>
                <circle r={26} fill="#0d0b18" stroke={ch.color} strokeWidth={2.5} />
                <text
                  y={ch.glyph.length > 1 ? 9 : 11}
                  textAnchor="middle"
                  fontSize={ch.glyph.length > 1 ? 22 : 30}
                  fontWeight={800}
                  fill={ch.color}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {ch.glyph}
                </text>
              </g>
            </g>
          ))}

          <g
            className={styles.node}
            transform={`translate(${HUB.x} ${HUB.y})`}
            tabIndex={0}
            role="button"
            aria-label="Praça da Sintaxe"
            {...activate(() => setSheet({ kind: 'hub' }))}
          >
            <SintaxePlaza />
            <g transform="translate(0 142)">
              <rect x={-96} y={-22} width={192} height={38} rx={19} fill="#151225" stroke="#9b4dff" strokeWidth={2} />
              <text y={4} textAnchor="middle" fill="#ece9f8" fontSize={22} fontWeight={800} fontFamily="Syne, sans-serif">
                Praça da Sintaxe
              </text>
            </g>
          </g>

        </g>
        </g>
      </svg>

      <div className={styles.hud}>
        <div>
          <div className={styles.brand}>
            <span className={styles.avatar} aria-hidden="true">
              <Avatar name={travelerName} url={summary.avatarUrl} size={26} online look={summary.look} />
            </span>
            {travelerName} <span className={styles.level}>· Nível {summary.level}</span>
          </div>
          <div className={styles.sub}>
            CRISTAIS {summary.crystals} · XP {summary.xp} · 🔥 {summary.streak.current}
          </div>
          {onlinePlayers.length > 0 ? (
            <div className={styles.presenceCompact}>
              {onlinePlayers.length === 1 ? '1 online agora' : `${onlinePlayers.length} online agora`}
            </div>
          ) : null}
        </div>
        <div className={styles.mini}>
          <canvas ref={miniRef} width={192} height={240} aria-label="Minimapa" onClick={onMiniClick} />
          <small>MINIMAPA</small>
        </div>
      </div>

      <div className={styles.tip} style={{ opacity: tipVisible ? 1 : 0 }}>
        Arraste · pinça para zoom
      </div>

      <div className={styles.say}>
        <div className={styles.bubble}>
          {say}
        </div>
      </div>

      <div className={styles.zoom}>
        <button type="button" aria-label="Aproximar" onClick={() => zoomAt(size.current.w / 2, size.current.h / 2, 1.3)}>
          +
        </button>
        <button type="button" aria-label="Afastar" onClick={() => zoomAt(size.current.w / 2, size.current.h / 2, 0.77)}>
          −
        </button>
        <button type="button" aria-label="Centralizar em mim" onClick={() => centerOn(me.x, me.y, Math.max(cam.current.k, 0.62))}>
          ◎
        </button>
      </div>

      {sheet ? (
        <Modal title="Detalhes" onClose={() => setSheet(null)}>
          {sheet.kind === 'era' ? (
            <EraSheet
              era={sheet.era}
              startHere={sheet.era.id === startHereEra?.id}
              progress={progress[sheet.era.id]}
              onGo={() => goTo(sheet.era)}
              onClose={() => setSheet(null)}
            />
          ) : null}
          {sheet.kind === 'hub' ? (
            <div className={styles.sheetBody}>
              <div className={styles.who}>
                <SintaxeFace size={34} /> SENHORITA SINTAXE
              </div>
              <h2>Praça da Sintaxe</h2>
              <p>
                É o centro do mapa: todas as eras saem daqui. Antes de qualquer linguagem, você precisa saber
                escrever: pontuação, indentação, nomes e blocos. Isso vale para quase tudo.
              </p>
              <div className={styles.plazaCrowd} aria-label="Viajantes na praça">
                <span className={styles.plazaMe}>
                  <Avatar name={travelerName} url={summary.avatarUrl} size={44} look={summary.look} />
                  <small>Você</small>
                </span>
                {onlinePlayers.slice(0, 6).map((p) => (
                  <span key={p.uuid} className={styles.plazaMe}>
                    <Avatar name={p.nome} url={p.fotoUrl} size={44} online look={onlineLooks[p.uuid]} />
                    <small>{p.nome}</small>
                  </span>
                ))}
              </div>
              <Link to="/configuracoes/loja" className={styles.plazaShop}>
                Loja do Viajante · {summary.fragments} ◆
              </Link>
            </div>
          ) : null}
          {sheet.kind === 'char' ? (
            <div className={styles.sheetBody}>
              <div className={styles.who} style={{ color: sheet.char.color }}>
                {sheet.char.name.toUpperCase()} · {sheet.char.role}
              </div>
              <p className={styles.speech}>{sheet.char.text}</p>
            </div>
          ) : null}
          {sheet.kind === 'eco' ? (
            <div className={styles.sheetBody}>
              <div className={styles.who}>
                <SintaxeFace size={34} /> SENHORITA SINTAXE
              </div>
              <p className={styles.speech}>
                Um <b>rastro do Eco</b>! Alguém fez uma gambiarra na Era dos Dados por aqui. Entre na era para
                consertar.
              </p>
            </div>
          ) : null}
        </Modal>
      ) : null}
    </div>
  );
}

function EraSheet({
  era,
  startHere,
  progress,
  onGo,
  onClose,
}: {
  era: MapEra;
  startHere: boolean;
  progress?: EraProgress;
  onGo: () => void;
  onClose: () => void;
}) {
  const fog = era.status === 'nevoa';
  return (
    <div className={styles.sheetBody}>
      <div className={styles.yr}>
        {era.years}
        {era.status === 'novo' ? <span className={styles.tag}>NOVA</span> : null}
        {era.status === 'breve' ? <span className={styles.tag}>EM BREVE</span> : null}
        {startHere ? <span className={`${styles.tag} ${styles.tagStart}`}>COMECE AQUI</span> : null}
      </div>
      <h2>{era.name}</h2>
      <p>{era.description}</p>
      {era.status === 'ativo' && progress ? (
        <>
          <div className={styles.prog}>
            <i style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} />
          </div>
          <p>
            {progress.done} de {progress.total} módulos concluídos
          </p>
        </>
      ) : null}
      {fog ? null : (
        <button type="button" className={styles.go} onClick={onGo}>
          Viajar até aqui ▸
        </button>
      )}
      <button type="button" className={styles.sec} onClick={onClose}>
        Fechar
      </button>
    </div>
  );
}
