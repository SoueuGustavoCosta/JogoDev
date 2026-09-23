import { useEffect, useRef, useState } from 'react';
import { openPhpLab, runPhpCode } from '@/application/usecases';
import { phpHintFor, phpLooksLikeError } from '@/domain/lab';
import type { Trail } from '@/domain/trail';
import { Button, NotebookFrame } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './PhpLabPage.module.css';

const SHORTCUT_SYMBOLS = ['$', ';', '.', '(', ')', '{', '}', '"', "'"];

const STARTER_CODE = '<?php\n// Escreva seu PHP aqui e aperte Ctrl+Enter\necho "Olá, viajante!";\n';

/** Laboratório de PHP (Ilha da Lógica): PHP 8.3 de verdade, rodando no navegador via WebAssembly. */
export function PhpLabPage({ trail: _trail }: { trail: Trail }) {
  const { phpEngine, analytics } = useServices();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [code, setCode] = useState(STARTER_CODE);
  const [status, setStatus] = useState('Carregando o PHP... (só na primeira vez)');
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{ stdout: string; stderr: string } | null>(null);

  useEffect(() => {
    openPhpLab({ engine: phpEngine, analytics })
      .then(() => setStatus('PHP 8.3 pronto. Rodando no seu navegador.'))
      .catch(() =>
        setStatus('Não foi possível carregar o motor do PHP. Ele precisa de internet e de uma página hospedada.'),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    setRunning(true);
    try {
      const result = await runPhpCode({ engine: phpEngine, analytics }, code);
      setOutput(result);
    } finally {
      setRunning(false);
    }
  }

  function insertSymbol(symbol: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = code.slice(0, start) + symbol + code.slice(end);
    setCode(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + symbol.length;
    });
  }

  // O php-wasm nem sempre separa aviso/erro do PHP do canal normal de saída (ver
  // PhpEnginePort.run) — por isso a dica e o "isso é erro?" olham o texto inteiro,
  // não só stderr.
  const combined = `${output?.stdout ?? ''}${output?.stderr ?? ''}`;
  const isError = combined ? phpLooksLikeError(combined) : false;
  const hint = combined ? phpHintFor(combined) : '';

  return (
    <article>
      <p className="eyebrow">Máquina do Tempo</p>
      <h1>Máquina do Tempo</h1>
      <p>Um PHP de verdade rodando dentro do seu navegador. Escreva, execute, erre e tente de novo: nada aqui estraga nada.</p>

      <div className={styles.bar}>
        <span className={styles.status}>{status}</span>
      </div>

      <NotebookFrame title="editor.php">
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Editor de PHP"
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
          <Button variant="alt" size="sm" onClick={run} disabled={running}>
            {running ? 'Executando...' : 'Executar ▸'} <small>Ctrl+Enter</small>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCode('')}>
            Limpar
          </Button>
        </div>
      </NotebookFrame>

      <NotebookFrame title="Saída">
        {!output ? (
          <div className={styles.outInfo}>Rode o código para ver a saída aqui.</div>
        ) : !combined ? (
          <div className={styles.outInfo}>Rodou sem erro, mas não imprimiu nada — falta um echo?</div>
        ) : (
          <div className={styles.outScroll}>
            <pre className={isError ? styles.outErr : styles.outStdout}>{combined}</pre>
            {hint ? <p className={styles.outHint}>{hint}</p> : null}
          </div>
        )}
      </NotebookFrame>
    </article>
  );
}
