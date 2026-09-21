import { useRef } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import styles from './Badge3D.module.css';

type BadgeCssProperties = CSSProperties & { '--s'?: string; '--img'?: string; '--z'?: number };

const DEPTH_LAYERS = [-6, -5, -4, -3, -2, -1, 0];

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A insígnia "de verdade": camadas empilhadas da mesma imagem em profundidades diferentes
 * (efeito de relevo 3D só com CSS, `transform-style: preserve-3d` + `perspective`), que se
 * inclinam acompanhando o ponteiro/dedo, mais um brilho especular que segue o toque.
 * Porta fielmente o `.b3d`/`b3d()` do protótipo da Ilha da Lógica — só troca as variáveis
 * CSS de imagem em base64 por `url(/badges/...)`, já que aqui os arquivos são reais.
 */
export function Badge3D({
  file,
  label,
  size = 96,
  locked = false,
  spin = false,
}: {
  file: string;
  label: string;
  size?: number;
  locked?: boolean;
  spin?: boolean;
}) {
  const innerRef = useRef<HTMLSpanElement>(null);

  function onPointerMove(e: PointerEvent<HTMLSpanElement>) {
    if (reducedMotion() || locked) return;
    const el = innerRef.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${((px - 0.5) * 44).toFixed(1)}deg`);
    el.style.setProperty('--rx', `${((0.5 - py) * 44).toFixed(1)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(0)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(0)}%`);
  }

  function onPointerLeave() {
    const el = innerRef.current;
    if (!el) return;
    el.style.removeProperty('--ry');
    el.style.removeProperty('--rx');
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
  }

  const img = `url(/badges/${file})`;

  return (
    <span
      className={`${styles.badge} ${locked ? styles.locked : ''} ${spin ? styles.spin : ''}`}
      style={{ '--s': `${size}px`, '--img': img } as BadgeCssProperties}
      role="img"
      aria-label={label}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <span ref={innerRef} className={styles.inner}>
        {DEPTH_LAYERS.map((z) => (
          <i key={z} className={styles.layerEmboss} style={{ '--z': z } as BadgeCssProperties} />
        ))}
        <i className={styles.layerShadow} style={{ '--z': 2 } as BadgeCssProperties} />
        <i className={styles.layerShine} style={{ '--z': 3 } as BadgeCssProperties} />
      </span>
    </span>
  );
}
