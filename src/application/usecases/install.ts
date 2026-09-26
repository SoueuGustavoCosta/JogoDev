import { createEmptyProgress } from '@/domain/progress';
import type { AnalyticsPort, ProgressRepository } from '../ports';

/**
 * "Adicionar à tela inicial" (Etapa 12A): a tela aparece sozinha UMA vez, logo depois da
 * primeira Anomalia do Dia consertada, e nunca se o app já está instalado. Depois disso,
 * só quando a pessoa pede (aba Viajante).
 */
export function shouldOfferInstall(deps: { repository: ProgressRepository }, params: { standalone: boolean }): boolean {
  if (params.standalone) return false;
  const progress = deps.repository.load() ?? createEmptyProgress();
  if (progress.installPromptShownAt) return false;
  return Object.keys(progress.anomalies ?? {}).length >= 1;
}

export function markInstallOffered(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort },
  params: { platform: string; now?: Date },
): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  if (!progress.installPromptShownAt) {
    deps.repository.save({ ...progress, installPromptShownAt: (params.now ?? new Date()).toISOString() });
  }
  deps.analytics.track('install_prompt_shown', { platform: params.platform });
}
