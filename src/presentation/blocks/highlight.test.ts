import { describe, expect, it } from 'vitest';
import { highlightSql } from './highlight';

describe('highlightSql', () => {
  it('splits into lines and keeps the original text intact', () => {
    const src = "SELECT nome, preco\nFROM produtos -- todos\nWHERE preco > 10.5 AND nome LIKE 'T%';";
    const lines = highlightSql(src);
    expect(lines).toHaveLength(3);
    expect(lines.map((l) => l.map((t) => t.text).join('')).join('\n')).toBe(src);
  });

  it('classifies keywords, types, strings, numbers, comments and functions', () => {
    const [line] = highlightSql("SELECT COUNT(*) FROM t WHERE x = 'a' AND y > 3 -- fim");
    const kinds = Object.fromEntries(line.map((t) => [t.text, t.kind]));
    expect(kinds.SELECT).toBe('kw');
    expect(kinds.COUNT).toBe('fn');
    expect(kinds["'a'"]).toBe('str');
    expect(kinds['3']).toBe('num');
    expect(kinds['-- fim']).toBe('cm');
    expect(highlightSql('id SERIAL')[0].find((t) => t.text === 'SERIAL')?.kind).toBe('type');
  });
});
