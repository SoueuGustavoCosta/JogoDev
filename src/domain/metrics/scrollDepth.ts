/**
 * Quanto de uma página o aluno já viu, em porcentagem arredondada PARA BAIXO de 10 em 10
 * (0, 10, ..., 100). Usado no evento `module_left` para saber em que altura do módulo as
 * pessoas desistem. Para baixo de propósito: 100 só quando a pessoa chegou mesmo ao fim.
 *
 * Puro: recebe as medidas já lidas da tela (quem chama lê `window`/`document`).
 */
export function scrollDepthPercent(measures: {
  /** Quanto já rolou a partir do topo, em px. */
  scrollTop: number;
  /** Altura da parte visível da tela, em px. */
  viewportHeight: number;
  /** Altura total do conteúdo, em px. */
  contentHeight: number;
}): number {
  const { scrollTop, viewportHeight, contentHeight } = measures;
  if (![scrollTop, viewportHeight, contentHeight].every(Number.isFinite)) return 0;
  // Conteúdo que cabe inteiro na tela: a pessoa já está vendo tudo.
  if (contentHeight <= 0 || contentHeight <= viewportHeight) return 100;
  const seen = (Math.max(0, scrollTop) + Math.max(0, viewportHeight)) / contentHeight;
  const percent = Math.min(100, Math.max(0, seen * 100));
  // O último pixel às vezes não é alcançável por arredondamento de subpixel: 99,5% conta como fim.
  if (percent >= 99.5) return 100;
  return Math.floor(percent / 10) * 10;
}

/**
 * Mesma ideia de `scrollDepthPercent`, para a lição em telas curtas: quantas telas o aluno
 * já viu (contando a atual) de um total, arredondado para baixo de 10 em 10.
 */
export function screenDepthPercent(screensSeen: number, totalScreens: number): number {
  if (!Number.isFinite(screensSeen) || !Number.isFinite(totalScreens) || totalScreens <= 0) return 0;
  const percent = Math.min(100, Math.max(0, (screensSeen / totalScreens) * 100));
  return Math.floor(percent / 10) * 10;
}
