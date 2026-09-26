/**
 * "Adicionar à tela inicial" (Etapa 12A). No Android (Chrome), o navegador avisa com o evento
 * `beforeinstallprompt`, que guardamos para mostrar o pedido nativo quando a pessoa tocar em
 * "Instalar". No iPhone não existe esse evento: a tela mostra o passo a passo do Safari.
 */
type InstallEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

let deferred: InstallEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
  });
}

export type InstallPlatform = 'ios' | 'android' | 'other';

export const installPrompt = {
  /** Já está aberto como app instalado (tela cheia, sem barra do navegador)? */
  isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    return iosStandalone || window.matchMedia?.('(display-mode: standalone)').matches === true;
  },
  platform(): InstallPlatform {
    if (typeof navigator === 'undefined') return 'other';
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'other';
  },
  /** O navegador deixou mostrar o pedido nativo de instalação? */
  canPromptNatively(): boolean {
    return deferred !== null;
  },
  /** Mostra o pedido nativo. Devolve se a pessoa aceitou. */
  async promptNatively(): Promise<boolean> {
    if (!deferred) return false;
    const event = deferred;
    deferred = null;
    await event.prompt();
    const choice = await event.userChoice;
    return choice.outcome === 'accepted';
  },
};
