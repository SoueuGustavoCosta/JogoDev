import { track } from '@vercel/analytics';
import type { AnalyticsPort, AnalyticsEventName, AnalyticsProps } from '@/application/ports';

/**
 * Adaptador do Vercel Web Analytics: contagem anônima de eventos, sem cookies
 * e sem dados pessoais (regras da seção 6 do CLAUDE.md).
 */
export class VercelAnalytics implements AnalyticsPort {
  track(event: AnalyticsEventName, props?: AnalyticsProps): void {
    track(event, props);
  }
}
