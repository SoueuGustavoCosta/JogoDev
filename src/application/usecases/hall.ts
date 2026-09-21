import type { HallOfTravelersEntry, LeaderboardPort } from '../ports';

/**
 * Lê a lista pública do Hall dos Viajantes. Mantém o componente livre de chamar a
 * porta diretamente (regra de camadas do CLAUDE.md): a tela só conhece este usecase.
 * Ao contrário das sincronizações silenciosas, esta chamada pode rejeitar — quem
 * chama decide como mostrar carregando/erro.
 */
export function getHallOfTravelers(deps: { leaderboard: LeaderboardPort }): Promise<HallOfTravelersEntry[]> {
  return deps.leaderboard.listHallOfTravelers();
}
