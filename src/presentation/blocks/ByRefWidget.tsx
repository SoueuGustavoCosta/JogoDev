import { useState } from 'react';
import { Button, NotebookFrame } from '@/presentation/design-system';
import styles from './ByRefWidget.module.css';

type Mode = 'valor' | 'referencia';

/**
 * Farol 8 (funcoes.ts): compara passagem por valor e por referência com um exemplo
 * simples (dobrar um número), separado do exemplo usado no quiz. Widget registrado
 * como `{ t: 'gui', widget: 'por-referencia' }`.
 */
export function ByRefWidget() {
  const [mode, setMode] = useState<Mode>('valor');
  const [ran, setRan] = useState(false);

  const signature = mode === 'valor' ? 'function dobra($x)' : 'function dobra(&$x)';
  const after = mode === 'valor' ? 5 : 10;

  function run() {
    setRan(true);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setRan(false);
  }

  return (
    <NotebookFrame title="por-referencia.php">
      <div className={styles.wrap}>
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'valor'}
            className={`${styles.tab} ${mode === 'valor' ? styles.tabOn : ''}`}
            onClick={() => switchMode('valor')}
          >
            Por valor
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'referencia'}
            className={`${styles.tab} ${mode === 'referencia' ? styles.tabOn : ''}`}
            onClick={() => switchMode('referencia')}
          >
            Por referência
          </button>
        </div>
        <pre className={styles.code}>
          {`<?php\n${signature} {\n    $x = $x * 2;\n}\n\n$n = 5;\ndobra($n);\necho $n;\n?>`}
        </pre>
        <Button size="sm" onClick={run}>
          Executar ▸
        </Button>
        {ran ? (
          <div className={styles.result}>
            <code>echo $n;</code> → <b>{after}</b>
            {mode === 'valor' ? ' (a função mexeu numa cópia; $n de fora não mudou)' : ' (a função mexeu na variável original)'}
          </div>
        ) : null}
      </div>
    </NotebookFrame>
  );
}
