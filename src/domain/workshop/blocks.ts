import type { WorkshopLang } from './types';

/**
 * Modo blocos da Oficina (Etapa 13B). A paleta de cada oficina (por linguagem) é uma lista de
 * LINHAS DE CÓDIGO REAIS; a pessoa escolhe quais usar, em que ordem, e troca os valores
 * marcados como editáveis. Não é resposta embaralhada: a paleta tem peças para caminhos
 * diferentes (if/elseif, switch...) e peças que não servem.
 *
 * Um trecho editável é escrito `[[valor padrão]]` no texto da paleta (ex.: `$res = $a [[+]] $b;`).
 * Chaves controlam a indentação: `}` no começo fecha um nível, `{` no fim abre um.
 */
export type PaletteBlock = { id: string; text: string };

/** Um bloco colocado no programa: qual peça da paleta e os valores dos trechos editáveis. */
export type PlacedBlock = { key: string; blockId: string; values: string[] };

const SLOT = /\[\[([^\]]*)\]\]/g;

/** Os valores padrão dos trechos editáveis de uma peça. */
export function slotDefaults(block: PaletteBlock): string[] {
  return [...block.text.matchAll(SLOT)].map((m) => m[1]);
}

/** Uma peça com os valores escolhidos, virando uma linha de código. */
export function renderBlock(block: PaletteBlock, values: readonly string[]): string {
  let i = 0;
  return block.text.replace(SLOT, (_all, fallback: string) => {
    const value = values[i] ?? fallback;
    i += 1;
    return value;
  });
}

/** Como a peça aparece na paleta (trechos editáveis com o valor padrão). */
export function paletteLabel(block: PaletteBlock): string {
  return renderBlock(block, slotDefaults(block));
}

function opensLevel(line: string): boolean {
  return /\{\s*$/.test(line);
}

function closesLevel(line: string): boolean {
  return /^\s*\}/.test(line);
}

/** Nível de indentação de cada linha, pelas chaves. */
export function indentLevels(lines: readonly string[]): number[] {
  let level = 0;
  return lines.map((line) => {
    if (closesLevel(line)) level = Math.max(0, level - 1);
    const mine = level;
    if (opensLevel(line)) level += 1;
    return mine;
  });
}

/** Blocos → código de verdade (sempre possível). */
export function blocksToCode(lang: WorkshopLang, palette: readonly PaletteBlock[], placed: readonly PlacedBlock[]): string {
  const lines = placed.map((p) => {
    const block = palette.find((b) => b.id === p.blockId);
    return block ? renderBlock(block, p.values) : '';
  });
  const levels = indentLevels(lines);
  const body = lines.map((line, i) => `${'  '.repeat(levels[i])}${line}`).join('\n');
  return lang === 'php' ? `<?php\n${body}\n` : `${body}\n`;
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Regex que reconhece uma peça (espaços flexíveis; cada trecho editável aceita qualquer coisa). */
function blockPattern(block: PaletteBlock): RegExp {
  const parts = block.text.split(SLOT);
  // split com grupo: pares = texto fixo, ímpares = valor padrão do trecho editável
  const source = parts
    .map((part, i) => (i % 2 === 1 ? '(.+?)' : escapeRegex(part).replace(/\s+/g, '\\s*')))
    .join('');
  return new RegExp(`^\\s*${source}\\s*$`);
}

export type CodeToBlocks = { ok: true; placed: PlacedBlock[] } | { ok: false; line: number; text: string };

/**
 * Código → blocos: só funciona se cada linha (fora linhas vazias, comentários e `<?php`)
 * for uma peça da paleta. Senão, diz qual linha não coube.
 */
export function codeToBlocks(palette: readonly PaletteBlock[], code: string): CodeToBlocks {
  const placed: PlacedBlock[] = [];
  const lines = code.replace(/\r\n?/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (line === '' || line === '<?php' || line === '?>' || line.startsWith('//') || line.startsWith('#')) continue;
    let match: { block: PaletteBlock; values: string[] } | null = null;
    // Peças sem trecho editável primeiro: são mais específicas.
    const ordered = [...palette].sort((a, b) => slotDefaults(a).length - slotDefaults(b).length);
    for (const block of ordered) {
      const m = blockPattern(block).exec(line);
      if (m) {
        match = { block, values: m.slice(1).map((v) => v.trim()) };
        break;
      }
    }
    if (!match) return { ok: false, line: i + 1, text: line };
    placed.push({ key: `b${placed.length}-${match.block.id}`, blockId: match.block.id, values: match.values });
  }
  return { ok: true, placed };
}

/** Move um bloco de uma posição para outra (arrastar). */
export function moveBlock<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, item);
  return next;
}
