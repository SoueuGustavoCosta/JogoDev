import type { Badge } from '@/domain/badges';
import { BADGE_TRAIL_TO_TRAIL_ID } from '@/content/badges/catalog';
import { trailRegistry } from '@/content/registry';
import { Badge3D } from './Badge3D';
import styles from './BadgeMedal.module.css';

export type BadgeMedalState = 'earned' | 'locked-path' | 'locked-unassigned' | 'soon';

/** O que falta para desbloquear, em texto curto — ou null quando não há o que dizer (já conquistada). */
function unlockCaption(badge: Badge): string | null {
  if (badge.trail === 'outras') return 'Em breve — era ainda não existe';
  if (!badge.unlockedBy) return 'Ainda sem lição ligada a esta insígnia';

  if (badge.unlockedBy === 'boss') return 'Vença o chefe de fase da trilha';

  const trailId = BADGE_TRAIL_TO_TRAIL_ID[badge.trail];
  const trail = trailRegistry.find((t) => t.id === trailId);
  const mod = trail?.modules.find((m) => m.id === badge.unlockedBy);
  return mod ? `Conclua o farol "${mod.short}"` : 'Ainda sem lição ligada a esta insígnia';
}

export function badgeMedalState(badge: Badge, earned: boolean): BadgeMedalState {
  if (earned) return 'earned';
  if (badge.trail === 'outras') return 'soon';
  if (!badge.unlockedBy) return 'locked-unassigned';
  return 'locked-path';
}

/**
 * Uma insígnia real (webp servido de /public/badges), em um dos quatro estados:
 * conquistada (colorida), bloqueada-com-caminho (esmaecida + o que falta), bloqueada
 * sem lição ligada ainda, ou "em breve" (trilha "outras", que ainda não existe).
 * Substitui os SVGs ad-hoc de DatabaseBadge/GitBadge/TrailBadge.
 */
export function BadgeMedal({
  badge,
  earned,
  size = 96,
  showCaption = true,
  spin = false,
}: {
  badge: Badge;
  earned: boolean;
  size?: number;
  showCaption?: boolean;
  /** Gira sozinha em loop (tela de vitória, coroa da coleção) — desligado por padrão e sempre com `prefers-reduced-motion`. */
  spin?: boolean;
}) {
  const state = badgeMedalState(badge, earned);
  const locked = state !== 'earned';
  const caption = locked ? unlockCaption(badge) : null;

  return (
    <div className={`${styles.medal} ${locked ? styles.locked : ''}`}>
      <span className={styles.imgWrap}>
        <Badge3D
          file={badge.file}
          label={locked ? `${badge.name} (bloqueada)` : badge.name}
          size={size}
          locked={locked}
          spin={spin && !locked}
        />
        {badge.crown && state === 'earned' ? <span className={styles.crownRing} aria-hidden="true" /> : null}
      </span>
      <span className={styles.name}>{badge.name}</span>
      {showCaption ? <span className={styles.caption}>{locked ? caption : badge.description}</span> : null}
    </div>
  );
}
