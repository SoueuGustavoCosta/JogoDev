import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { WorkshopLang } from '@/domain/workshop';
import { NotebookFrame } from '@/presentation/design-system';
import styles from './Workshop.module.css';

/** Símbolos difíceis de digitar no celular, por linguagem (como a barra do laboratório SQL). */
const SHORTCUTS: Record<WorkshopLang, string[]> = {
  php: ['$', ';', '"', '(', ')', '{', '}', '=', '==', '+', '-', '*', '/', '%', '<', '>', '.', 'echo', 'if', 'else', 'for'],
  js: [';', '"', '(', ')', '{', '}', '=', '===', '+', '-', '*', '/', '%', '<', '>', '`', 'console.log(', 'if', 'else', 'for', 'let'],
  python: [':', '"', '(', ')', '=', '==', '+', '-', '*', '/', '%', '<', '>', 'print(', 'if', 'else', 'for', 'in'],
};

const FILE: Record<WorkshopLang, string> = { php: 'oficina.php', js: 'oficina.js', python: 'oficina.py' };

/** Editor da Oficina: área de texto sem autocorreção e barra de atalhos de toque. */
export function CodeEditor({
  lang,
  code,
  onChange,
  action,
}: {
  lang: WorkshopLang;
  code: string;
  onChange: (code: string) => void;
  action?: ReactNode;
}) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const pendingCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = editorRef.current;
    if (el && pendingCaret.current !== null) {
      el.focus();
      el.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  }, [code]);

  function insert(text: string) {
    const el = editorRef.current;
    const start = el?.selectionStart ?? code.length;
    const end = el?.selectionEnd ?? code.length;
    const before = code.slice(0, start);
    const word = /^[A-Za-z]/.test(text) && !text.endsWith('(');
    const needsSpace = /^[A-Za-z]/.test(text) && before.length > 0 && !/[\s({]$/.test(before);
    const piece = (needsSpace ? ' ' : '') + text + (word ? ' ' : '');
    pendingCaret.current = start + piece.length;
    onChange(before + piece + code.slice(end));
  }

  return (
    <div className={styles.editorWrap}>
      <NotebookFrame title={FILE[lang]} action={action}>
        <textarea
          ref={editorRef}
          className={styles.editor}
          value={code}
          rows={Math.max(8, code.split('\n').length + 1)}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // Tab indenta em vez de sair do editor (teclado físico).
            if (e.key !== 'Tab' || e.shiftKey) return;
            e.preventDefault();
            insert('  ');
          }}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-label="Seu código"
        />
      </NotebookFrame>
      <div className={styles.shortcuts} role="group" aria-label="Atalhos de digitação">
        {SHORTCUTS[lang].map((s) => (
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
    </div>
  );
}
