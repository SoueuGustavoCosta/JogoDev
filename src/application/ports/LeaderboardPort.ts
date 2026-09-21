export type HallOfTravelersEntry = {
  nome: string;
  criadoEm: string;
  insignias: string[];
  bio: string | null;
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
  /**
   * Sobe o `Progress` inteiro (backup silencioso, além do resumo público já sincronizado
   * pelos outros métodos). `unknown` de propósito: esta porta vive em `application/`, que
   * não deve importar o tipo `Progress` de `domain/` só para repassá-lo como JSON opaco.
   * Falha silenciosa: nunca deve quebrar o jogo.
   */
  backupProgress(uuid: string, progress: unknown): Promise<void>;
  /**
   * Salva o hash do código de recuperação (gerado no cliente) via RPC `definir_codigo_recuperacao`,
   * que nunca devolve o hash a ninguém (nem à chave anon: a coluna é bloqueada por `revoke select`
   * — só as duas funções SECURITY DEFINER em `supabase/schema.sql` conseguem lê-la). Falha
   * silenciosa: nunca deve quebrar o jogo.
   */
  setRecoveryCode(uuid: string, codigo: string): Promise<void>;
  /**
   * Recuperação de progresso: nome do jogador **e** o código de recuperação gerado por ele
   * (`setRecoveryCode`). Substitui o antigo `fetchProgressByName`, que bastava saber o nome —
   * inseguro, porque nomes são públicos no Hall dos Viajantes. Usa a RPC `restaurar_progresso`,
   * que só devolve linha quando nome e código batem. `null` se não houver correspondência.
   * Leitura normal: pode rejeitar.
   */
  restoreProgress(nome: string, codigo: string): Promise<{ uuid: string; progress: unknown } | null>;
  /** Salva a bio curta do viajante (upsert por uuid). Falha silenciosa: nunca deve quebrar o jogo. */
  saveBio(uuid: string, bio: string): Promise<void>;
}
