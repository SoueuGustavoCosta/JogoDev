import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { AnalyticsPort, ClipboardPort, LeaderboardPort, ProgressRepository, SqlEnginePort } from '@/application/ports';
import { LocalStorageProgressRepository } from '@/infrastructure/storage';
import { NoopAnalytics, VercelAnalytics } from '@/infrastructure/analytics';
import { NoopLeaderboard, SupabaseLeaderboard } from '@/infrastructure/leaderboard';
import { PgliteEngine } from '@/infrastructure/sql';
import { NavigatorClipboard } from '@/infrastructure/clipboard';

export type Services = {
  progressRepository: ProgressRepository;
  analytics: AnalyticsPort;
  sqlEngine: SqlEnginePort;
  clipboard: ClipboardPort;
  leaderboard: LeaderboardPort;
};

const ServicesContext = createContext<Services | null>(null);

/**
 * Monta as portas com os adaptadores reais (infraestrutura). É o único lugar de
 * presentation que pode importar infrastructure — componentes usam os hooks abaixo.
 */
export function ServicesProvider({ children }: { children: ReactNode }) {
  const services = useMemo<Services>(
    () => ({
      progressRepository: new LocalStorageProgressRepository(),
      analytics: import.meta.env.PROD ? new VercelAnalytics() : new NoopAnalytics(),
      sqlEngine: new PgliteEngine(),
      clipboard: new NavigatorClipboard(),
      // Só em produção: em dev, escritas reais poluiriam o Hall dos Viajantes com
      // dados de teste (mesma lógica do analytics acima).
      leaderboard: import.meta.env.PROD ? new SupabaseLeaderboard() : new NoopLeaderboard(),
    }),
    [],
  );

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices deve ser usado dentro de <ServicesProvider>');
  return services;
}
