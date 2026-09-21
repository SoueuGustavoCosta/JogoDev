import { describe, expect, it } from 'vitest';
import { isValidEmail, isValidPassword, normalizePhone, syntheticEmailForPhone } from './credentials';

describe('normalizePhone', () => {
  it('aceita telefone formatado com DDD (11 dígitos)', () => {
    expect(normalizePhone('(31) 99999-9999')).toBe('31999999999');
  });

  it('aceita telefone só com dígitos (10 dígitos, fixo)', () => {
    expect(normalizePhone('3133334444')).toBe('3133334444');
  });

  it('recusa telefone sem DDD', () => {
    expect(normalizePhone('999999999')).toBeNull();
  });

  it('recusa telefone com dígitos demais', () => {
    expect(normalizePhone('123456789012')).toBeNull();
  });

  it('recusa vazio', () => {
    expect(normalizePhone('')).toBeNull();
  });
});

describe('isValidPassword', () => {
  it('recusa senha curta', () => {
    expect(isValidPassword('123')).toBe(false);
  });

  it('aceita senha com o mínimo de caracteres', () => {
    expect(isValidPassword('123456')).toBe(true);
  });
});

describe('syntheticEmailForPhone', () => {
  it('monta um e-mail sintético a partir do telefone e do domínio', () => {
    expect(syntheticEmailForPhone('31999999999', 'viajante.jogodev.app')).toBe(
      'tel-31999999999@viajante.jogodev.app',
    );
  });
});

describe('isValidEmail', () => {
  it('aceita um e-mail com formato válido', () => {
    expect(isValidEmail('gustavo@example.com')).toBe(true);
  });

  it('recusa texto sem @', () => {
    expect(isValidEmail('gustavo.example.com')).toBe(false);
  });

  it('recusa e-mail sem domínio', () => {
    expect(isValidEmail('gustavo@')).toBe(false);
  });

  it('recusa vazio', () => {
    expect(isValidEmail('')).toBe(false);
  });
});
