import type { Block } from '@/domain/trail';
import { Button, NotebookFrame } from '@/presentation/design-system';
import styles from './BlockRenderer.module.css';

/** Conteúdo é autoral (vive em src/content), nunca dado do usuário: seguro para innerHTML. */
function Html({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
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
      return <p className={styles.p}><Html html={block.x} /></p>;

    case 'note':
      return (
        <div className={`${styles.note} ${block.warn ? styles.noteWarn : ''}`}>
          <span className={styles.noteLabel}>{block.k}</span>
          <Html html={block.x} />
        </div>
      );

    case 'cards':
      return (
        <div className={styles.cards}>
          {block.items.map((item, i) => (
            <div key={i} className={styles.note}>
              <strong>{item.h}</strong>
              <p className={styles.p} style={{ margin: '6px 0 0' }}>
                <Html html={item.x} />
              </p>
            </div>
          ))}
        </div>
      );

    case 'ul':
      return (
        <ul className={styles.list}>
          {block.items.map((item, i) => (
            <li key={i}>
              <Html html={item} />
            </li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol className={styles.list}>
          {block.items.map((item, i) => (
            <li key={i}>
              <Html html={item} />
            </li>
          ))}
        </ol>
      );

    case 'code':
      return (
        <NotebookFrame title={block.file}>
          <pre className={styles.pre}>
            <code>{block.x}</code>
          </pre>
          {!block.nolab && onOpenInLab ? (
            <div style={{ padding: '0 16px 16px' }}>
              <Button size="sm" variant="alt" className={styles.labButton} onClick={() => onOpenInLab(block.x)}>
                Abrir no laboratório
              </Button>
            </div>
          ) : null}
        </NotebookFrame>
      );

    case 'table': {
      const table = (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
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
            <span key={i} style={{ display: 'contents' }}>
              {i > 0 ? <span className={styles.flowArrow}>→</span> : null}
              <span className={styles.flowItem}>{item}</span>
            </span>
          ))}
        </div>
      );

    case 'raw':
      return (
        <NotebookFrame title={block.file}>
          <div style={{ padding: 16 }}>
            <Html html={block.x} />
          </div>
        </NotebookFrame>
      );

    case 'gui':
    case 'syntax':
      return (
        <div className={styles.placeholder}>
          Widget interativo em construção nesta migração — o conteúdo da lição continua completo nos
          blocos ao redor.
        </div>
      );

    default:
      return null;
  }
}
