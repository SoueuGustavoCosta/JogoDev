/**
 * Rota do cometa na tela (em % da largura e da altura): entra pela direita, faz uma curva
 * suave para cima e sai pela esquerda. `s` = progresso (0 a 1). Fica abaixo do minimapa.
 */
const P0 = { x: 104, y: 36 };
const P1 = { x: 50, y: 8 };
const P2 = { x: -4, y: 36 };

export function cometPoint(s: number): { x: number; y: number } {
  const a = 1 - s;
  return {
    x: a * a * P0.x + 2 * a * s * P1.x + s * s * P2.x,
    y: a * a * P0.y + 2 * a * s * P1.y + s * s * P2.y,
  };
}

/** Ângulo (graus) para onde a cauda aponta: o contrário do movimento, em pixels reais da tela. */
export function tailAngle(s: number, width: number, height: number): number {
  const dx = (2 * (1 - s) * (P1.x - P0.x) + 2 * s * (P2.x - P1.x)) * width;
  const dy = (2 * (1 - s) * (P1.y - P0.y) + 2 * s * (P2.y - P1.y)) * height;
  return (Math.atan2(-dy, -dx) * 180) / Math.PI;
}
