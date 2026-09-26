/**
 * Registra o service worker (Etapa 12A): só em produção e só se o navegador suportar. Nunca
 * quebra o app: se falhar, o app continua funcionando online, só sem modo offline.
 */
export function registerServiceWorker(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const register = () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Sem modo offline neste aparelho; o resto segue igual.
    });
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
