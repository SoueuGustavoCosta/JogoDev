import { useId, useMemo } from 'react';
import type { GemIcon, GemSpec } from '@/domain/webEra';
import { GEM_ICONS, gemSvg } from './gemSvg';
import styles from './GemBadge.module.css';

/**
 * Insígnia-gema da Era da Web: gema lapidada com ícone, nas variações comum, rara (estrela
 * roxa), lendária (raios dourados girando + brilho) e lua (moldura crescente). O SVG é
 * gerado pelo próprio projeto (`gemSvg`), nunca por texto de fora, por isso vai direto no DOM.
 */
export function GemBadge({ gem, size = 74, locked = false, className }: { gem: GemSpec; size?: number; locked?: boolean; className?: string }) {
  const uid = useId();
  const svg = useMemo(() => gemSvg(gem, uid), [gem, uid]);
  return (
    <span
      className={`${styles.gem} ${locked ? styles.locked : ''} ${className ?? ''}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** Só o ícone de uma gema (branco), para dentro de portais. */
export function GemIconSvg({ icon, size = 46 }: { icon: GemIcon; size?: number }) {
  return <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" dangerouslySetInnerHTML={{ __html: GEM_ICONS[icon] }} />;
}
