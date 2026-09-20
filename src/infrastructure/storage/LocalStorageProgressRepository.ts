import { createEmptyProgress, PROGRESS_SCHEMA_VERSION, type Progress } from '@/domain/progress';
import type { ProgressRepository } from '@/application/ports';

const STORAGE_KEY = 'arquipelago:progress:v1';

/**
 * Migrações entre versões do formato salvo. Cada função recebe os dados brutos
 * da versão anterior e devolve o formato da próxima versão.
 * Adicionar uma migração nunca deve apagar o progresso do aluno.
 */
const migrations: Record<number, (data: unknown) => unknown> = {
  // Exemplo para o futuro: migrations[1] = (data) => ({ ...data, version: 2, novoCampo: [] });
};

function migrate(raw: unknown): Progress {
  let data = raw as { version?: number } & Record<string, unknown>;
  let version = typeof data.version === 'number' ? data.version : 0;
  while (version < PROGRESS_SCHEMA_VERSION && migrations[version]) {
    data = migrations[version](data) as typeof data;
    version = typeof data.version === 'number' ? data.version : version + 1;
  }
  if (version !== PROGRESS_SCHEMA_VERSION) return createEmptyProgress();
  return data as unknown as Progress;
}

function isStorageAvailable(): boolean {
  try {
    const testKey = '__arquipelago_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Implementa ProgressRepository sobre localStorage. Falha silenciosa e segura
 * quando o armazenamento está bloqueado (ex.: modo privado): o app continua
 * funcionando, só sem persistir.
 */
export class LocalStorageProgressRepository implements ProgressRepository {
  private readonly available = isStorageAvailable();

  load(): Progress | null {
    if (!this.available) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return migrate(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  save(progress: Progress): void {
    if (!this.available) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Armazenamento bloqueado ou cheio: falha silenciosa, sem quebrar o app.
    }
  }

  clear(): void {
    if (!this.available) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorado de propósito: mesma política de falha silenciosa do save/load.
    }
  }

  isAvailable(): boolean {
    return this.available;
  }
}
