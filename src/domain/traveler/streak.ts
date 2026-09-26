/**
 * Nível do viajante. A sequência diária virou a Linha do Tempo (ver ./timeline.ts, Etapa 8):
 * abrir o app deixou de contar como dia jogado.
 */

/**
 * Nível do viajante a partir do XP acumulado. Fórmula provisória (placeholder):
 * não existe conceito de "nível" definido no produto ainda — 500 XP por nível é um
 * chute redondo só para a navbar ter algo para mostrar. TODO(autor): defina a
 * constante certa de XP por nível quando o conceito for desenhado de verdade.
 */
export function travelerLevel(xp: number): number {
  const XP_PER_LEVEL = 500;
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}
