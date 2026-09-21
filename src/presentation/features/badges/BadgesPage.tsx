import { getMyBadges } from '@/application/usecases';
import { badgeCatalog } from '@/content/badges/catalog';
import { BadgeMedal } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './BadgesPage.module.css';

const GROUP_LABEL: Record<string, string> = {
  logica: 'Ilha da Lógica',
  sql: 'Banco de Dados',
  git: 'Git e GitHub',
  outras: 'Outras ilhas (em breve)',
};

const GROUP_ORDER = ['logica', 'sql', 'git', 'outras'];

/**
 * "Passaporte" do viajante: as 51 insígnias do catálogo compartilhado (ver domain/badges),
 * agrupadas por trilha, cada uma no estado certo (conquistada, bloqueada com caminho,
 * bloqueada sem lição ligada ainda, ou "em breve" para a trilha "outras", que não existe).
 * Sem cabeçalho de página próprio: é embutido no topo da tela do Viajante (SettingsPage).
 */
export function BadgePassport() {
  const { progressRepository } = useServices();
  const earned = getMyBadges({ repository: progressRepository });
  const earnedCount = Object.keys(earned).length;

  return (
    <div>
      <p className={styles.summary}>
        {earnedCount} de {badgeCatalog.length} insígnias conquistadas, entre todas as ilhas do arquipélago — inclusive
        as que ainda não existem.
      </p>

      {GROUP_ORDER.map((trailSlug) => {
        const badges = badgeCatalog.filter((b) => b.trail === trailSlug);
        if (badges.length === 0) return null;
        const groupEarned = badges.filter((b) => earned[b.id]).length;
        return (
          <section key={trailSlug} className={styles.group}>
            <h2>{GROUP_LABEL[trailSlug] ?? trailSlug}</h2>
            <p className={styles.count}>
              {groupEarned} de {badges.length}
            </p>
            <div className={styles.grid}>
              {badges.map((badge) => (
                <BadgeMedal key={badge.id} badge={badge} earned={Boolean(earned[badge.id])} size={88} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
