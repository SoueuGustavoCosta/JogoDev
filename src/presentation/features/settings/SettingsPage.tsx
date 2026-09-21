import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  exportProgress,
  generateAndSaveRecoveryCode,
  getCachedRecoveryCode,
  getMyBadges,
  getTraveler,
  importProgress,
  restoreProgress,
} from '@/application/usecases';
import { badgeCatalog } from '@/content/badges/catalog';
import { SUPPORT_COPY } from '@/domain/support';
import { Button } from '@/presentation/design-system';
import { SupportModal } from '@/presentation/features/support';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { progressRepository, leaderboard, analytics, generateRecoveryCode } = useServices();
  const [exported, setExported] = useState('');
  const [importText, setImportText] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState(() => getCachedRecoveryCode({ repository: progressRepository }));
  const [generatingCode, setGeneratingCode] = useState(false);
  const [restoreName, setRestoreName] = useState('');
  const [restoreCode, setRestoreCode] = useState('');
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const name = getTraveler({ repository: progressRepository }).name;
  const earned = getMyBadges({ repository: progressRepository });
  const earnedCount = Object.keys(earned).length;

  function handleExport() {
    const code = exportProgress({ repository: progressRepository });
    setExported(code);
    analytics.track('progress_exported');
  }

  function handleImport() {
    const result = importProgress({ repository: progressRepository }, { data: importText.trim() });
    if (result.ok) {
      setImportMessage('Importado! Atualize a página para ver.');
      analytics.track('progress_imported');
    } else {
      setImportMessage(result.reason);
    }
  }

  async function handleGenerateRecoveryCode() {
    setGeneratingCode(true);
    try {
      const code = generateRecoveryCode();
      const saved = await generateAndSaveRecoveryCode({ repository: progressRepository, leaderboard }, { code });
      setRecoveryCode(saved);
      analytics.track('recovery_code_generated');
    } finally {
      setGeneratingCode(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    setRestoreMessage(null);
    try {
      const result = await restoreProgress(
        { repository: progressRepository, leaderboard },
        { nome: restoreName, codigo: restoreCode },
      );
      setRestoreMessage(result.ok ? 'Recuperado! Atualize a página para ver.' : result.reason);
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div>
      <h1>Viajante</h1>

      <section className={styles.section}>
        <div className={styles.idCard}>
          <div className={styles.idField}>
            <span className={styles.idLabel}>Nome</span>
            <span className={styles.idValue}>{name}</span>
          </div>
          <div className={styles.idField}>
            <span className={styles.idLabel}>Código de recuperação</span>
            <span className={`${styles.idValue} ${styles.code}`}>{recoveryCode ?? '— ainda não gerado —'}</span>
          </div>
          <div className={styles.idActions}>
            <Button size="sm" variant="ghost" onClick={handleGenerateRecoveryCode} disabled={generatingCode}>
              {generatingCode ? '...' : recoveryCode ? 'Gerar outro' : 'Gerar código'}
            </Button>
          </div>
        </div>
        <p className={styles.hint}>
          O código só aparece pra você, aqui neste aparelho. É o que prova que um progresso é seu ao recuperar em
          outro lugar — sem ele, seu nome sozinho (que é público no Hall) não basta.
        </p>
        <p className={styles.hint}>
          {earnedCount}/{badgeCatalog.length} insígnias ·{' '}
          <Link className={styles.link} to="/insignias">
            ver passaporte ▸
          </Link>{' '}
          ·{' '}
          <Link className={styles.link} to="/prologo">
            trocar de nome ▸
          </Link>
        </p>
      </section>

      <section className={styles.section}>
        <h2>Backup por código</h2>
        <div className={styles.row}>
          <Button size="sm" onClick={handleExport}>
            Copiar meu progresso
          </Button>
        </div>
        {exported ? (
          <textarea
            readOnly
            value={exported}
            className={`${styles.field} ${styles.code}`}
            style={{ minHeight: 64, marginTop: 8 }}
            onFocus={(e) => e.currentTarget.select()}
          />
        ) : null}
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Colar um código de backup aqui"
          className={`${styles.field} ${styles.code}`}
          style={{ minHeight: 64, marginTop: 10 }}
        />
        <Button size="sm" variant="ghost" onClick={handleImport} disabled={!importText.trim()}>
          Importar
        </Button>
        {importMessage ? <p className={styles.message}>{importMessage}</p> : null}
      </section>

      <section className={styles.section}>
        <h2>Recuperar pelo nome</h2>
        <p className={styles.warn}>Substitui o progresso deste navegador. Exporte antes se ainda não guardou nada.</p>
        <input
          type="text"
          value={restoreName}
          onChange={(e) => setRestoreName(e.target.value)}
          placeholder="Nome do viajante"
          className={styles.field}
        />
        <input
          type="text"
          value={restoreCode}
          onChange={(e) => setRestoreCode(e.target.value)}
          placeholder="Código de recuperação"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className={`${styles.field} ${styles.code}`}
        />
        <Button size="sm" variant="ghost" onClick={handleRestore} disabled={!restoreName.trim() || !restoreCode.trim() || restoring}>
          {restoring ? 'Buscando...' : 'Recuperar'}
        </Button>
        {restoreMessage ? <p className={styles.message}>{restoreMessage}</p> : null}
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
