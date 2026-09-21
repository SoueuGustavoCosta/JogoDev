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
 * Resultado de `saveProgressWithPhone`. `restoredProgress` só vem preenchido quando o
 * telefone já tinha conta (a senha bateu e o método entrou nela em vez de criar uma
 * nova): é o `Progress` (tipado como `unknown` pelo mesmo motivo de `backupProgress`)
 * salvo lá da última vez, pra quem chama restaurar localmente.
 */
export type SavePhoneResult =
  | { ok: true; uid: string; restoredProgress: unknown | null }
  | { ok: false; reason: string };

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
  /**
   * Garante uma sessão do Supabase Auth (login anônimo, `signInAnonymously`) e devolve
   * o `auth.uid()` real da sessão, reaproveitando a sessão já existente quando houver
   * (o cliente supabase-js persiste/renova o token sozinho). `null` em qualquer falha
   * (rede fora do ar, "Allow anonymous sign-ins" ainda desligado no painel, projeto
   * pausado etc.) — nunca lança. Este é o novo identificador do viajante (ver
   * `bootstrapTravelerIdentity`, em `application/usecases/traveler.ts`), que aos poucos
   * substitui o uuid gerado localmente por `crypto.randomUUID()`; a partir dela o RLS
   * já exige `auth.uid() = uuid` pra gravar (ver `supabase/schema.sql`), então essa troca
   * de identidade deixou de ser só aditiva: escritas sem sessão simplesmente não gravam
   * mais (falha silenciosa, o jogo continua funcionando só sem sincronizar).
   */
  ensureSignedIn(): Promise<string | null>;
  /**
   * "Salvar progresso"/"Entrar": promove a sessão atual (anônima, ver `ensureSignedIn`)
   * para uma conta permanente de telefone+senha, sem SMS nem confirmação por e-mail. O
   * `email` é opcional — quando informado, vira o e-mail de verdade da conta (permite
   * "esqueci a senha" de verdade, ver `requestPasswordReset`); quando omitido, usa um
   * e-mail sintético derivado só do telefone (ver `domain/traveler/credentials`), e nesse
   * caso não há como recuperar a senha se for esquecida.
   *
   * Se a combinação telefone+e-mail (ou só telefone, se não informou e-mail) já tiver
   * conta, tenta entrar com a senha informada em vez de criar outra — nesse caso devolve
   * `restoredProgress` com o backup salvo daquela conta, para quem chama adotar localmente
   * (mesmo espírito de `restoreProgress`, mas iniciado pelo telefone+senha em vez do
   * nome+código). Por isso a mesma caixa serve tanto pra criar quanto pra entrar: quem
   * volta com o mesmo telefone/e-mail+senha simplesmente entra na conta que já existe.
   * Falha com motivo em português pronto para mostrar na tela (telefone inválido, senha
   * não confere etc.) — nunca lança.
   */
  saveProgressWithPhone(phone: string, password: string, email?: string): Promise<SavePhoneResult>;
  /**
   * Pede ao Supabase Auth pra mandar um e-mail de redefinição de senha (link pro app,
   * rota `/redefinir-senha`). Só funciona pra contas que informaram um e-mail de verdade
   * no cadastro (ver `saveProgressWithPhone`) — contas só com e-mail sintético não têm
   * como receber nada. Devolve sempre `{ ok: true }` quando a chamada em si funcionou,
   * mesmo que o e-mail não exista: é assim que o próprio Supabase evita revelar se uma
   * conta existe ou não. `{ ok: false }` só por falha de rede/serviço.
   */
  requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; reason: string }>;
  /**
   * Define uma nova senha pra sessão atual — só funciona logo depois de abrir o link do
   * e-mail de `requestPasswordReset` (o Supabase troca a URL por uma sessão temporária de
   * redefinição). Fora desse contexto, ou se o link já expirou, falha com um motivo
   * pronto pra mostrar.
   */
  updatePassword(newPassword: string): Promise<{ ok: true } | { ok: false; reason: string }>;
}
