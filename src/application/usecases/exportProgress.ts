import { createEmptyProgress } from '@/domain/progress';
import type { ProgressRepository } from '../ports';

/** Exporta o progresso como texto (JSON em base64), para o aluno guardar ou transferir de aparelho. */
export function exportProgress(deps: { repository: ProgressRepository }): string {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const json = JSON.stringify(progress);
  return typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(json))) : Buffer.from(json, 'utf8').toString('base64');
}
