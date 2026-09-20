import type { Block } from '@/domain/trail';
import { NotebookFrame } from '@/presentation/design-system';
import { highlightSql } from './highlight';
import styles from './BlockRenderer.module.css';

/** Conteúdo é autoral (vive em src/content), nunca dado do usuário: seguro para innerHTML. */
function Html({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function BlockRenderer({
  block,
  onOpenInLab,
}: {
  block: Block;
  onOpenInLab?: (sql: string) => void;
}) {
  switch (block.t) {
    case 'h':
      return <h2 className={styles.h}>{block.x}</h2>;

    case 'p':
      return (
        <p className={styles.p}>
          <Html html={block.x} />
        </p>
      );

    case 'note':
      return (
        <div className={`${styles.note} ${block.warn ? styles.noteWarn : ''}`}>
          <b className={styles.noteKey}>{block.k}</b>
          <p>
            <Html html={block.x} />
          </p>
        </div>
      );

    case 'cards':
      return (
        <div className={styles.cards}>
          {block.items.map((item, i) => (
            <div key={i} className={styles.card}>
              <h3>{item.h}</h3>
              <p>
                <Html html={item.x} />
              </p>
            </div>
          ))}
        </div>
      );

    case 'ul':
      return (
        <ul className={styles.tick}>
          {block.items.map((item, i) => (
            <li key={i}>
              <Html html={item} />
            </li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol className={styles.steps}>
          {block.items.map((item, i) => (
            <li key={i}>
              <span>
                <Html html={item} />
              </span>
            </li>
          ))}
        </ol>
      );

    case 'code': {
      const lines = highlightSql(block.x);
      return (
        <NotebookFrame
          title={block.file}
          action={
            !block.nolab && onOpenInLab ? (
              <button type="button" className={styles.runBtn} onClick={() => onOpenInLab(block.x)}>
                Abrir na Máquina ▸
              </button>
            ) : null
          }
        >
          <pre className={styles.sql}>
            {lines.map((tokens, i) => (
              <span key={i} className={styles.line}>
                {tokens.map((t, j) => (
                  <span key={j} className={styles[t.kind]}>
                    {t.text}
                  </span>
                ))}
              </span>
            ))}
          </pre>
        </NotebookFrame>
      );
    }

    case 'table': {
      const table = (
        <div className={styles.tbl}>
          <table>
            <thead>
              <tr>
                {block.cols.map((c, i) => (
                  <th key={i}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>
                      <Html html={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      if (block.mac === false) return table;
      return <NotebookFrame title={block.file ?? 'Data Output'}>{table}</NotebookFrame>;
    }

    case 'flow':
      return (
        <div className={styles.flow}>
          {block.items.map((item, i) => (
            <span key={i} className={styles.flowItem}>
              {i > 0 ? <i>→</i> : null}
              <span className={i === 0 ? styles.flowFirst : undefined}>{item}</span>
            </span>
          ))}
        </div>
      );

    case 'raw':
      return (
        <NotebookFrame title={block.file}>
          <div className={styles.raw}>
            <Html html={block.x} />
          </div>
        </NotebookFrame>
      );

    case 'gui':
    case 'syntax':
      return (
        <div className={styles.placeholder}>
          Widget interativo em construção — o conteúdo da lição continua completo nos blocos ao redor.
        </div>
      );

    default:
      return null;
  }
}
