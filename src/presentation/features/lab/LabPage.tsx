import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getTrailProgress, openLab, resetLabDataset, runLabQuery, verifyMission } from '@/application/usecases';
import { hintFor } from '@/domain/lab';
import type { Mission } from '@/domain/trail';
import type { SqlDataset, SqlResultBlock } from '@/application/ports';
import { getTrailById } from '@/content/registry';
import { Button, NotebookFrame } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './LabPage.module.css';

const SHORTCUT_SYMBOLS = [';', ',', "'", '(', ')', '*', '=', '%', '_'];

function OutputBlocks({ blocks }: { blocks: SqlResultBlock[] }) {
  if (!blocks.length) {
    return <div className={styles.outInfo}>Rode um comando para ver o resultado aqui. Experimente \dt para listar as tabelas.</div>;
  }
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === 'table') {
          return (
            <div key={i} className={styles.outScroll}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    {block.cols.map((c, j) => (
                      <th key={j} style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid var(--color-line)' }}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c} style={{ padding: '6px 10px', borderBottom: '1px solid var(--color-line)' }}>
                          {cell === null || cell === undefined ? 'NULL' : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!block.rows.length && block.empty ? <p className={styles.outInfo}>{block.empty}</p> : null}
            </div>
          );
        }
        if (block.kind === 'ok') {
          return (
            <div key={i} className={styles.outOk}>
              Comando executado com sucesso{block.n ? ` · ${block.n} linha(s) afetada(s)` : ''}.
            </div>
          );
        }
        if (block.kind === 'info') {
          return (
            <div key={i} className={styles.outInfo}>
              {block.msg}
            </div>
          );
        }
        const hint = hintFor(block.msg);
        return (
          <div key={i} className={styles.outErr}>
            <code className={styles.outErrCode}>ERRO: {block.msg}</code>
            {hint ? <p>{hint}</p> : null}
          </div>
        );
      })}
    </>
  );
}

export function LabPage() {
  const { trailId } = useParams<{ trailId: string }>();
  const location = useLocation();
  const { sqlEngine, progressRepository, analytics } = useServices();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trail = trailId ? getTrailById(trailId) : undefined;
  const missions = trail?.missions ?? [];

  const [sql, setSql] = useState<string>(
    (location.state as { sql?: string } | null)?.sql ?? '-- Escreva seu SQL aqui e aperte Ctrl+Enter\nSELECT * FROM produtos;',
  );
  const [dataset, setDataset] = useState<SqlDataset>('loja');
  const [status, setStatus] = useState('Carregando o PostgreSQL... (só na primeira vez)');
  const [output, setOutput] = useState<SqlResultBlock[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missionFeedback, setMissionFeedback] = useState<{ ok: boolean; message?: string } | null>(null);
  const [missionsCompleted, setMissionsCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!trail) return;
    openLab({ engine: sqlEngine, analytics })
      .then(() => setStatus('PostgreSQL pronto. Rodando no seu navegador.'))
      .catch(() =>
        setStatus(
          'Não foi possível carregar o motor do PostgreSQL. Ele precisa de internet e de uma página hospedada.',
        ),
      );
    const { trailProgress } = getTrailProgress({ repository: progressRepository }, { trail });
    setMissionsCompleted(trailProgress?.missionsCompleted ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trail?.id]);

  if (!trail) return null;

  async function run() {
    const blocks = await runLabQuery({ engine: sqlEngine, analytics }, sql);
    setOutput(blocks);
  }

  async function switchDataset(ds: SqlDataset, options: { keepMission?: boolean } = {}) {
    setStatus('Preparando banco...');
    await resetLabDataset({ engine: sqlEngine }, ds);
    setDataset(ds);
    if (!options.keepMission) setSelectedMission(null);
    setOutput([]);
    setStatus(ds === 'loja' ? 'Pronto: loja de exemplo carregada.' : 'Pronto: banco vazio. Crie suas tabelas.');
  }

  function insertSymbol(symbol: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = sql.slice(0, start) + symbol + sql.slice(end);
    setSql(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + symbol.length;
    });
  }

  function selectMission(mission: Mission) {
    setSelectedMission(mission);
    setMissionFeedback(null);
    setSql(`-- Missão: ${mission.title}\n-- (banco: ${mission.ds === 'loja' ? 'loja de exemplo' : 'vazio'})\n\n`);
    switchDataset(mission.ds, { keepMission: true });
  }

  async function verify() {
    if (!selectedMission || !trail) return;
    const result = await verifyMission(
      { engine: sqlEngine, repository: progressRepository, analytics, trailId: trail.id },
      selectedMission,
      sql,
    );
    if (result.ok) {
      setMissionFeedback({ ok: true });
      setMissionsCompleted((prev) => ({ ...prev, [selectedMission.id]: true }));
    } else {
      setMissionFeedback({ ok: false, message: result.message });
    }
  }

  const doneCount = Object.keys(missionsCompleted).length;

  return (
    <article>
      <p className="eyebrow">Máquina do Tempo</p>
      <h1>Máquina do Tempo</h1>
      <p>Um PostgreSQL de verdade rodando dentro do seu navegador. Escreva, execute, erre e tente de novo: nada aqui estraga nada.</p>

      <div className={styles.bar}>
        <div className={styles.seg} role="group" aria-label="Banco de dados">
          <button
            type="button"
            className={`${styles.segButton} ${dataset === 'loja' ? styles.segButtonOn : ''}`}
            onClick={() => switchDataset('loja')}
          >
            Loja de exemplo
          </button>
          <button
            type="button"
            className={`${styles.segButton} ${dataset === 'vazio' ? styles.segButtonOn : ''}`}
            onClick={() => switchDataset('vazio')}
          >
            Banco vazio
          </button>
        </div>
        <span className={styles.status}>{status}</span>
      </div>

      <NotebookFrame title="editor.sql">
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Editor de SQL"
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              insertSymbol('    ');
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              run();
            }
          }}
        />
        <div className={styles.shortcuts} aria-label="Símbolos de atalho">
          {SHORTCUT_SYMBOLS.map((s) => (
            <button key={s} type="button" className={styles.shortcutKey} onClick={() => insertSymbol(s)}>
              {s}
            </button>
          ))}
        </div>
        <div className={styles.labActions}>
          <Button variant="alt" size="sm" onClick={run}>
            Executar ▸ <small>Ctrl+Enter</small>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSql('')}>
            Limpar
          </Button>
        </div>
      </NotebookFrame>

      <NotebookFrame title="Data Output">
        <OutputBlocks blocks={output} />
      </NotebookFrame>

      <h2>
        Missões práticas <span className={styles.status}>{doneCount}/{missions.length}</span>
      </h2>
      <div className={styles.missionsGrid}>
        {missions.map((mission) => (
          <button
            key={mission.id}
            type="button"
            className={styles.chip}
            onClick={() => selectMission(mission)}
            style={missionsCompleted[mission.id] ? { borderColor: 'var(--color-good)' } : undefined}
          >
            {missionsCompleted[mission.id] ? '✓ ' : ''}
            {mission.title}
          </button>
        ))}
      </div>

      {selectedMission ? (
        <div>
          <p dangerouslySetInnerHTML={{ __html: selectedMission.brief }} />
          <p className={styles.status}>Dica: {selectedMission.hint}</p>
          <Button size="sm" onClick={verify}>
            Verificar
          </Button>
          {missionFeedback ? (
            <p className={missionFeedback.ok ? styles.feedbackOk : styles.feedbackBad}>
              {missionFeedback.ok ? 'Missão cumprida! Seu SQL produziu exatamente o resultado esperado.' : missionFeedback.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
