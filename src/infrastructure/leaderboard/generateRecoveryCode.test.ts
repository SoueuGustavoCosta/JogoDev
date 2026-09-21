import { describe, expect, it } from 'vitest';
import { generateRecoveryCode } from './generateRecoveryCode';

describe('generateRecoveryCode', () => {
  it('gera um código no formato XXXX-XXXX, só com o alfabeto sem ambiguidade', () => {
    const code = generateRecoveryCode();
    expect(code).toMatch(/^[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/);
  });

  it('nunca usa caracteres fáceis de confundir (0/O/1/I/L)', () => {
    for (let i = 0; i < 50; i += 1) {
      const code = generateRecoveryCode();
      expect(code).not.toMatch(/[01IL0O]/);
    }
  });

  it('gera códigos diferentes a cada chamada (com folga estatística)', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateRecoveryCode()));
    expect(codes.size).toBe(20);
  });
});
