import { useState } from 'react';
import { NotebookFrame } from '@/presentation/design-system';
import { highlightSql } from './highlight';
import blockStyles from './BlockRenderer.module.css';
import styles from './SqlStyleCompareWidget.module.css';

const COMPACT = "select nome,email from clientes where ativo = true and cidade = 'Ipatinga' order by nome;";
const FORMATTED = "SELECT nome, email\nFROM clientes\nWHERE ativo = true\n    AND cidade = 'Ipatinga'\nORDER BY nome;";

/**
 * Farol "Sintaxe e indentação" (banco-de-dados/sintaxe.ts): a mesma consulta em dois
 * estilos — o aluno alterna entre as abas e compara qual acharia um erro mais rápido.
 * Único uso do bloco `{ t: 'syntax' }` no conteúdo.
 */
export function SqlStyleCompareWidget() {
  const [tab, setTab] = useState<'compacto' | 'formatado'>('compacto');
  const code = tab === 'compacto' ? COMPACT : FORMATTED;
  const lines = highlightSql(code);

  return (
    <NotebookFrame title={tab === 'compacto' ? 'consulta_compacta.sql' : 'consulta_formatada.sql'}>
      <div className={styles.wrap}>
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'compacto'}
            className={`${styles.tab} ${tab === 'compacto' ? styles.tabOn : ''}`}
            onClick={() => setTab('compacto')}
          >
            Compacto
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'formatado'}
            className={`${styles.tab} ${tab === 'formatado' ? styles.tabOn : ''}`}
            onClick={() => setTab('formatado')}
          >
            Formatado
          </button>
        </div>
        <pre className={blockStyles.sql}>
          {lines.map((tokens, i) => (
            <span key={i} className={blockStyles.line}>
              {tokens.map((t, j) => (
                <span key={j} className={blockStyles[t.kind]}>
                  {t.text}
                </span>
              ))}
            </span>
          ))}
        </pre>
        <p className={styles.note}>As duas fazem exatamente a mesma coisa. Só muda o quanto dá trabalho ler.</p>
      </div>
    </NotebookFrame>
  );
}
