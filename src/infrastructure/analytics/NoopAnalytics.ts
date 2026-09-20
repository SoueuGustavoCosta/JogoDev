import type { AnalyticsPort, AnalyticsEventName, AnalyticsProps } from '@/application/ports';

/** Usado em testes e desenvolvimento: não envia nada a lugar nenhum. */
export class NoopAnalytics implements AnalyticsPort {
  track(_event: AnalyticsEventName, _props?: AnalyticsProps): void {
    // Intencionalmente vazio.
  }
}
