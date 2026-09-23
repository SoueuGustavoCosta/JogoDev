import styles from './SintaxePlaza.module.css';

/** Mesma elipse usada pelo anel e pelo caminho do satélite (offset-path), no quadro inclinado. */
const ORBIT_RX = 124;
const ORBIT_RY = 32;
const ORBIT_PATH = `M${-ORBIT_RX} 0a${ORBIT_RX} ${ORBIT_RY} 0 1 0 ${ORBIT_RX * 2} 0a${ORBIT_RX} ${ORBIT_RY} 0 1 0 ${-ORBIT_RX * 2} 0`;

/** Metade do anel de órbita: a de trás é desenhada antes da Sintaxe, a da frente depois. */
function OrbitHalf({ half }: { half: 'back' | 'front' }) {
  const clip = `plaza-orbit-${half}`;
  return (
    <g transform="rotate(-10)">
      <clipPath id={clip}>
        <rect x={-150} y={half === 'back' ? -60 : 0} width={300} height={60} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <ellipse rx={ORBIT_RX} ry={ORBIT_RY} fill="none" stroke="#5ee7ff" strokeWidth={half === 'back' ? 1.5 : 2.5} opacity={half === 'back' ? 0.35 : 0.8} />
        <ellipse rx={ORBIT_RX} ry={ORBIT_RY} fill="none" stroke="#c9a2ff" strokeWidth={1} strokeDasharray="3 14" opacity={0.7} className={styles.dash} />
        <circle r={half === 'back' ? 4 : 6} fill="#ffd479" className={styles.moon} style={{ offsetPath: `path('${ORBIT_PATH}')` }} />
      </g>
    </g>
  );
}

/**
 * A Praça da Sintaxe (hub do mapa) com volume: plataforma flutuante vista de três-quartos,
 * a Sintaxe como um monitor com profundidade, pé e reflexo no vidro, e um anel de órbita
 * inclinado que passa por trás e pela frente dela. Só SVG, centrado em (0,0).
 */
export function SintaxePlaza() {
  return (
    <g>
      <defs>
        <linearGradient id="plaza-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2c6e" />
          <stop offset="1" stopColor="#0d0b18" />
        </linearGradient>
        <radialGradient id="plaza-top" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#3b2f6b" />
          <stop offset="0.6" stopColor="#1f1840" />
          <stop offset="1" stopColor="#151225" />
        </radialGradient>
        <linearGradient id="plaza-beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#9b4dff" stopOpacity={0.45} />
          <stop offset="1" stopColor="#9b4dff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="plaza-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f1a38" />
          <stop offset="1" stopColor="#100d1f" />
        </linearGradient>
        <linearGradient id="plaza-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.14} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="plaza-neck" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2c2647" />
          <stop offset="0.5" stopColor="#4a3d80" />
          <stop offset="1" stopColor="#1b1731" />
        </linearGradient>
      </defs>

      {/* aura + sombra no "chão" */}
      <circle r={120} fill="#9b4dff" opacity={0.12} filter="url(#tm-blur)" />
      <ellipse cy={104} rx={92} ry={14} fill="#000" opacity={0.55} filter="url(#tm-blur)" className={styles.shadow} />

      {/* plataforma flutuante: lateral (espessura) + tampo */}
      <g className={styles.platform}>
        <path d="M-108 56v18a108 30 0 0 0 216 0v-18a108 30 0 0 1 -216 0z" fill="url(#plaza-side)" />
        <ellipse cy={74} rx={108} ry={30} fill="none" stroke="#9b4dff" strokeWidth={2} opacity={0.55} />
        <ellipse cy={56} rx={108} ry={30} fill="url(#plaza-top)" stroke="#9b4dff" strokeWidth={2.5} />
        <ellipse cy={56} rx={80} ry={21} fill="none" stroke="#5ee7ff" strokeWidth={1.5} strokeDasharray="6 8" opacity={0.55} className={styles.dash} />
        <ellipse cy={56} rx={48} ry={12} fill="none" stroke="#c9a2ff" strokeWidth={1} opacity={0.45} />
      </g>

      {/* feixe de luz subindo da plataforma */}
      <path d="M-46 58L-30 -70H30L46 58z" fill="url(#plaza-beam)" opacity={0.7} />

      <OrbitHalf half="back" />

      {/* a Sintaxe: monitor com profundidade, flutuando */}
      <g className={styles.float}>
        <ellipse cy={56} rx={24} ry={6} fill="#2c2647" stroke="#9b4dff" strokeWidth={1.2} className={styles.footprint} />
        <rect x={-7} y={30} width={14} height={24} fill="url(#plaza-neck)" />
        {/* topo e lateral direita = espessura do monitor */}
        <path d="M-46 -40L-36 -50H56L46 -40z" fill="#3a2f66" />
        <path d="M46 -40L56 -50V30L46 40z" fill="#1b1731" />
        <rect x={-46} y={-40} width={92} height={80} rx={8} fill="url(#plaza-screen)" stroke="#9b4dff" strokeWidth={2.5} />
        <rect x={-46} y={-40} width={92} height={15} rx={8} fill="#1b1731" />
        <circle cx={-35} cy={-32} r={2.8} fill="#ff5f57" />
        <circle cx={-26} cy={-32} r={2.8} fill="#febc2e" />
        <circle cx={-17} cy={-32} r={2.8} fill="#28c840" />
        <g className={styles.eyes}>
          <rect x={-27} y={-14} width={15} height={21} rx={6} fill="#5ee7ff" />
          <rect x={12} y={-14} width={15} height={21} rx={6} fill="#5ee7ff" />
        </g>
        <path d="M-15 20q15 10 30 0" stroke="#ff6b1f" strokeWidth={4.5} fill="none" strokeLinecap="round" />
        <path d="M-44 -24L6 -24L-34 38H-44z" fill="url(#plaza-glass)" />
      </g>

      <OrbitHalf half="front" />
    </g>
  );
}
