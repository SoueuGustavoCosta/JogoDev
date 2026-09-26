import { useState } from 'react';
import { Modal, SintaxeFace } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './InstallSheet.module.css';

/**
 * Tela curta "Adicionar à tela inicial" (Etapa 12A), com o passo a passo para Android e
 * iPhone. No Android com Chrome, o botão "Instalar" abre o pedido nativo do navegador.
 */
export function InstallSheet({ onClose }: { onClose: () => void }) {
  const { install } = useServices();
  const platform = install.platform();
  const [tab, setTab] = useState<'android' | 'ios'>(platform === 'ios' ? 'ios' : 'android');
  const [status, setStatus] = useState<string | null>(null);
  const native = install.canPromptNatively();

  async function installNow() {
    const accepted = await install.promptNatively();
    setStatus(accepted ? 'Pronto! O Arquipélago está na sua tela inicial.' : 'Tudo bem. Dá para instalar depois, pela aba Viajante.');
    if (accepted) window.setTimeout(onClose, 1500);
  }

  return (
    <Modal title="Adicionar à tela inicial" onClose={onClose}>
      <div className={styles.head}>
        <SintaxeFace size={40} />
        <div>
          <h2>Me leve na tela inicial</h2>
          <p>Assim a Anomalia do Dia fica a um toque, e as lições abrem até sem internet depois do primeiro acesso.</p>
        </div>
      </div>

      {native ? (
        <button type="button" className={styles.primary} onClick={() => void installNow()}>
          Instalar
        </button>
      ) : null}

      <div className={styles.tabs} role="tablist" aria-label="Celular">
        <button type="button" role="tab" aria-selected={tab === 'android'} className={tab === 'android' ? styles.tabOn : styles.tab} onClick={() => setTab('android')}>
          Android
        </button>
        <button type="button" role="tab" aria-selected={tab === 'ios'} className={tab === 'ios' ? styles.tabOn : styles.tab} onClick={() => setTab('ios')}>
          iPhone
        </button>
      </div>

      {tab === 'android' ? (
        <ol className={styles.steps}>
          <li>
            Abra o site no <b>Chrome</b>.
          </li>
          <li>
            Toque no menu <b>⋮</b> (canto de cima).
          </li>
          <li>
            Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.
          </li>
        </ol>
      ) : (
        <ol className={styles.steps}>
          <li>
            Abra o site no <b>Safari</b> (no iPhone, só ele instala).
          </li>
          <li>
            Toque em <b>Compartilhar</b> (o quadrado com a seta para cima).
          </li>
          <li>
            Role e escolha <b>Adicionar à Tela de Início</b>.
          </li>
        </ol>
      )}

      {status ? (
        <p className={styles.status} role="status">
          {status}
        </p>
      ) : null}
      <button type="button" className={styles.secondary} onClick={onClose}>
        Agora não
      </button>
    </Modal>
  );
}
