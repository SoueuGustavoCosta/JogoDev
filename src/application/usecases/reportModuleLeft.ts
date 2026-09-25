import type { AnalyticsPort, ProgressRepository } from '../ports';

/**
 * Registra `module_left` quando o aluno sai de um módulo que ainda não concluiu: é o sinal
 * de desistência que mostra em que altura do módulo as pessoas param. Quem sai de um módulo
 * já concluído (revisão) não é desistência e não gera evento.
 *
 * `percent` é quanto do módulo a pessoa viu, já arredondado (ver `scrollDepthPercent`).
 * Devolve `true` se o evento foi enviado.
 */
export function reportModuleLeft(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort },
  params: { trailId: string; moduleId: string; percent: number },
): boolean {
  const completed = deps.repository.load()?.trails[params.trailId]?.modules[params.moduleId]?.completed;
  if (completed) return false;
  deps.analytics.track('module_left', { island: params.trailId, module: params.moduleId, percent: params.percent });
  return true;
}
