import type { ClipboardPort } from '@/application/ports';

export type ShareOutcome = 'shared' | 'copied' | 'failed';

/**
 * Compartilha pelo menu nativo do celular (WhatsApp etc.) quando o navegador tem
 * `navigator.share`; senão copia o texto. Cancelar o menu nativo não é erro.
 */
export async function shareText(clipboard: ClipboardPort, params: { text: string; url?: string }): Promise<ShareOutcome> {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav && typeof nav.share === 'function') {
    try {
      await nav.share({ text: params.text, url: params.url });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'failed';
    }
  }
  const ok = await clipboard.copy(params.url ? `${params.text} ${params.url}` : params.text);
  return ok ? 'copied' : 'failed';
}
