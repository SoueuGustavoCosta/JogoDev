export type SqlResultBlock =
  | { kind: 'table'; cols: string[]; rows: unknown[][]; empty?: string }
  | { kind: 'ok'; n: number }
  | { kind: 'info'; msg: string }
  | { kind: 'err'; msg: string };

export type SqlDataset = 'loja' | 'vazio';

export interface SqlEnginePort {
  /** Carrega o motor (dynamic import) e prepara o dataset "loja" por padrão. */
  init(): Promise<void>;
  /** Reseta o schema public e recarrega o dataset indicado. */
  reset(dataset: SqlDataset): Promise<void>;
  /** Executa um texto com comandos SQL e/ou atalhos do psql (\dt, \d, \l, \c, \q). */
  run(sql: string): Promise<SqlResultBlock[]>;
  /** Executa uma consulta e retorna colunas/linhas cruas, para verificação de missões. */
  query(sql: string, params?: unknown[]): Promise<{ cols: string[]; rows: unknown[][] }>;
}
