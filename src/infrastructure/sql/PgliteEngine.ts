import type { SqlDataset, SqlEnginePort, SqlResultBlock } from '@/application/ports';
import { SEED_LOJA } from './datasets/loja';

type PGliteInstance = {
  exec(sql: string, opts?: { rowMode: 'array' }): Promise<Array<{ fields?: { name: string }[]; rows: unknown[][]; affectedRows?: number }>>;
  query(sql: string, params?: unknown[], opts?: { rowMode: 'array' }): Promise<{ fields: { name: string }[]; rows: unknown[][] }>;
  waitReady: Promise<void>;
};

function isEmptySql(chunk: string): boolean {
  return chunk.replace(/--.*$/gm, '').trim() === '';
}

/**
 * Implementação de SqlEnginePort sobre o PGlite (Postgres em WebAssembly).
 * Carregado só sob demanda (dynamic import), nunca no bundle inicial.
 * Comportamento migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html
 * (runSql, resetDataset), incluindo os atalhos de psql (\dt, \d, \l, \c, \q)
 * e a interceptação de CREATE/DROP DATABASE.
 */
export class PgliteEngine implements SqlEnginePort {
  private db: PGliteInstance | null = null;
  private loading: Promise<PGliteInstance> | null = null;

  async init(): Promise<void> {
    await this.ensureDb();
  }

  private ensureDb(): Promise<PGliteInstance> {
    if (this.db) return Promise.resolve(this.db);
    if (!this.loading) {
      this.loading = (async () => {
        const { PGlite } = await import('@electric-sql/pglite');
        const db = (await new PGlite()) as unknown as PGliteInstance;
        await db.waitReady;
        await this.resetWith(db, 'loja');
        this.db = db;
        return db;
      })();
    }
    return this.loading;
  }

  private async resetWith(db: PGliteInstance, dataset: SqlDataset): Promise<void> {
    try {
      await (db as unknown as { exec(sql: string): Promise<unknown> }).exec('ROLLBACK');
    } catch {
      // Sem transação aberta: nada a desfazer.
    }
    await (db as unknown as { exec(sql: string): Promise<unknown> }).exec(
      'DROP SCHEMA public CASCADE; CREATE SCHEMA public;',
    );
    if (dataset === 'loja') {
      await (db as unknown as { exec(sql: string): Promise<unknown> }).exec(SEED_LOJA);
    }
  }

  async reset(dataset: SqlDataset): Promise<void> {
    const db = await this.ensureDb();
    await this.resetWith(db, dataset);
  }

  async query(sql: string, params: unknown[] = []): Promise<{ cols: string[]; rows: unknown[][] }> {
    const db = await this.ensureDb();
    const result = await db.query(sql, params, { rowMode: 'array' });
    return { cols: result.fields.map((f) => f.name), rows: result.rows };
  }

  async run(sql: string): Promise<SqlResultBlock[]> {
    const db = await this.ensureDb();
    const out: SqlResultBlock[] = [];

    let sqlText = sql;
    if (/\b(create|drop)\s+database\b/i.test(sqlText.replace(/--.*$/gm, ''))) {
      out.push({
        kind: 'info',
        msg: 'CREATE DATABASE e DROP DATABASE não rodam aqui: o laboratório já é um banco pronto para uso. Em um servidor real, esse comando cria (ou apaga) um banco inteiro.',
      });
      sqlText = sqlText.replace(/^(?!\s*--).*\b(create|drop)\s+database\b[^;]*;?/gim, '');
    }

    const lines = sqlText.split('\n');
    let buf: string[] = [];

    const flush = async (): Promise<boolean> => {
      const chunk = buf.join('\n');
      buf = [];
      if (isEmptySql(chunk)) return true;
      try {
        const results = await db.exec(chunk, { rowMode: 'array' });
        for (const r of results) {
          if (r.fields && r.fields.length) {
            out.push({ kind: 'table', cols: r.fields.map((f) => f.name), rows: r.rows });
          } else {
            out.push({ kind: 'ok', n: r.affectedRows ?? 0 });
          }
        }
        return true;
      } catch (e) {
        out.push({ kind: 'err', msg: String((e as Error).message ?? e) });
        return false;
      }
    };

    for (const line of lines) {
      if (/^\s*\\/.test(line)) {
        if (!(await flush())) return out;
        const [cmd, arg] = line.trim().split(/\s+/);
        try {
          if (cmd === '\\dt') {
            const r = await db.query(
              `SELECT tablename AS tabela, tableowner AS dono FROM pg_tables WHERE schemaname = 'public' ORDER BY 1`,
              [],
              { rowMode: 'array' },
            );
            out.push({ kind: 'table', cols: ['tabela', 'dono'], rows: r.rows, empty: 'Nenhuma tabela ainda. Crie uma com CREATE TABLE.' });
          } else if (cmd === '\\d' && arg) {
            const r = await db.query(
              `SELECT column_name AS coluna, data_type AS tipo, is_nullable AS aceita_nulo, column_default AS padrao FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
              [arg.replace(/;$/, '').toLowerCase()],
              { rowMode: 'array' },
            );
            out.push({
              kind: 'table',
              cols: ['coluna', 'tipo', 'aceita_nulo', 'padrao'],
              rows: r.rows,
              empty: `A tabela "${arg}" não existe.`,
            });
          } else if (cmd === '\\l') {
            out.push({ kind: 'table', cols: ['nome', 'dono', 'codificação'], rows: [['loja_dev', 'postgres', 'UTF8']] });
          } else if (cmd === '\\c') {
            out.push({ kind: 'info', msg: 'Você já está conectado ao banco do laboratório (loja_dev).' });
          } else if (cmd === '\\q') {
            out.push({ kind: 'info', msg: 'No laboratório não é preciso sair: é só fechar a aba quando terminar.' });
          } else {
            out.push({ kind: 'err', msg: `Comando psql "${cmd}" não suportado no laboratório. Disponíveis: \\dt, \\d tabela, \\l.` });
          }
        } catch (e) {
          out.push({ kind: 'err', msg: String((e as Error).message ?? e) });
          return out;
        }
      } else {
        buf.push(line);
      }
    }
    await flush();
    return out;
  }
}
