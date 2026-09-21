import { useState } from 'react';
import { Link } from 'react-router-dom';
import { exportProgress, generateAndSaveRecoveryCode, getMyBadges, importProgress, restoreProgress } from '@/application/usecases';
import { badgeCatalog } from '@/content/badges/catalog';
import { SUPPORT_COPY } from '@/domain/support';
import { BadgeMedal, Button } from '@/presentation/design-system';
import { SupportModal } from '@/presentation/features/support';
import { useServices } from '@/presentation/app/ServicesContext';

export function SettingsPage() {
  const { progressRepository, leaderboard, analytics, generateRecoveryCode } = useServices();
  const [exported, setExported] = useState('');
  const [importText, setImportText] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [restoreName, setRestoreName] = useState('');
  const [restoreCode, setRestoreCode] = useState('');
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const earned = getMyBadges({ repository: progressRepository });
  const earnedCount = Object.keys(earned).length;
  const recentBadges = badgeCatalog.filter((b) => earned[b.id]).slice(0, 6);

  function handleExport() {
    const code = exportProgress({ repository: progressRepository });
    setExported(code);
    analytics.track('progress_exported');
  }

  function handleImport() {
    const result = importProgress({ repository: progressRepository }, { data: importText.trim() });
    if (result.ok) {
      setImportMessage('Progresso importado com sucesso! Atualize a página para ver.');
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
      if (result.ok) {
        setRestoreMessage('Progresso recuperado com sucesso! Atualize a página para ver.');
      } else {
        setRestoreMessage(result.reason);
      }
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div>
      <h1>Configurações</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>Insígnias</h2>
        <p>
          {earnedCount} de {badgeCatalog.length} conquistadas, entre todas as ilhas do arquipélago.
        </p>
        {recentBadges.length ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            {recentBadges.map((badge) => (
              <BadgeMedal key={badge.id} badge={badge} earned size={72} showCaption={false} />
            ))}
          </div>
        ) : null}
        <p style={{ marginTop: 12 }}>
          <Link to="/insignias">Ver o passaporte completo ▸</Link>
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Exportar progresso</h2>
        <p>Copie este código e guarde: ele permite continuar de outro aparelho ou depois de limpar o navegador.</p>
        <Button onClick={handleExport}>Gerar código</Button>
        {exported ? (
          <textarea
            readOnly
            value={exported}
            style={{ width: '100%', minHeight: 100, marginTop: 12, fontFamily: 'var(--font-mono)' }}
            onFocus={(e) => e.currentTarget.select()}
          />
        ) : null}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Importar progresso</h2>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Cole aqui o código exportado"
          style={{ width: '100%', minHeight: 100, fontFamily: 'var(--font-mono)' }}
        />
        <div style={{ marginTop: 12 }}>
          <Button onClick={handleImport} disabled={!importText.trim()}>
            Importar
          </Button>
        </div>
        {importMessage ? <p>{importMessage}</p> : null}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Código de recuperação</h2>
        <p>
          Seu nome aparece no Hall dos Viajantes, então sozinho ele não é suficiente pra provar que o progresso é
          seu — esse código extra resolve isso. Gere um código e guarde-o: ele é pedido junto com o nome para
          restaurar o progresso em outro aparelho.
        </p>
        <Button onClick={handleGenerateRecoveryCode} disabled={generatingCode}>
          {generatingCode ? 'Gerando...' : 'Gerar código de recuperação'}
        </Button>
        {recoveryCode ? (
          <>
            <p style={{ color: 'var(--color-error, #ff5d7a)', marginTop: 12 }}>
              Guarde este código agora, ele não aparece de novo.
            </p>
            <textarea
              readOnly
              value={recoveryCode}
              style={{ width: '100%', minHeight: 48, fontFamily: 'var(--font-mono)', fontSize: 16 }}
              onFocus={(e) => e.currentTarget.select()}
            />
          </>
        ) : null}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Recuperar progresso de outro aparelho</h2>
        <p>
          Já jogou antes com outro nome, neste ou em outro aparelho? Digite o nome usado na época e o código de
          recuperação gerado naquele momento para trazer aquele progresso de volta.
        </p>
        <p style={{ color: 'var(--color-error, #ff5d7a)' }}>
          Atenção: isso substitui o progresso salvo neste navegador agora. Se você tem algo aqui que ainda não
          exportou, exporte antes de continuar.
        </p>
        <input
          type="text"
          value={restoreName}
          onChange={(e) => setRestoreName(e.target.value)}
          placeholder="Nome do viajante"
          style={{ width: '100%', fontSize: 16, padding: '10px 12px', marginBottom: 12 }}
        />
        <input
          type="text"
          value={restoreCode}
          onChange={(e) => setRestoreCode(e.target.value)}
          placeholder="Código de recuperação"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          style={{ width: '100%', fontSize: 16, padding: '10px 12px', marginBottom: 12, fontFamily: 'var(--font-mono)' }}
        />
        <div>
          <Button onClick={handleRestore} disabled={!restoreName.trim() || !restoreCode.trim() || restoring}>
            {restoring ? 'Buscando...' : 'Recuperar progresso'}
          </Button>
        </div>
        {restoreMessage ? <p>{restoreMessage}</p> : null}
      </section>

      <section>
        <h2>Sobre o projeto</h2>
        <p>
          <button
            type="button"
            onClick={() => setSupportOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {SUPPORT_COPY.footerLinkLabel}
          </button>
        </p>
      </section>

      {supportOpen ? <SupportModal onClose={() => setSupportOpen(false)} /> : null}
    </div>
  );
}
