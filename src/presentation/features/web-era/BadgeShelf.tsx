import type { GemSpec } from '@/domain/webEra';
import { GemBadge } from '@/presentation/design-system';
import styles from './WebEra.module.css';

const TIER_LABEL: Partial<Record<GemSpec['tier'], [string, string]>> = {
  rara: ['RARA', styles.tierRare!],
  lendaria: ['LENDÁRIA', styles.tierLegend!],
  lua: ['EXCLUSIVA', styles.tierMoon!],
};

/** Estante das insígnias-gema da era (as que ainda faltam aparecem apagadas). */
export function BadgeShelf({ gems, earned }: { gems: readonly GemSpec[]; earned: Record<string, string> }) {
  return (
    <div className={styles.shelf}>
      {gems.map((g) => {
        const on = Boolean(earned[g.badgeId]);
        const tier = TIER_LABEL[g.tier];
        return (
          <div key={g.badgeId} className={`${styles.bdg} ${on ? '' : styles.off}`}>
            <GemBadge gem={g} size={74} locked={!on} />
            <small>
              {g.name}
              {on ? '' : ' (bloqueada)'}
              {tier ? (
                <>
                  <br />
                  <b className={tier[1]}>{tier[0]}</b>
                </>
              ) : null}
            </small>
          </div>
        );
      })}
    </div>
  );
}
