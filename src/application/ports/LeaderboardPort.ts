export type HallOfTravelersEntry = {
  nome: string;
  criadoEm: string;
  insignias: string[];
};

/** Perfil público do jogador (tabela `jogadores`), usado no cabeçalho do viajante. */
export type PlayerProfile = {
  nome: string;
  fotoUrl: string | null;
  sequenciaAtual: number;
  sequenciaRecorde: number;
  ultimoDiaAtivo: string | null; // YYYY-MM-DD
};

/** Um viajante "online agora" na faixa de presença. */
export type OnlinePlayer = { uuid: string; nome: string; fotoUrl: string | null };

/**
 * Porta do "Hall dos Viajantes": sincronização silenciosa do progresso público
 * (sem login) com o Supabase. As escritas nunca devem lançar nem travar o
 * jogo — cada implementação captura seus próprios erros internamente (rede fora
 * do ar, projeto Supabase pausado etc.). As leituras (`listHallOfTravelers`,
 * `listOnlinePlayers`) são leituras normais: podem rejeitar, e quem chama mostra
 * um estado de carregamento/erro.
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
  /** Lê o perfil público de um jogador (foto, sequência), ou null se ainda não existe/falhar. */
  getPlayer(uuid: string): Promise<PlayerProfile | null>;
  /**
   * Check-in diário: grava nome + sequência + marca `ultima_atividade = now()`.
   * Falha silenciosa: nunca deve quebrar o jogo.
   */
  checkIn(
    uuid: string,
    params: { nome: string; sequenciaAtual: number; sequenciaRecorde: number; ultimoDiaAtivo: string },
  ): Promise<void>;
  /** Batimento de presença: só atualiza `ultima_atividade = now()`. Falha silenciosa. */
  heartbeat(uuid: string): Promise<void>;
  /** Envia a foto (já redimensionada) para o Storage e devolve a URL pública, ou null se falhar. */
  uploadAvatar(uuid: string, blob: Blob): Promise<string | null>;
  /** Lista quem pingou nos últimos `sinceMinutes` minutos (padrão ~5). Pode rejeitar. */
  listOnlinePlayers(sinceMinutes?: number): Promise<OnlinePlayer[]>;
}
