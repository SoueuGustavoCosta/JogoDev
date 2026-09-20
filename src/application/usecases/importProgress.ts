import type { Progress } from '@/domain/progress';
import type { ProgressRepository } from '../ports';

export type ImportProgressResult = { ok: true } | { ok: false; reason: string };

function isValidProgressShape(value: unknown): value is Progress {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.version === 'number' && typeof candidate.trails === 'object';
}

/** Importa progresso exportado por `exportProgress`. Falha com segurança em texto inválido. */
export function importProgress(
  deps: { repository: ProgressRepository },
  params: { data: string },
): ImportProgressResult {
  let decoded: string;
  try {
    decoded =
      typeof atob === 'function'
        ? decodeURIComponent(escape(atob(params.data)))
        : Buffer.from(params.data, 'base64').toString('utf8');
  } catch {
    return { ok: false, reason: 'O código informado não é válido.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    return { ok: false, reason: 'O código informado não é um progresso válido.' };
  }

  if (!isValidProgressShape(parsed)) {
    return { ok: false, reason: 'O código informado não tem o formato esperado.' };
  }

  deps.repository.save(parsed);
  return { ok: true };
}
