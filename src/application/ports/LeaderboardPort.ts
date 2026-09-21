export type HallOfTravelersEntry = {
  nome: string;
  criadoEm: string;
  insignias: string[];
};

/**
 * Porta do "Hall dos Viajantes": sincronização silenciosa do progresso público
 * (sem login) com o Supabase. As três escritas nunca devem lançar nem travar o
 * jogo — cada implementação captura seus próprios erros internamente (rede fora
 * do ar, projeto Supabase pausado etc.). A leitura (`listHallOfTravelers`) é uma
 * leitura normal: pode rejeitar, e quem chama mostra um estado de carregamento/erro.
 */
export interface LeaderboardPort {
  /** Cria/atualiza o jogador (upsert por uuid). Falha silenciosa: nunca deve quebrar o jogo. */
  upsertPlayer(uuid: string, nome: string): Promise<void>;
  /** Registra a conclusão de uma fase (upsert por uuid+era+fase). Falha silenciosa. */
  syncProgress(uuid: string, era: string, fase: string): Promise<void>;
  /** Registra a conquista de uma insígnia (upsert por uuid+nome_insignia). Falha silenciosa. */
  syncBadge(uuid: string, nomeInsignia: string): Promise<void>;
  /** Lê a lista pública para o Hall dos Viajantes: nome + insígnias de cada jogador. */
  listHallOfTravelers(): Promise<HallOfTravelersEntry[]>;
}
