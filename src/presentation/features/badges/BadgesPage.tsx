import { useState } from 'react';
import { getMyBadges } from '@/application/usecases';
import { badgeCatalog } from '@/content/badges/catalog';
import { BadgeMedal, WalletIcon } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './BadgesPage.module.css';

const GROUP_LABEL: Record<string, string> = {
  logica: 'Era da Lógica',
  sql: 'Banco de Dados',
  git: 'Git e GitHub',
  python: 'Lua de Python',
  java: 'Lua de Java',
  outras: 'Outras eras (em breve)',
};

const GROUP_ORDER = ['logica', 'python', 'java', 'sql', 'git', 'outras'];

/**
 * "Carteira" do viajante: fechada por padrão (só um resumo), abre ao toque pra revelar
 * as insígnias do catálogo compartilhado (ver domain/badges), agrupadas por trilha,
 * cada uma no estado certo (conquistada, bloqueada com caminho, bloqueada sem lição
 * ligada ainda, ou "em breve" para a trilha "outras", que não existe). Fechada evita que
 * a tela do Viajante (SettingsPage), onde é embutida, fique "espalhada" com muitas medalhas
 * sempre visíveis — decisão do autor.
 */
export function BadgePassport() {
  const { progressRepository } = useServices();
  const earned = getMyBadges({ repository: progressRepository });
  const earnedCount = Object.keys(earned).length;
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button type="button" className={styles.wallet} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className={styles.walletIcon} aria-hidden="true">
          <WalletIcon />
        </span>
        <span className={styles.walletText}>
          <strong>Carteira de insígnias</strong>
          <span className={styles.summary}>
            {earnedCount} de {badgeCatalog.length} conquistadas
          </span>
        </span>
        <span className={styles.walletChevron} aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open ? (
        <div className={styles.walletContent}>
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
      ) : null}
    </div>
  );
}
