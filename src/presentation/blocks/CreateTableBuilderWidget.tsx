import { useState } from 'react';
import { Button, NotebookFrame } from '@/presentation/design-system';
import styles from './CreateTableBuilderWidget.module.css';

type Column = { id: number; name: string; type: string };

const TYPES = ['serial', 'integer', 'text', 'numeric', 'boolean', 'date', 'timestamp'];

let nextId = 0;
function makeColumn(name: string, type: string): Column {
  nextId += 1;
  return { id: nextId, name, type };
}

/**
 * Farol "Conhecendo a interface" (banco-de-dados/interface.ts): monta uma tabela no
 * modo visual e alterna para a aba "Código SQL" para ver o comando gerado — a mesma
 * ideia do pgAdmin real. Widget registrado como `{ t: 'gui', widget: 'criar-tabela' }`.
 */
export function CreateTableBuilderWidget() {
  const [tableName, setTableName] = useState('clientes');
  const [columns, setColumns] = useState(() => [
    makeColumn('id', 'serial'),
    makeColumn('nome', 'text'),
  ]);
  const [tab, setTab] = useState<'visual' | 'sql'>('visual');

  function updateColumn(id: number, patch: Partial<Column>) {
    setColumns((cols) => cols.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function addColumn() {
    setColumns((cols) => [...cols, makeColumn('coluna', 'text')]);
  }

  function removeColumn(id: number) {
    setColumns((cols) => cols.filter((c) => c.id !== id));
  }

  const sql =
    columns.length === 0
      ? `CREATE TABLE ${tableName || 'tabela'} (\n\n);`
      : `CREATE TABLE ${tableName || 'tabela'} (\n${columns
          .map((c) => `    ${c.name || 'coluna'} ${c.type}`)
          .join(',\n')}\n);`;

  return (
    <NotebookFrame title={tab === 'visual' ? 'Modo visual' : 'Código SQL'}>
      <div className={styles.wrap}>
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'visual'}
            className={`${styles.tab} ${tab === 'visual' ? styles.tabOn : ''}`}
            onClick={() => setTab('visual')}
          >
            Modo visual
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'sql'}
            className={`${styles.tab} ${tab === 'sql' ? styles.tabOn : ''}`}
            onClick={() => setTab('sql')}
          >
            Código SQL
          </button>
        </div>

        {tab === 'visual' ? (
          <div className={styles.form}>
            <label className={styles.tableNameField}>
              <span>Nome da tabela</span>
              <input value={tableName} onChange={(e) => setTableName(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
            </label>
            {columns.map((col) => (
              <div key={col.id} className={styles.columnRow}>
                <input
                  className={styles.columnName}
                  value={col.name}
                  onChange={(e) => updateColumn(col.id, { name: e.target.value })}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="nome_da_coluna"
                />
                <select className={styles.columnType} value={col.type} onChange={(e) => updateColumn(col.id, { type: e.target.value })}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button type="button" className={styles.remove} onClick={() => removeColumn(col.id)} aria-label={`Remover coluna ${col.name}`}>
                  ✕
                </button>
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={addColumn}>
              + Adicionar coluna
            </Button>
          </div>
        ) : (
          <pre className={styles.sql}>{sql}</pre>
        )}
      </div>
    </NotebookFrame>
  );
}
