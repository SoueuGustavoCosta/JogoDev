import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BIO_MAX_LENGTH,
  getCachedBio,
  getTraveler,
  hasPhoneLinked,
  needsSignInAgain,
  saveBio,
  signOutTraveler,
} from '@/application/usecases';
import { SUPPORT_COPY } from '@/domain/support';
import { Button, isSoundMuted, Modal, playTestSound, setSoundMuted } from '@/presentation/design-system';
import { BadgePassport } from '@/presentation/features/badges';
import { SupportModal } from '@/presentation/features/support';
import { useAccountSheet } from '@/presentation/features/account';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { progressRepository, leaderboard } = useServices();
  const { openAccount } = useAccountSheet();
  const [supportOpen, setSupportOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [bio, setBio] = useState(() => getCachedBio({ repository: progressRepository }));
  const [muted, setMuted] = useState(() => isSoundMuted());

  const name = getTraveler({ repository: progressRepository }).name;
  const linked = hasPhoneLinked({ repository: progressRepository });
  const expired = needsSignInAgain({ repository: progressRepository });

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
    // Recarrega o app inteiro (todo estado em memória é recriado do zero) já na tela de
    // escolha: entrar numa conta ou criar uma.
    window.location.href = linked || expired ? '/conta?saiu=1' : '/conta';
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
        <h2>Conta</h2>
        {linked ? (
          <p className={styles.hint}>
            Seu progresso está salvo na sua conta. Sair encerra a conta só neste aparelho, para outra pessoa entrar com a
            dela; depois é só tocar em &quot;Entrar&quot; com o mesmo telefone e senha para voltar.
          </p>
        ) : expired ? (
          <>
            <p className={styles.warn}>
              Sua sessão expirou: o progresso deste aparelho está guardado aqui, mas não está sendo salvo na conta.
            </p>
            <p className={styles.hint}>
              <button type="button" className={styles.accountButton} onClick={() => openAccount('login')}>
                Entrar de novo ▸
              </button>
            </p>
          </>
        ) : (
          <>
            <p className={styles.hint}>
              Você está jogando sem conta: o progresso só existe neste aparelho. Crie uma conta para salvar e continuar
              de qualquer lugar.
            </p>
            <div className={styles.accountLinks}>
              <button type="button" className={styles.accountButton} onClick={() => openAccount('signup')}>
                Salvar progresso (criar conta) ▸
              </button>
              <button type="button" className={styles.accountButton} onClick={() => openAccount('login')}>
                Já tenho conta ▸
              </button>
            </div>
          </>
        )}
        <p className={styles.hint}>
          <Button variant="ghost" size="sm" onClick={() => setSignOutOpen(true)}>
            Sair desta conta
          </Button>
        </p>
      </section>

      {/* Contribuição: botão discreto (sem brilho, sem ficar fixo), só abre o modal ao toque (CLAUDE.md seção 9). */}
      <section className={styles.section}>
        <Button variant="ghost" size="sm" onClick={() => setSupportOpen(true)}>
          {SUPPORT_COPY.footerLinkLabel}
        </Button>
      </section>

      {signOutOpen ? (
        <Modal title="Sair desta conta" onClose={() => (signingOut ? undefined : setSignOutOpen(false))}>
          <h2>Tem certeza?</h2>
          <p className={linked ? styles.hint : styles.warn}>
            {linked
              ? 'O progresso continua salvo na nuvem — é só entrar de novo com telefone e senha quando quiser.'
              : expired
                ? 'Sua sessão expirou: o que você fez neste aparelho desde então ainda não subiu para a conta. Entre de novo antes de sair para não perder nada.'
                : 'Sem conta, sair agora apaga o progresso deste aparelho para sempre. Crie uma conta antes, se quiser guardar.'}
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
