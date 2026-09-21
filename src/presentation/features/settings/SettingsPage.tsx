import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BIO_MAX_LENGTH, getCachedBio, getTraveler, saveBio } from '@/application/usecases';
import { SUPPORT_COPY } from '@/domain/support';
import { BadgePassport } from '@/presentation/features/badges';
import { SupportModal } from '@/presentation/features/support';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { progressRepository, leaderboard } = useServices();
  const [supportOpen, setSupportOpen] = useState(false);
  const [bio, setBio] = useState(() => getCachedBio({ repository: progressRepository }));

  const name = getTraveler({ repository: progressRepository }).name;

  function handleBioBlur() {
    const saved = saveBio({ repository: progressRepository, leaderboard }, { bio });
    setBio(saved);
  }

  return (
    <div>
      <h1>Viajante</h1>

      <section className={styles.section}>
        <BadgePassport />
      </section>

      <section className={styles.section}>
        <div className={styles.idCard}>
          <div className={styles.idField}>
            <span className={styles.idLabel}>Nome</span>
            <span className={styles.idValue}>{name}</span>
          </div>
        </div>
        <p className={styles.hint}>
          <Link className={styles.link} to="/prologo">
            trocar de nome ▸
          </Link>
        </p>
      </section>

      <section className={styles.section}>
        <h2>Sobre você</h2>
        <p className={styles.hint}>
          Um resumo curto pra aparecer no Hall dos Viajantes, do seu jeito: curso, período, o que estiver estudando.
        </p>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX_LENGTH))}
          onBlur={handleBioBlur}
          placeholder="Ex.: Curso Ciência da Computação, 4º período, na tal universidade."
          className={styles.field}
          style={{ minHeight: 52 }}
          maxLength={BIO_MAX_LENGTH}
        />
        <p className={styles.hint} style={{ margin: 0 }}>
          {bio.length}/{BIO_MAX_LENGTH}
        </p>
      </section>

      <section className={styles.section}>
        <button type="button" className={styles.muted} onClick={() => setSupportOpen(true)}>
          {SUPPORT_COPY.footerLinkLabel}
        </button>
      </section>

      {supportOpen ? <SupportModal onClose={() => setSupportOpen(false)} /> : null}
    </div>
  );
}
