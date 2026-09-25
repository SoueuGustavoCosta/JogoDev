import { describe, expect, it } from 'vitest';
import { scrollDepthPercent } from './scrollDepth';

describe('scrollDepthPercent', () => {
  it('no topo de uma página longa conta só o que está visível', () => {
    expect(scrollDepthPercent({ scrollTop: 0, viewportHeight: 800, contentHeight: 8000 })).toBe(10);
  });

  it('arredonda para baixo de 10 em 10', () => {
    // (3000 + 800) / 8000 = 47,5% -> 40
    expect(scrollDepthPercent({ scrollTop: 3000, viewportHeight: 800, contentHeight: 8000 })).toBe(40);
    // (3200 + 800) / 8000 = 50% -> 50
    expect(scrollDepthPercent({ scrollTop: 3200, viewportHeight: 800, contentHeight: 8000 })).toBe(50);
  });

  it('chegar ao fim dá 100, inclusive com meio pixel faltando', () => {
    expect(scrollDepthPercent({ scrollTop: 7200, viewportHeight: 800, contentHeight: 8000 })).toBe(100);
    expect(scrollDepthPercent({ scrollTop: 7199.5, viewportHeight: 800, contentHeight: 8000 })).toBe(100);
  });

  it('quase no fim ainda não é 100', () => {
    // (7000 + 800) / 8000 = 97,5% -> 90
    expect(scrollDepthPercent({ scrollTop: 7000, viewportHeight: 800, contentHeight: 8000 })).toBe(90);
  });

  it('conteúdo que cabe na tela conta como visto inteiro', () => {
    expect(scrollDepthPercent({ scrollTop: 0, viewportHeight: 800, contentHeight: 600 })).toBe(100);
    expect(scrollDepthPercent({ scrollTop: 0, viewportHeight: 800, contentHeight: 0 })).toBe(100);
  });

  it('nunca sai do intervalo 0–100, mesmo com medidas estranhas', () => {
    // rolagem "elástica" do iOS pode dar valores negativos ou além do fim
    expect(scrollDepthPercent({ scrollTop: -120, viewportHeight: 800, contentHeight: 8000 })).toBe(10);
    expect(scrollDepthPercent({ scrollTop: 9999, viewportHeight: 800, contentHeight: 8000 })).toBe(100);
    expect(scrollDepthPercent({ scrollTop: Number.NaN, viewportHeight: 800, contentHeight: 8000 })).toBe(0);
  });
});
