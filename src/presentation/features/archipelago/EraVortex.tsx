import type { EraProgress } from './TimeMap';
import styles from './EraVortex.module.css';

const ARMS = 3;
const PARTICLES = 10;
const RING_R = 56;

/** Braços em espiral indo da borda (r=74) até perto do núcleo (r=16), girando ~0,8 volta. */
function spiralArm(k: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const r = 74 - 58 * t;
    const a = (k * 2 * Math.PI) / ARMS + t * 1.6 * Math.PI;
    pts.push(`${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}

const ARM_PATHS = Array.from({ length: ARMS }, (_, k) => spiralArm(k));

/** Rachaduras curtas saindo do anel: o "quebrado" da era corrompida. */
const CRACKS = [
  'M40 -38l7 -9 3 5 8 -8',
  'M-52 18l-9 4 2 5 -9 5',
  'M14 54l2 10 -5 2 3 9',
  'M-30 -47l-4 -9 5 -1 -3 -9',
];

/**
 * Símbolo da era no mapa. Corrompida (o Eco ainda puxa): buraco negro com espiral
 * girando, partículas sendo sugadas, anel rachado e símbolo tremendo com aberração
 * cromática. Restaurada (chefe vencido): tudo para de puxar, anel inteiro e brilho calmo.
 */
export function EraVortex({
  id,
  color,
  iconPath,
  progress,
}: {
  id: string;
  color: string;
  iconPath: string;
  progress?: EraProgress;
}) {
  const circ = 2 * Math.PI * RING_R;
  const restored = Boolean(progress?.restored);
  const coreId = `vx-core-${id}`;

  const progressArc =
    progress && progress.total > 0 ? (
      <circle
        r={RING_R}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${(circ * progress.done) / progress.total} ${circ}`}
        transform="rotate(-90)"
        opacity={0.95}
      />
    ) : null;

  const icon = (extra?: string, stroke = color) => (
    <g
      className={extra}
      stroke={stroke}
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="scale(1.2)"
    >
      <path d={iconPath} />
    </g>
  );

  if (restored) {
    return (
      <g>
        <defs>
          <radialGradient id={coreId}>
            <stop offset="0" stopColor={color} stopOpacity={0.35} />
            <stop offset="0.7" stopColor="#0d0b18" stopOpacity={1} />
            <stop offset="1" stopColor="#0d0b18" stopOpacity={1} />
          </radialGradient>
        </defs>
        <circle r={82} fill={color} opacity={0.18} filter="url(#tm-blur)" className={styles.breathe} />
        <g className={styles.orbitSlow}>
          <circle r={70} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="2 10" opacity={0.6} />
          <circle cx={70} r={4} fill={color} />
        </g>
        <circle r={RING_R} fill={`url(#${coreId})`} stroke={color} strokeWidth={4} />
        {progressArc}
        <g data-era-icon="">{icon(styles.steady)}</g>
      </g>
    );
  }

  return (
    <g>
      <defs>
        <radialGradient id={coreId}>
          <stop offset="0" stopColor="#000" stopOpacity={1} />
          <stop offset="0.36" stopColor="#030208" stopOpacity={1} />
          <stop offset="0.5" stopColor={color} stopOpacity={0.5} />
          <stop offset="0.72" stopColor={color} stopOpacity={0.14} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>

      <circle r={84} fill={`url(#${coreId})`} />

      <g className={styles.swirl}>
        {ARM_PATHS.map((d, k) => (
          <path key={k} d={d} fill="none" stroke={color} strokeWidth={5 - k} strokeLinecap="round" opacity={0.5} />
        ))}
      </g>

      <g className={styles.swirlFast}>
        {Array.from({ length: PARTICLES }, (_, i) => (
          <g key={i} transform={`rotate(${(i * 360) / PARTICLES})`}>
            <circle
              r={i % 3 === 0 ? 3 : 2}
              fill={i % 2 ? color : '#ece9f8'}
              className={styles.pull}
              style={{ animationDelay: `${(-i * 0.37).toFixed(2)}s` }}
            />
          </g>
        ))}
      </g>

      <circle r={RING_R} fill="none" stroke="#2c2647" strokeWidth={6} opacity={0.8} />
      <g className={styles.glitchRing}>
        <circle r={RING_R} fill="none" stroke={color} strokeWidth={3} strokeDasharray="42 9 7 16 64 6 12 22 30 11" opacity={0.85} />
      </g>
      {progressArc}
      <g stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.55}>
        {CRACKS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      <circle r={31} fill="#030208" stroke={color} strokeWidth={1.2} opacity={0.95} />
      <g data-era-icon="">
        {icon(styles.ghostA, '#ff5d7a')}
        {icon(styles.ghostB, '#5ee7ff')}
        {icon(styles.flicker)}
      </g>
    </g>
  );
}
