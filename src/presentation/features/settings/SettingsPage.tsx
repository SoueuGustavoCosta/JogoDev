import { useState } from 'react';
import { Link } from 'react-router-dom';
import { exportProgress, getMyBadges, importProgress } from '@/application/usecases';
import { badgeCatalog } from '@/content/badges/catalog';
import { SUPPORT_COPY } from '@/domain/support';
import { BadgeMedal, Button } from '@/presentation/design-system';
import { SupportModal } from '@/presentation/features/support';
import { useServices } from '@/presentation/app/ServicesContext';

export function SettingsPage() {
  const { progressRepository, analytics } = useServices();
  const [exported, setExported] = useState('');
  const [importText, setImportText] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

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
