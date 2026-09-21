/**
 * Sequência diária ("streak", tipo Duolingo) e nível do viajante. Regra do produto
 * (CLAUDE.md + decisão do autor): só abrir o app num dia já conta como "jogou aquele
 * dia" — não depende de concluir módulo nem quiz, o check-in é trivial de propósito.
 *
 * Puro: TypeScript puro, sem `Date` além de comparação de strings já formatadas
 * `YYYY-MM-DD` (quem chama decide o fuso, hoje sempre o local do navegador).
 */

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calcula a sequência depois de um check-in em `todayISO`.
 * - Mesmo dia do último check-in: nada muda.
 * - Exatamente um dia depois: sequência +1.
 * - Qualquer intervalo maior, ou primeira vez (`lastActiveDateISO === null`): reinicia em 1.
 * - `best` é sempre o maior valor já visto.
 */
export function nextStreak(
  lastActiveDateISO: string | null,
  todayISO: string,
  current: number,
  best: number,
): { current: number; best: number } {
  let nextCurrent: number;
  if (lastActiveDateISO === null) {
    nextCurrent = 1;
  } else {
    const diff = daysBetween(lastActiveDateISO, todayISO);
    if (diff === 0) nextCurrent = current;
    else if (diff === 1) nextCurrent = current + 1;
    else nextCurrent = 1;
  }
  return { current: nextCurrent, best: Math.max(best, nextCurrent) };
}

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
