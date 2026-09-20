import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { Modal, SintaxeFace } from '@/presentation/design-system';
import {
  CHARACTERS,
  ERAS,
  HUB,
  ICON_PATHS,
  MAP_H,
  MAP_W,
  SATELLITES,
  pathToEra,
  type MapCharacter,
  type MapEra,
} from './mapData';
import styles from './TimeMap.module.css';

type Cam = { x: number; y: number; k: number };
type Sheet =
  | { kind: 'era'; era: MapEra }
  | { kind: 'hub' }
  | { kind: 'char'; char: MapCharacter }
  | { kind: 'eco' }
  | null;

export type EraProgress = { done: number; total: number };

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
  travelerName,
  crystals,
  xp,
  progress,
  onEnterEra,
}: {
  travelerName: string;
  crystals: number;
  xp: number;
  progress: Record<string, EraProgress>;
  onEnterEra: (era: MapEra) => void;
}) {
  const stars = useMemo(buildStars, []);
  const svgRef = useRef<SVGSVGElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
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

  const follow = useCallback(
    (x: number, y: number) => {
      const { w, h } = size.current;
      const c = cam.current;
      c.x += (w / 2 - x * c.k - c.x) * 0.15;
      c.y += (h * 0.42 - y * c.k - c.y) * 0.15;
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
        centerOn(ERAS[0].x + 90, ERAS[0].y + 40, Math.max((w / MAP_W) * 1.55, 0.62));
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
      <>
        <b>SINTAXE</b> · Este é o mapa do tempo, {travelerName}. Toque numa era para ver detalhes e viajar até
        ela.
      </>,
    );
  }, [travelerName]);

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
    ERAS.forEach((e) => {
      ctx.beginPath();
      ctx.moveTo(ox + HUB.x * s, oy + HUB.y * s);
      ctx.lineTo(ox + e.x * s, oy + e.y * s);
      ctx.stroke();
    });
    ERAS.forEach((e) => {
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

  // --- viagem do marcador pelo caminho luminoso ---
  const travel = (to: MapEra) =>
    new Promise<void>((resolve) => {
      const from = atRef.current;
      if (from.id === to.id) return resolve();
      const back = pathRefs.current[from.id];
      const forth = pathRefs.current[to.id];
      if (!back || !forth) return resolve();
      const segs = [
        { p: back, rev: true },
        { p: forth, rev: false },
      ];
      const total = segs.reduce((sum, s) => sum + s.p.getTotalLength(), 0);
      const dur = reducedMotion() ? 10 : Math.min(3200, 900 + total * 3);
      const t0 = performance.now();
      const frame = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        let dist = eased * total;
        let pt = { x: from.x, y: from.y };
        for (const s of segs) {
          const len = s.p.getTotalLength();
          if (dist <= len) {
            pt = s.p.getPointAtLength(s.rev ? len - dist : dist);
            break;
          }
          dist -= len;
          pt = s.p.getPointAtLength(s.rev ? 0 : len);
        }
        setMe({ x: pt.x, y: pt.y });
        follow(pt.x, pt.y);
        if (k < 1 && mounted.current) requestAnimationFrame(frame);
        else {
          atRef.current = to;
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });

  const goTo = async (era: MapEra) => {
    setSheet(null);
    setSay(
      <>
        <b>SINTAXE</b> · Viajando para {era.name}...
      </>,
    );
    centerOn(atRef.current.x, atRef.current.y);
    await travel(era);
    if (!mounted.current) return;
    if (era.trailId) {
      setSay(
        <>
          <b>SINTAXE</b> · Chegamos à <b>{era.name}</b>. Entrando...
        </>,
      );
      window.setTimeout(() => mounted.current && onEnterEra(era), reducedMotion() ? 0 : 700);
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
    <div className={styles.root}>
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
        <g transform={`translate(${c.x} ${c.y}) scale(${c.k})`}>
          {stars.map((s, i) => (
            <circle key={i} {...s} />
          ))}
          <circle cx={HUB.x} cy={HUB.y} r={380} fill="url(#tm-glow)" />
          {[140, 250, 360].map((r) => (
            <circle key={r} cx={HUB.x} cy={HUB.y} r={r} fill="none" stroke="#2c2647" strokeWidth={1.5} strokeDasharray="3 9" />
          ))}

          {ERAS.map((e) => {
            const fog = e.status === 'nevoa';
            const d = pathToEra(e);
            return (
              <g key={e.id}>
                <path d={d} fill="none" stroke="#2c2647" strokeWidth={10} strokeLinecap="round" opacity={fog ? 0.4 : 1} />
                <path
                  ref={(el) => {
                    pathRefs.current[e.id] = el;
                  }}
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

          {SATELLITES.map((s) => (
            <g key={s.name}>
              <line x1={790} y1={480} x2={s.x} y2={s.y} stroke="#ff6b1f" strokeWidth={2} opacity={0.6} />
              <g transform={`translate(${s.x} ${s.y})`}>
                <circle r={20} fill="#151225" stroke="#ff6b1f" strokeWidth={2} />
                <circle r={5} fill="#ff6b1f" />
                <text y={38} textAnchor="middle" fill="#9b94b8" fontSize={15} fontFamily="JetBrains Mono, monospace" fontWeight={700}>
                  {s.name}
                </text>
              </g>
            </g>
          ))}

          {ERAS.map((e) => {
            const fog = e.status === 'nevoa';
            const pr = progress[e.id];
            const circ = 2 * Math.PI * 56;
            const labelW = e.name.length * 10.5 + 26;
            return (
              <g
                key={e.id}
                className={styles.node}
                transform={`translate(${e.x} ${e.y})`}
                tabIndex={0}
                role="button"
                aria-label={`${e.name}. ${e.description}`}
                {...activate(() => setSheet({ kind: 'era', era: e }))}
              >
                <circle r={74} fill={e.color} opacity={fog ? 0.05 : 0.12} filter="url(#tm-blur)" />
                <circle r={56} fill="#0d0b18" stroke="#2c2647" strokeWidth={8} />
                {pr && pr.total > 0 ? (
                  <circle
                    r={56}
                    fill="none"
                    stroke={e.color}
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={`${(circ * pr.done) / pr.total} ${circ}`}
                    transform="rotate(-90)"
                  />
                ) : null}
                <circle
                  className={styles.ring}
                  r={56}
                  fill="none"
                  stroke={e.color}
                  strokeWidth={fog ? 2 : 3}
                  opacity={fog ? 0.4 : 0.9}
                  strokeDasharray={fog ? '4 6' : pr && pr.total ? '0 999' : undefined}
                />
                <g
                  stroke={fog ? '#9b94b8' : e.color}
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="scale(1.35)"
                >
                  <path d={ICON_PATHS[e.icon]} />
                </g>
                <g transform="translate(0 88)">
                  <rect x={-labelW / 2} y={-20} width={labelW} height={34} rx={17} fill="#151225" stroke={e.color} strokeWidth={2} />
                  <text y={3} textAnchor="middle" fill="#ece9f8" fontSize={20} fontWeight={700} fontFamily="Instrument Sans, sans-serif">
                    {e.name}
                  </text>
                </g>
                {e.status === 'ativo' && pr ? (
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
            );
          })}

          <g
            className={`${styles.node} ${styles.eco}`}
            transform={`translate(${ERAS[0].x - 100} ${ERAS[0].y + 35})`}
            tabIndex={0}
            role="button"
            aria-label="Rastro do Eco"
            {...activate(() => setSheet({ kind: 'eco' }))}
          >
            <path d="M0 -18l16 28h-32z" fill="#ff5d7a" opacity={0.9} />
            <text y={8} textAnchor="middle" fontSize={18} fontWeight={800} fill="#0a0912" fontFamily="JetBrains Mono, monospace">
              !
            </text>
            <circle r={30} fill="none" stroke="#ff5d7a" strokeWidth={2} className={styles.pulse} />
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
            <circle r={100} fill="#9b4dff" opacity={0.12} filter="url(#tm-blur)" />
            <circle r={78} fill="#0d0b18" stroke="#9b4dff" strokeWidth={5} />
            <circle r={78} fill="none" stroke="#5ee7ff" strokeWidth={2} strokeDasharray="6 8" className={styles.flow} />
            <g transform="scale(1.9)">
              <rect x="-24" y="-20" width="48" height="40" rx="6" fill="#151225" stroke="#9b4dff" strokeWidth="1.6" />
              <rect x="-24" y="-20" width="48" height="8" rx="5" fill="#1b1731" />
              <circle cx="-18" cy="-16" r="1.5" fill="#ff5f57" />
              <circle cx="-13" cy="-16" r="1.5" fill="#febc2e" />
              <circle cx="-8" cy="-16" r="1.5" fill="#28c840" />
              <rect x="-14" y="-6" width="8" height="11" rx="3" fill="#5ee7ff" />
              <rect x="6" y="-6" width="8" height="11" rx="3" fill="#5ee7ff" />
              <path d="M-8 11q8 5 16 0" stroke="#ff6b1f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            </g>
            <g transform="translate(0 118)">
              <rect x={-96} y={-22} width={192} height={38} rx={19} fill="#151225" stroke="#9b4dff" strokeWidth={2} />
              <text y={4} textAnchor="middle" fill="#ece9f8" fontSize={22} fontWeight={800} fontFamily="Syne, sans-serif">
                Praça da Sintaxe
              </text>
            </g>
          </g>

          <g transform={`translate(${me.x - 42} ${me.y - 40})`} pointerEvents="none">
            <g className={styles.bob}>
              <path d="M0 0L-12 -22A15 15 0 1 1 12 -22Z" fill="#ffd479" stroke="#0a0912" strokeWidth={3} />
              <circle cx={0} cy={-30} r={5.5} fill="#0a0912" />
            </g>
          </g>
        </g>
      </svg>

      <div className={styles.hud}>
        <div>
          <div className={styles.brand}>
            <i />
            Viajante <span>{travelerName}</span>
          </div>
          <div className={styles.sub}>
            CRISTAIS {crystals} · XP {xp}
          </div>
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
              progress={progress[sheet.era.id]}
              onGo={() => goTo(sheet.era)}
              onClose={() => setSheet(null)}
            />
          ) : null}
          {sheet.kind === 'hub' ? (
            <div className={styles.sheetBody}>
              <div className={styles.who}>
                <SintaxeFace size={34} /> SINTAXE
              </div>
              <h2>Praça da Sintaxe</h2>
              <p>
                É o centro do mapa: todas as eras saem daqui. Antes de qualquer linguagem, você precisa saber
                escrever: pontuação, indentação, nomes e blocos. Isso vale para quase tudo.
              </p>
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
                <SintaxeFace size={34} /> SINTAXE
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
  progress,
  onGo,
  onClose,
}: {
  era: MapEra;
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
