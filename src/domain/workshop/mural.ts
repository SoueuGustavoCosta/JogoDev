/**
 * Mural da turma (Etapa 13B): regras de publicação, sem I/O. Só publica quem toca em
 * "Publicar no mural"; o mural de uma oficina só abre depois de resolvê-la (para não copiar).
 */
export const MURAL_MAX_CODE = 4000;

/**
 * Filtro BÁSICO de palavrões (português do Brasil). Não é perfeito nem tenta ser: pega o
 * óbvio, inclusive com acento trocado, maiúsculas e números no lugar de letras (p0rr4).
 * TODO(autor): ampliar a lista se aparecer algo no mural.
 */
const BLOCKED = [
  'porra',
  'caralho',
  'merda',
  'puta',
  'puto',
  'putaria',
  'buceta',
  'boceta',
  'cu',
  'cuzao',
  'viado',
  'fdp',
  'foda',
  'fodase',
  'foder',
  'fodido',
  'cacete',
  'bosta',
  'arrombado',
  'otario',
  'babaca',
  'vagabunda',
  'vagabundo',
  'piranha',
  'corno',
  'desgracado',
  'desgracada',
  'retardado',
  'pqp',
  'vsf',
  'krl',
  'crl',
];

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a' };

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[013457@]/g, (c) => LEET[c] ?? c);
}

export function containsProfanity(text: string): boolean {
  const words = normalize(text).split(/[^a-z]+/).filter(Boolean);
  const joined = words.join(' ');
  return words.some((w) => BLOCKED.includes(w)) || /filho da puta|vai tomar no/.test(joined);
}

export type PublishCheck = { ok: true } | { ok: false; reason: 'empty' | 'too-long' | 'profanity' };

export function checkPublishable(code: string): PublishCheck {
  const trimmed = code.trim();
  if (trimmed === '' || trimmed === '<?php') return { ok: false, reason: 'empty' };
  if (trimmed.length > MURAL_MAX_CODE) return { ok: false, reason: 'too-long' };
  if (containsProfanity(trimmed)) return { ok: false, reason: 'profanity' };
  return { ok: true };
}
