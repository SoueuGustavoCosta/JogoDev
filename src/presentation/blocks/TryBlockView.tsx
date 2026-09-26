import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { prepareTryEngine, runTryBlock, type TryRunResult } from '@/application/usecases';
import { hintFor, phpHintFor } from '@/domain/lab';
import type { TryBlock, TryEngine } from '@/domain/trail';
import { NotebookFrame } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './TryBlockView.module.css';

const LABEL: Record<TryEngine, string> = {
  sql: 'postgres de verdade',
  php: 'php de verdade',
  git: 'terminal git',
};

const DEFAULT_FILE: Record<TryEngine, string> = { sql: 'consulta.sql', php: 'script.php', git: 'terminal' };

/** Símbolos e palavras difíceis de digitar no celular, por motor. */
const SHORTCUTS: Record<TryEngine, string[]> = {
  sql: ['SELECT', 'FROM', 'WHERE', '=', 'AND', "'", ';', 'ORDER BY', 'JOIN', 'ON'],
  php: ['echo', '$', '=', ';', '"', '.', '(', ')', '{', '}'],
  git: ['git', 'init', 'add', '.', 'commit -m', '"', 'status', 'switch', 'merge'],
};

const LOADING_TEXT: Record<TryEngine, string> = {
  sql: 'Preparando seu banco de dados, só na primeira vez...',
  php: 'Preparando o PHP, só na primeira vez...',
  git: '',
};

type EngineState = 'idle' | 'loading' | 'ready' | 'failed';

/**
 * "Sua vez" (bloco `try`, Etapa 6): editor curto, atalhos de toque, "Rodar" e a conferência.
 * O motor (PGlite ou PHP em WebAssembly, vários MB) só carrega quando o bloco aparece na tela
 * (ou no primeiro "Rodar", se o navegador não souber avisar). Se não carregar (aparelho sem
 * WebAssembly), a lição segue normalmente: o laboratório é um extra.
 */
export function TryBlockView({ block }: { block: TryBlock }) {
  const { sqlEngine, phpEngine, analytics } = useServices();
  const deps = { sqlEngine, phpEngine, analytics };
  const [code, setCode] = useState(block.starter);
  const [engine, setEngine] = useState<EngineState>(block.engine === 'git' ? 'ready' : 'idle');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TryRunResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const loading = useRef<Promise<boolean> | null>(null);
  /** Onde o cursor deve ficar depois de um atalho (aplicado logo após o React atualizar o texto). */
  const pendingCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = editorRef.current;
    if (el && pendingCaret.current !== null) {
      el.focus();
      el.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  }, [code]);

  function ensureEngine(): Promise<boolean> {
    if (!loading.current) {
      setEngine((e) => (e === 'ready' ? e : 'loading'));
      loading.current = prepareTryEngine(deps, block.engine).then(
        () => {
          setEngine('ready');
          return true;
        },
        () => {
          setEngine('failed');
          return false;
        },
      );
    }
    return loading.current;
  }

  // Carrega o motor quando o bloco entra na tela (a lição em telas curtas o mostra sozinho).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void ensureEngine();
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    if (running) return;
    setRunning(true);
    try {
      if (!(await ensureEngine())) return;
      setResult(await runTryBlock(deps, block, code));
    } catch {
      setEngine('failed');
    } finally {
      setRunning(false);
    }
  }

  function insert(text: string) {
    const el = editorRef.current;
    const start = el?.selectionStart ?? code.length;
    const end = el?.selectionEnd ?? code.length;
    const before = code.slice(0, start);
    const needsSpace = /[A-Za-z]$/.test(text) && before.length > 0 && !/\s$/.test(before);
    const piece = (needsSpace ? ' ' : '') + text + (/^[A-Za-z]/.test(text) ? ' ' : '');
    pendingCaret.current = start + piece.length;
    setCode(before + piece + code.slice(end));
  }

  const lines = Math.max(4, code.split('\n').length + 1);

  return (
    <div ref={rootRef} className={styles.root}>
      <p className={styles.eyebrow}>sua vez · {LABEL[block.engine]}</p>
      <h2 className={styles.brief}>{block.brief}</h2>

      <NotebookFrame title={block.file ?? DEFAULT_FILE[block.engine]}>
        <textarea
          ref={editorRef}
          className={styles.editor}
          value={code}
          rows={lines}
          onChange={(e) => setCode(e.target.value)}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-label="Seu código"
        />
      </NotebookFrame>

      <div className={styles.shortcuts} role="group" aria-label="Atalhos de digitação">
        {SHORTCUTS[block.engine].map((s) => (
          <button
            key={s}
            type="button"
            className={styles.chip}
            // Não tira o foco do editor: o teclado do celular continua aberto e o cursor no lugar.
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => insert(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.hintBtn} onClick={() => setShowHint((v) => !v)} aria-expanded={showHint}>
          Dica
        </button>
        <button type="button" className={styles.run} onClick={run} disabled={running || engine === 'failed'}>
          {running ? 'Rodando...' : 'Rodar ▶'}
        </button>
      </div>

      {showHint ? (
        <p className={styles.hint} role="status">
          <b>Dica:</b> {block.hint}
        </p>
      ) : null}

      {engine === 'loading' && running ? <p className={styles.status}>{LOADING_TEXT[block.engine]}</p> : null}
      {engine === 'failed' ? (
        <p className={styles.status} role="status">
          O laboratório não carregou neste aparelho. Sem problema: a lição continua normalmente.
        </p>
      ) : null}

      {result ? <TryResult result={result} /> : null}


    </div>
  );
}

function Verdict({ result, summary }: { result: TryRunResult; summary?: string }) {
  const ok = result.verdict.ok;
  return (
    <div className={`${styles.verdict} ${ok ? styles.ok : styles.no}`} role="status">
      {summary ? `${summary} · ` : ''}
      {ok ? 'bateu com o esperado ✓' : result.verdict.ok ? '' : result.verdict.message}
    </div>
  );
}

function TryResult({ result }: { result: TryRunResult }) {
  if (result.engine === 'git') {
    return (
      <div className={styles.result}>
        <Verdict result={result} />
        <pre className={styles.terminal}>
          {result.lines.map((line, i) => (
            <span key={i} className={styles[line.cls.replace('tl-', 't_')]}>
              {line.cls === 'tl-cmd' ? `$ ${line.text}` : line.text}
              {'\n'}
            </span>
          ))}
        </pre>
      </div>
    );
  }

  if (result.engine === 'php') {
    const error = result.stderr.trim();
    return (
      <div className={styles.result}>
        <Verdict result={result} />
        <pre className={styles.terminal}>{result.stdout || '(nada apareceu na tela)'}</pre>
        {error ? <p className={styles.error}>{phpHintFor(error) || error}</p> : null}
      </div>
    );
  }

  const tables = result.blocks.filter((b) => b.kind === 'table');
  const last = tables[tables.length - 1];
  const summary = last && last.kind === 'table' ? `${last.rows.length} linha${last.rows.length === 1 ? '' : 's'}` : undefined;
  return (
    <div className={styles.result}>
      <Verdict result={result} summary={summary} />
      {result.blocks.map((b, i) => {
        if (b.kind === 'table') {
          return (
            <div key={i} className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {b.cols.map((c, j) => (
                      <th key={j}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c}>{cell === null || cell === undefined ? 'NULL' : String(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (b.kind === 'err') {
          const hint = hintFor(b.msg);
          return (
            <p key={i} className={styles.error}>
              {b.msg}
              {hint ? <span className={styles.errorHint}>{hint}</span> : null}
            </p>
          );
        }
        if (b.kind === 'ok') return <p key={i} className={styles.okLine}>Comando executado{b.n ? ` · ${b.n} linha(s) afetada(s)` : ''}.</p>;
        return (
          <p key={i} className={styles.okLine}>
            {b.msg}
          </p>
        );
      })}
    </div>
  );
}
