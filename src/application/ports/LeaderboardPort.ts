export type HallOfTravelersEntry = {
  uuid: string;
  nome: string;
  criadoEm: string;
  insignias: string[];
  bio: string | null;
  fotoUrl: string | null;
  /** Ids das trilhas (`trail.id`) que o viajante já tocou, na ordem da primeira vez. */
  trilhas: string[];
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
 * Resultado de `signUpWithPhone` (tela "Criar conta"). `exists` avisa que o telefone
 * (ou e-mail) já tem conta: a tela manda a pessoa para "Entrar", nunca entra sozinha
 * nem mexe na conta que já existe.
 */
export type SignUpResult = { ok: true; uid: string } | { ok: false; reason: string; exists?: boolean };

/**
 * Resultado de `signInWithPassword` (tela "Entrar"). `progress` é o backup completo
 * salvo na conta (`unknown` pelo mesmo motivo de `backupProgress`), ou `null` se a conta
 * nunca teve um backup completo.
 */
export type SignInResult = { ok: true; uid: string; progress: unknown | null } | { ok: false; reason: string };

/** Como a pessoa se identifica na tela "Entrar": pelo telefone ou pelo e-mail do cadastro. */
export type SignInIdentifier = { phone: string } | { email: string };

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
   *
   * Recebe `nome` à parte (não só dentro de `progress`) porque a implementação faz um
   * upsert, não um update: se a linha do jogador ainda não existir em `jogadores` (ex.:
   * este é o primeiro backup depois de criar a conta, antes de `checkIn` ter rodado —
   * ou simplesmente rodou antes dele, por causa da corrida entre as duas chamadas
   * disparadas juntas em `Layout.tsx`), um `update` não cria nada — silenciosamente não
   * salva nada, e o app segue achando que salvou. Isso já causou perda de progresso de
   * verdade. `nome` é obrigatório na tabela (`not null check`), então o upsert precisa
   * dele pra poder inserir a linha quando for a primeira vez.
   */
  backupProgress(uuid: string, nome: string, progress: unknown): Promise<void>;
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
   * Devolve o `Progress` salvo (backup completo) da conta autenticada agora (via RPC
   * `meu_progresso()`, que só lê a própria linha — `auth.uid() = uuid`), ou `null` se não
   * houver nada salvo ainda. **Lança se a leitura falhar** (rede, RPC): "não consegui ler"
   * nunca pode ser confundido com "não tem nada salvo", senão uma cópia vazia acaba
   * sobrescrevendo progresso de verdade. Usado por `bootstrapTravelerIdentity`
   * quando a sessão do Supabase resolve pra um uid diferente do `travelerUuid` já salvo
   * neste aparelho (ex.: sessão de recuperação de senha assumindo sozinha, fora do fluxo
   * de `signInWithPhone`) — sem checar isso, o app re-rotulava o progresso local
   * (podia ser de sessão anônima sem relação nenhuma) pro uid novo sem nunca olhar o que
   * já estava salvo na conta de verdade, arriscando sobrescrever esse progresso no
   * próximo backup silencioso.
   */
  getMyProgress(): Promise<unknown | null>;
  /**
   * "Criar conta": promove a sessão anônima atual (ver `ensureSignedIn`) para uma conta
   * permanente de telefone+senha, sem SMS nem confirmação por e-mail, mantendo o mesmo
   * uid (o progresso que a pessoa já fez jogando anônima continua dela). O `email` é
   * opcional — quando informado, vira o e-mail de verdade da conta (permite "esqueci a
   * senha", ver `requestPasswordReset`); quando omitido, usa um e-mail sintético derivado
   * só do telefone (ver `domain/traveler/credentials`).
   *
   * Nunca entra numa conta que já existe e nunca altera uma conta que não seja anônima:
   * se a sessão atual já é de uma conta de verdade, recusa (trocar o e-mail/senha dela
   * seria sobrescrever a conta de outra pessoa); se o telefone/e-mail já tem conta,
   * devolve `exists: true`. Falha com motivo em português pronto para mostrar — nunca lança.
   */
  signUpWithPhone(phone: string, password: string, email?: string): Promise<SignUpResult>;
  /**
   * "Entrar": troca a sessão deste aparelho pela da conta (telefone ou e-mail + senha) e
   * devolve o backup completo salvo nela. Nunca altera a conta. Se a senha bater mas não
   * der pra ler o backup, desfaz a entrada e falha: entrar "no escuro" arriscaria gravar
   * o progresso deste aparelho por cima do da conta. Nunca lança.
   */
  signInWithPassword(identifier: SignInIdentifier, password: string): Promise<SignInResult>;
  /**
   * Pede ao Supabase Auth pra mandar um e-mail de redefinição de senha (link pro app,
   * rota `/redefinir-senha`). Só funciona pra contas que informaram um e-mail de verdade
   * no cadastro (ver `signUpWithPhone`) — contas só com e-mail sintético não têm
   * como receber nada. Devolve sempre `{ ok: true }` quando a chamada em si funcionou,
   * mesmo que o e-mail não exista: é assim que o próprio Supabase evita revelar se uma
   * conta existe ou não. `{ ok: false }` só por falha de rede/serviço.
   */
  requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; reason: string }>;
  /**
   * Diz se a sessão atual é de uma conta de verdade (não anônima) — usado pela tela de
   * `/redefinir-senha` (ResetPasswordPage) pra checar se o link de redefinição realmente
   * abriu uma sessão de recuperação antes de aceitar a senha nova. Sem essa checagem, abrir
   * `/redefinir-senha` sem token nenhum (link expirado, aberto sem o fragmento da URL, ou
   * simplesmente digitado) deixava a página tentar `updatePassword` em cima de qualquer
   * sessão que já estivesse ativa neste aparelho — inclusive a sessão anônima de quem só
   * estava jogando, definindo uma senha inútil (sem e-mail/telefone pra usar depois) numa
   * conta que não tem nada a ver com o pedido de redefinição.
   */
  hasRealSession(): Promise<boolean>;
  /**
   * Define uma nova senha pra sessão atual — só funciona logo depois de abrir o link do
   * e-mail de `requestPasswordReset` (o Supabase troca a URL por uma sessão temporária de
   * redefinição). Fora desse contexto, ou se o link já expirou, falha com um motivo
   * pronto pra mostrar.
   */
  updatePassword(newPassword: string): Promise<{ ok: true } | { ok: false; reason: string }>;
  /**
   * Encerra a sessão do Supabase Auth (telefone+senha ou anônima) SÓ neste aparelho (as
   * sessões da mesma conta em outros aparelhos continuam valendo), para
   * outra pessoa poder entrar na própria conta em seguida (ver `signOutTraveler`, em
   * `application/usecases/traveler.ts`). Falha silenciosa: nunca lança — o usecase que
   * chama sempre limpa o progresso local em seguida, sessão tendo saído ou não.
   */
  signOut(): Promise<void>;
  /**
   * Registra que o viajante consertou a Anomalia do Dia (Etapa 7), na tabela
   * `anomalias_resolvidas`. Uma linha por viajante por dia. Falha em silêncio (sem rede, ou
   * tabela ainda não criada): a recompensa já foi gravada no progresso local.
   */
  recordAnomalySolved(uuid: string, anomalyId: string, day: string): Promise<void>;
  /**
   * Quantos viajantes já consertaram a anomalia de um dia (contagem pública, sem nomes).
   * `null` quando não dá pra saber (offline, sem Supabase, função ainda não criada).
   */
  countAnomalySolved(day: string): Promise<number | null>;
}
