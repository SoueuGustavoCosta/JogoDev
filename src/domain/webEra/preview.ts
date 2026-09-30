import type { CodeMission } from './types';

const SCRIPT_CLOSE = '</' + 'script>';
/** `console.log` aparece na própria prévia: mostrar em vez de explicar. */
const CONSOLE_SHIM =
  'console.log=function(){var p=document.createElement("pre");p.style.cssText="margin:4px 0;font:15px monospace;color:#0a7b4f";' +
  'p.textContent="> "+[].map.call(arguments,function(a){return typeof a==="string"?a:JSON.stringify(a)}).join(" ");' +
  '(document.body||document.documentElement).appendChild(p)};';
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
    `<script>window.__err=null;window.onerror=function(m){window.__err=m;return true};${CONSOLE_SHIM}${SCRIPT_CLOSE}` +
    `<script>${src}\n${SCRIPT_CLOSE}`
  );
}

/** Prévia das missões de ordenar com `preview`: o HTML montado até agora. */
export function buildOrderPreview(tokens: readonly string[]): string {
  return `<style>body{font-family:system-ui;margin:10px}</style>${tokens.join('')}`;
}

/** Troca `{NAME}` pelo nome do viajante e `{USER}` pelo apelido sem acento nem espaço. */
export function fillTemplate(text: string, travelerName: string): string {
  const name = travelerName.trim() || 'Seu Nome';
  const user =
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') || 'voce';
  return text.replace(/\{NAME\}/g, name).replace(/\{USER\}/g, user);
}

/** Código completo de uma missão de blocos, com as peças colocadas até agora. */
export function blocksSource(m: { pre?: string; post?: string; block?: boolean; joiner?: string }, placed: readonly string[]): string {
  const join = m.joiner ?? (m.block ? '\n' : '');
  return (m.pre ?? '') + placed.join(join) + (m.post ?? '');
}

/** A peça escolhida numa lacuna está certa? */
export function isFillAnswer(m: { answer: string | string[] }, value: string): boolean {
  return (Array.isArray(m.answer) ? m.answer : [m.answer]).includes(value);
}
