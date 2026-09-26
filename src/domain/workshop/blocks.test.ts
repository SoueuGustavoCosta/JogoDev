import { describe, expect, it } from 'vitest';
import { blocksToCode, codeToBlocks, indentLevels, moveBlock, paletteLabel, renderBlock, slotDefaults, type PaletteBlock } from './blocks';

const palette: PaletteBlock[] = [
  { id: 'if', text: 'if ($op == "[[+]]") {' },
  { id: 'elseif', text: '} elseif ($op == "[[-]]") {' },
  { id: 'fecha', text: '}' },
  { id: 'conta', text: '$res = $a [[+]] $b;' },
  { id: 'echo', text: 'echo $res;' },
];

describe('Oficina: modo blocos', () => {
  it('peças com trechos editáveis', () => {
    expect(slotDefaults(palette[0])).toEqual(['+']);
    expect(renderBlock(palette[3], ['*'])).toBe('$res = $a * $b;');
    expect(paletteLabel(palette[4])).toBe('echo $res;');
  });

  it('chaves controlam a indentação', () => {
    expect(indentLevels(['if (x) {', 'a;', '} elseif (y) {', 'b;', '}', 'c;'])).toEqual([0, 1, 0, 1, 0, 0]);
    expect(indentLevels(['}', '}'])).toEqual([0, 0]);
  });

  it('blocos viram código de verdade (com <?php no PHP)', () => {
    const code = blocksToCode('php', palette, [
      { key: '1', blockId: 'if', values: ['+'] },
      { key: '2', blockId: 'conta', values: ['+'] },
      { key: '3', blockId: 'elseif', values: ['-'] },
      { key: '4', blockId: 'conta', values: ['-'] },
      { key: '5', blockId: 'fecha', values: [] },
      { key: '6', blockId: 'echo', values: [] },
    ]);
    expect(code).toBe('<?php\nif ($op == "+") {\n  $res = $a + $b;\n} elseif ($op == "-") {\n  $res = $a - $b;\n}\necho $res;\n');
  });

  it('código → blocos quando cabe na paleta (espaços livres, comentários ignorados)', () => {
    const r = codeToBlocks(palette, '<?php\n// soma\nif ($op=="*"){\n$res=$a*$b;\n}\necho $res;');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.placed.map((p) => [p.blockId, p.values])).toEqual([
        ['if', ['*']],
        ['conta', ['*']],
        ['fecha', []],
        ['echo', []],
      ]);
      expect(blocksToCode('php', palette, r.placed)).toContain('if ($op == "*") {');
    }
  });

  it('código → blocos avisa a linha que não coube', () => {
    expect(codeToBlocks(palette, 'echo $res;\nprint($a);')).toEqual({ ok: false, line: 2, text: 'print($a);' });
  });

  it('arrastar muda a ordem', () => {
    expect(moveBlock(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveBlock(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
    expect(moveBlock(['a', 'b'], 5, 0)).toEqual(['a', 'b']);
  });
});
