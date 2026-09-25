import { inject } from '@vercel/analytics';

let started = false;

/**
 * Liga o Vercel Web Analytics só para **contar visitas e páginas vistas** (plano Hobby,
 * gratuito). Eventos personalizados na Vercel exigem plano pago, então os eventos do app
 * vão para o PostHog (`PostHogAnalytics`); aqui não passa nenhum `track`.
 *
 * O script da Vercel acompanha sozinho as trocas de rota do React Router. Sem cookies e
 * sem dados pessoais (seção 6 do CLAUDE.md). Chamar mais de uma vez não duplica nada.
 */
export function startVercelPageViews(): void {
  if (started) return;
  started = true;
  try {
    inject({ mode: 'production' });
  } catch {
    // Métrica nunca derruba o app.
  }
}
