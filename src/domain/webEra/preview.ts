import type { CodeMission } from './types';

const SCRIPT_CLOSE = '</' + 'script>';
const BASE_STYLE = '<style>body{font-family:system-ui,sans-serif;margin:12px;color:#111}</style>';

/**
 * Documento da prévia ao vivo de uma missão de código (o iframe `srcdoc`, isolado da página
 * do jogo). No JS, erros de execução ficam em `window.__err` para a conferência mostrar.
 */
export function buildCodePreview(mission: Pick<CodeMission, 'lang' | 'html'>, src: string): string {
  if (mission.lang === 'html') return BASE_STYLE + src;
  if (mission.lang === 'css') return `${BASE_STYLE}${mission.html ?? ''}<style>${src}</style>`;
  return (
    `${BASE_STYLE}${mission.html ?? ''}` +
    `<script>window.__err=null;window.onerror=function(m){window.__err=m;return true};${SCRIPT_CLOSE}` +
    `<script>${src}\n${SCRIPT_CLOSE}`
  );
}

/** Prévia das missões de ordenar com `preview`: o HTML montado até agora. */
export function buildOrderPreview(tokens: readonly string[]): string {
  return `<style>body{font-family:system-ui;margin:10px}</style>${tokens.join('')}`;
}
