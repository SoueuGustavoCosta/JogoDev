import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import type { AnalyticsPort, ClipboardPort, LeaderboardPort, PhpEnginePort, ProgressRepository, SqlEnginePort } from '@/application/ports';
import { LocalStorageProgressRepository } from '@/infrastructure/storage';
import { NoopAnalytics, PostHogAnalytics, startVercelPageViews } from '@/infrastructure/analytics';
import { POSTHOG_HOST, POSTHOG_KEY } from '@/config/analytics';
import { generateRecoveryCode, NoopLeaderboard, resizeAvatarImage, SupabaseLeaderboard } from '@/infrastructure/leaderboard';
import { PgliteEngine } from '@/infrastructure/sql';
import { PhpWasmEngine } from '@/infrastructure/php';
import { NavigatorClipboard } from '@/infrastructure/clipboard';

export type Services = {
  progressRepository: ProgressRepository;
  analytics: AnalyticsPort;
  sqlEngine: SqlEnginePort;
  phpEngine: PhpEnginePort;
  clipboard: ClipboardPort;
  leaderboard: LeaderboardPort;
  /**
   * Redimensiona a foto do avatar no navegador (canvas), antes do upload. Não é uma
   * porta (não tem adaptador alternativo) — só passa por aqui porque `presentation/`
   * fora de `presentation/app` não pode importar `infrastructure/` diretamente
   * (regra de fronteiras do CLAUDE.md, seção 3).
   */
  resizeAvatarImage: typeof resizeAvatarImage;
  /**
   * Gera um código de recuperação no navegador (`crypto.getRandomValues`). Mesmo motivo
   * de `resizeAvatarImage` acima: não é uma porta (não tem adaptador alternativo), só
   * passa por aqui para respeitar a fronteira de camadas.
   */
  generateRecoveryCode: typeof generateRecoveryCode;
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
      // Eventos no PostHog (grátis) só em produção e com a chave configurada; visitas na Vercel (ver abaixo).
      analytics:
        import.meta.env.PROD && POSTHOG_KEY
          ? new PostHogAnalytics({ apiKey: POSTHOG_KEY, host: POSTHOG_HOST })
          : new NoopAnalytics(),
      sqlEngine: new PgliteEngine(),
      phpEngine: new PhpWasmEngine(),
      clipboard: new NavigatorClipboard(),
      // Só em produção: em dev, escritas reais poluiriam o Hall dos Viajantes com
      // dados de teste (mesma lógica do analytics acima).
      leaderboard: import.meta.env.PROD ? new SupabaseLeaderboard() : new NoopLeaderboard(),
      resizeAvatarImage,
      generateRecoveryCode,
    }),
    [],
  );

  // Contagem de visitas (Vercel Web Analytics, plano grátis): só em produção.
  useEffect(() => {
    if (import.meta.env.PROD) startVercelPageViews();
  }, []);

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices deve ser usado dentro de <ServicesProvider>');
  return services;
}
