import { describe, expect, it } from 'vitest';
import { phpHintFor } from './phpHints';

describe('phpHintFor', () => {
  it('traduz erro de sintaxe genérico', () => {
    expect(phpHintFor('PHP Parse error:  syntax error, unexpected token "}" in file.php on line 3')).toMatch(/;|fechar/);
  });

  it('traduz fim de arquivo inesperado', () => {
    expect(phpHintFor('PHP Parse error:  syntax error, unexpected end of file in file.php on line 5')).toMatch(/fechar/);
  });

  it('traduz variável indefinida, citando o nome dela', () => {
    expect(phpHintFor('PHP Warning:  Undefined variable $nome in file.php on line 2')).toContain('$nome');
  });

  it('traduz função indefinida, citando o nome dela', () => {
    expect(phpHintFor('PHP Fatal error:  Uncaught Error: Call to undefined function imprimir() in file.php:1')).toContain('imprimir()');
  });

  it('traduz divisão por zero', () => {
    expect(phpHintFor('PHP Fatal error:  Uncaught DivisionByZeroError: Division by zero in file.php:1')).toMatch(/zero/);
  });

  it('devolve string vazia para mensagens sem tradução conhecida', () => {
    expect(phpHintFor('algo completamente diferente')).toBe('');
  });
});
