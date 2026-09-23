import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BIO_MAX_LENGTH, getCachedBio, getTraveler, hasPhoneLinked, saveBio, signOutTraveler } from '@/application/usecases';
import { SUPPORT_COPY } from '@/domain/support';
import { Button, isSoundMuted, Modal, playTestSound, setSoundMuted } from '@/presentation/design-system';
import { BadgePassport } from '@/presentation/features/badges';
import { SupportModal } from '@/presentation/features/support';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { progressRepository, leaderboard } = useServices();
  const [supportOpen, setSupportOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [bio, setBio] = useState(() => getCachedBio({ repository: progressRepository }));
  const [muted, setMuted] = useState(() => isSoundMuted());

  const name = getTraveler({ repository: progressRepository }).name;
  const linked = hasPhoneLinked({ repository: progressRepository });

  function toggleSound() {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
    if (!next) playTestSound();
  }

  function handleBioBlur() {
    const saved = saveBio({ repository: progressRepository, leaderboard }, { bio });
    setBio(saved);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOutTraveler({ repository: progressRepository, leaderboard });
    // Recarrega o app inteiro: é a forma mais simples de garantir que todo estado em
    // memória (nome em cache, sessão anônima antiga etc.) seja recriado do zero.
    window.location.href = '/';
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
        <h2>Som</h2>
        <p className={styles.hint}>Sons suaves pelo jogo: o ambiente calmo da Praça da Sintaxe, o vórtice ao entrar numa era, a voz da Sintaxe, o quiz e o chefão. Desligue aqui se preferir silêncio.</p>
        <Button variant="ghost" size="sm" onClick={toggleSound} aria-pressed={!muted}>
          {muted ? '🔇 Som desligado' : '🔊 Som ligado'}
        </Button>
      </section>

      <section className={styles.section}>
        <h2>Sair</h2>
        <p className={styles.hint}>
          {linked
            ? 'Encerra sua conta neste aparelho, para outra pessoa entrar com a dela. Depois é só usar "Salvar ou entrar" com o mesmo telefone e senha para voltar.'
            : 'Você ainda não salvou telefone e senha: o progresso deste aparelho só existe aqui. Sair agora apaga tudo, sem jeito de recuperar.'}
        </p>
        <Button variant="ghost" size="sm" onClick={() => setSignOutOpen(true)}>
          Sair desta conta
        </Button>
      </section>

      <section className={styles.section}>
        <button type="button" className={styles.muted} onClick={() => setSupportOpen(true)}>
          {SUPPORT_COPY.footerLinkLabel}
        </button>
      </section>

      {signOutOpen ? (
        <Modal title="Sair desta conta" onClose={() => (signingOut ? undefined : setSignOutOpen(false))}>
          <h2>Tem certeza?</h2>
          <p className={linked ? styles.hint : styles.warn}>
            {linked
              ? 'O progresso continua salvo na nuvem — é só entrar de novo com telefone e senha quando quiser.'
              : 'Sem telefone e senha salvos, sair agora apaga o progresso deste aparelho para sempre.'}
          </p>
          <div className={styles.row}>
            <Button variant="alt" size="sm" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? 'Saindo...' : 'Sim, sair'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSignOutOpen(false)} disabled={signingOut}>
              Cancelar
            </Button>
          </div>
        </Modal>
      ) : null}

      {supportOpen ? <SupportModal onClose={() => setSupportOpen(false)} /> : null}
    </div>
  );
}
