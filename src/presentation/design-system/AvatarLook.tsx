import type { AccessoryItem, AvatarLook, FrameItem, HairItem } from '@/domain/cosmetics';
import styles from './Avatar.module.css';

// Cores fixas dos desenhos vêm dos tokens (design-system/tokens.css).
const INK = { stroke: 'var(--color-bg)' };
const PANEL = { fill: 'var(--color-panel)' };

/**
 * Camada de cosméticos por cima do avatar (Etapa 9). Um SVG com o mesmo tamanho do avatar
 * (viewBox -50..50, o círculo do avatar tem raio 50) que pode passar das bordas: moldura
 * em volta, cabelo no topo, acessório no rosto ou num canto. Desenhos originais e simples.
 */
export function AvatarLookLayer({ look }: { look: AvatarLook }) {
  if (!look.frame && !look.hair && !look.accessory) return null;
  return (
    <svg className={styles.look} viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
      {look.frame ? <Frame item={look.frame} /> : null}
      {look.hair ? <Hair item={look.hair} /> : null}
      {look.accessory ? <Accessory item={look.accessory} /> : null}
    </svg>
  );
}

function Frame({ item }: { item: FrameItem }) {
  const c = item.color;
  switch (item.style) {
    case 'terminal':
      return (
        <g>
          <rect x={-57} y={-63} width={114} height={120} rx={14} fill="none" stroke={c} strokeWidth={5} />
          <path d="M-57 -49v-2a12 12 0 0 1 12-12h90a12 12 0 0 1 12 12v2z" fill={c} />
          <circle cx={-44} cy={-56} r={3.2} style={{ fill: 'var(--color-bad)' }} />
          <circle cx={-34} cy={-56} r={3.2} style={{ fill: 'var(--color-gold)' }} />
          <circle cx={-24} cy={-56} r={3.2} style={{ fill: 'var(--color-good)' }} />
        </g>
      );
    case 'neon':
      return <circle r={54} fill="none" stroke={c} strokeWidth={5} className={styles.neon} style={{ color: c }} />;
    case 'orbita':
      return (
        <g className={styles.spin}>
          <circle r={56} fill="none" stroke={c} strokeWidth={4} strokeDasharray="10 8" />
          <circle cx={56} r={6} fill={c} />
        </g>
      );
    case 'dupla':
      return (
        <g fill="none" stroke={c}>
          <circle r={53} strokeWidth={4} />
          <circle r={60} strokeWidth={2.5} opacity={0.7} />
        </g>
      );
    case 'pixel':
      return (
        <path
          d="M-46 -58h92v6h6v6h6v92h-6v6h-6v6h-92v-6h-6v-6h-6v-92h6v-6h6z"
          fill="none"
          stroke={c}
          strokeWidth={5}
          strokeLinejoin="miter"
        />
      );
    case 'fenda':
      return (
        <g fill="none" stroke={c} strokeWidth={5} strokeLinecap="round">
          <path d="M8 -53.4A54 54 0 1 1 -20 -50.2" />
          <path d="M-20 -50.2l6 12l8 -8l2 -8" strokeWidth={3} />
        </g>
      );
  }
}

function Hair({ item }: { item: HairItem }) {
  const c = item.color;
  // Todas partem de uma "touca" que cobre o topo do círculo.
  const cap = 'M-50 -6A50 50 0 0 1 50 -6C36 -22 -36 -22 -50 -6z';
  switch (item.style) {
    case 'espetado':
      return <path d="M-50 -4L-46 -40L-34 -30L-28 -60L-14 -40L0 -66L12 -42L28 -62L32 -32L46 -42L50 -4C30 -24 -30 -24 -50 -4z" fill={c} />;
    case 'franja':
      return <path d="M-50 -2A50 50 0 0 1 50 -2L50 -12L40 -14L36 -20H-36L-40 -14L-50 -12z" fill={c} />;
    case 'coque':
      return (
        <g fill={c}>
          <circle cy={-58} r={15} />
          <path d={cap} />
        </g>
      );
    case 'moicano':
      return <path d="M-14 -46L-20 -76L-6 -66L0 -92L8 -66L22 -78L14 -46C6 -50 -6 -50 -14 -46z" fill={c} />;
    case 'cacheado':
      return (
        <g fill={c}>
          {[-44, -30, -15, 0, 15, 30, 44].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? -46 : -34 - (Math.abs(x) < 20 ? 18 : 0)} r={14} />
          ))}
          <path d={cap} />
        </g>
      );
    case 'chanel':
      return <path d="M-54 18V-10A54 54 0 0 1 54 -10V18H40V-6C28 -20 -28 -20 -40 -6V18z" fill={c} />;
  }
}

function Accessory({ item }: { item: AccessoryItem }) {
  const c = item.color;
  switch (item.style) {
    case 'oculos':
      return (
        <g style={{ fill: 'var(--color-bg)' }} fillOpacity={0.35} stroke={c} strokeWidth={4}>
          <circle cx={-19} cy={-2} r={13} />
          <circle cx={19} cy={-2} r={13} />
          <path d="M-6 -4q6 -5 12 0M-32 -4h-16M32 -4h16" fill="none" />
        </g>
      );
    case 'fone':
      return (
        <g fill={c}>
          <path d="M-50 -2A50 50 0 0 1 50 -2" fill="none" stroke={c} strokeWidth={6} transform="translate(0 -8) scale(1.08)" />
          <rect x={-60} y={-14} width={16} height={28} rx={6} />
          <rect x={44} y={-14} width={16} height={28} rx={6} />
        </g>
      );
    case 'antena':
      return (
        <g>
          <path d="M14 -48L26 -78" stroke={c} strokeWidth={4} strokeLinecap="round" />
          <circle cx={27} cy={-81} r={7} fill={c} className={styles.blink} />
        </g>
      );
    case 'estrela':
      return (
        <path
          d="M-38 22l5.3 10.7 11.8 1.7-8.5 8.3 2 11.8-10.6-5.6-10.6 5.6 2-11.8-8.5-8.3 11.8-1.7z"
          fill={c}
          style={INK}
          strokeWidth={2.5}
        />
      );
    case 'coroa':
      return <path d="M-26 -52L-30 -78L-14 -64L0 -84L14 -64L30 -78L26 -52z" fill={c} style={INK} strokeWidth={2.5} />;
    case 'ampulheta':
      return (
        <g transform="translate(-38 38)">
          <circle r={15} style={PANEL} stroke={c} strokeWidth={3} />
          <path d="M-7 -9h14l-7 9l7 9h-14l7 -9z" fill={c} />
        </g>
      );
    case 'selo':
      return (
        <g transform="translate(-38 38)">
          <circle r={15} fill={c} style={INK} strokeWidth={2.5} />
          <path d="M-7 0l5 5l9 -10" fill="none" style={INK} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
  }
}
