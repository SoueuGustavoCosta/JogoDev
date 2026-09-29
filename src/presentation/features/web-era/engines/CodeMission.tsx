import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { buildCodePreview, type CodeMission as Code, type WebLang } from '@/domain/webEra';
import styles from '../Stage.module.css';
import type { EngineProps } from './types';

/** Teclas rápidas para o celular (símbolos difíceis de achar no teclado). */
const KEYS: Record<WebLang, string[]> = {
  html: ['<', '>', '/', '"', '=', '<h1>', '</h1>', '<p>', '</p>'],
  css: ['{', '}', ':', ';', '.', '#', 'px', 'color:', 'var(--'],
  js: ['(', ')', '{', '}', ';', '"', '.', '=>', '=', 'document.querySelector('],
};

const DEBOUNCE_MS = 450;

/**
 * Editor + prévia ao vivo num iframe `srcdoc`. A conferência roda sozinha enquanto a pessoa
 * digita (debounce): o código roda só dentro da prévia, e o `check` da missão lê o
 * documento e a janela dela.
 */
export function CodeMission({ mission, api }: EngineProps<Code>) {
  const [src, setSrc] = useState(mission.start ?? '');
  const [previewDoc, setPreviewDoc] = useState(() => buildCodePreview(mission, mission.start ?? ''));
  const [status, setStatus] = useState<{ ok: boolean; text: string }>({
    ok: false,
    text: `${mission.lang.toUpperCase()} · a prévia atualiza enquanto você digita`,
  });
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const builtSrc = useRef(mission.start ?? '');
  const done = useRef(false);
  const apiRef = useRef(api);
  apiRef.current = api;

  useEffect(() => {
    if (done.current) return;
    const t = window.setTimeout(() => {
      builtSrc.current = src;
      setPreviewDoc(buildCodePreview(mission, src));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [src, mission]);

  const onPreviewLoad = () => {
    const frame = frameRef.current;
    if (done.current || !frame?.contentWindow || !frame.contentDocument) return;
    const ctx = { win: frame.contentWindow as Window & { __err?: string | null }, doc: frame.contentDocument, src: builtSrc.current };
    let result: true | string;
    try {
      result = mission.check(ctx);
    } catch (e) {
      result = `Ainda não: ${e instanceof Error ? e.message : String(e)}`;
    }
    if (result !== true) {
      setStatus({ ok: false, text: `→ ${result || 'ainda não'}` });
      return;
    }
    done.current = true;
    setStatus({ ok: true, text: '✓ funcionou!' });
    if (mission.capture) {
      try {
        apiRef.current.capture(mission.capture(ctx));
      } catch {
        // Capturar é um extra: se falhar, a missão continua vencida.
      }
    }
    apiRef.current.ok();
    window.setTimeout(() => apiRef.current.win(), 700);
  };

  const insert = (text: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    const a = ed.selectionStart;
    const b = ed.selectionEnd;
    const next = ed.value.slice(0, a) + text + ed.value.slice(b);
    setSrc(next);
    window.requestAnimationFrame(() => {
      ed.focus();
      ed.selectionStart = ed.selectionEnd = a + text.length;
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      insert('  ');
    }
  };

  return (
    <>
      <div className={styles.codewrap}>
        <div className={styles.editorCol}>
          <textarea
            ref={editorRef}
            className={styles.editor}
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label={`Editor de código ${mission.lang.toUpperCase()}`}
          />
          <div className={styles.keys}>
            {KEYS[mission.lang].map((k) => (
              <button key={k} type="button" onClick={() => insert(k)} aria-label={`Inserir ${k}`}>
                {k}
              </button>
            ))}
            <button type="button" className={styles.hintKey} onClick={api.hint}>
              dica
            </button>
          </div>
        </div>
        <div className={styles.previewCol}>
          <iframe
            ref={frameRef}
            className={`${styles.preview} ${mission.narrow ? styles.narrow : ''}`}
            title="Prévia ao vivo"
            srcDoc={previewDoc}
            onLoad={onPreviewLoad}
          />
        </div>
      </div>
      <div className={`${styles.status} ${status.ok ? styles.statusOk : ''}`} role="status">
        {status.text}
      </div>
    </>
  );
}
