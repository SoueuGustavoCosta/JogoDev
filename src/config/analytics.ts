/**
 * Métricas (CLAUDE.md seção 6 + decisão do autor de 2026-09-25, projeto 100% gratuito):
 *
 * - **Vercel Web Analytics** (plano Hobby): só contagem de visitas/páginas. Eventos
 *   personalizados na Vercel exigem plano pago, então nenhum evento vai para lá.
 * - **PostHog** (plano gratuito): os eventos do `AnalyticsPort` (`module_left`,
 *   `quiz_answered`...), sem cookies, sem identificar pessoas, sem IP.
 *
 * A chave do PostHog é pública por natureza (vai no JavaScript do site, como a chave
 * anon do Supabase), mas fica em variável de ambiente para cada deploy poder ligar ou
 * desligar os eventos: sem `VITE_POSTHOG_KEY`, os eventos não são enviados a lugar
 * nenhum (NoopAnalytics). Configure em Vercel → Project → Settings → Environment Variables.
 */
export const POSTHOG_KEY: string = import.meta.env.VITE_POSTHOG_KEY ?? '';

/**
 * Endereço de ingestão do PostHog. Precisa ser da mesma região escolhida ao criar o
 * projeto: `https://us.i.posthog.com` (EUA) ou `https://eu.i.posthog.com` (União Europeia).
 */
export const POSTHOG_HOST: string = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
