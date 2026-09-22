import type { HallOfTravelersEntry, LeaderboardPort, OnlinePlayer, PlayerProfile, SavePhoneResult } from '@/application/ports';
import { syntheticEmailForPhone } from '@/domain/traveler';
import { PHONE_AUTH_EMAIL_DOMAIN } from '@/config/auth';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/config/supabase';

type SelectResult = {
  data: Record<string, unknown>[] | null;
  error: { message: string } | null;
};

type SelectQuery = {
  order(column: string, opts?: { ascending: boolean }): Promise<SelectResult>;
  eq(column: string, value: unknown): {
    maybeSingle(): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
  };
  gte(column: string, value: string): Promise<SelectResult>;
};

type AuthSession = { user: { id: string } };
type AuthUserResult = { data: { user: { id: string } | null; session: AuthSession | null }; error: { message: string } | null };

type SupabaseClientLike = {
  auth: {
    getSession(): Promise<{ data: { session: AuthSession | null }; error: { message: string } | null }>;
    signInAnonymously(): Promise<{ data: { session: AuthSession | null }; error: { message: string } | null }>;
    updateUser(attrs: { email?: string; password?: string }): Promise<AuthUserResult>;
    signUp(params: { email: string; password: string }): Promise<AuthUserResult>;
    signInWithPassword(params: { email: string; password: string }): Promise<AuthUserResult>;
    resetPasswordForEmail(email: string, opts?: { redirectTo?: string }): Promise<{ error: { message: string } | null }>;
    signOut(): Promise<{ error: { message: string } | null }>;
  };
  from(table: string): {
    upsert(values: Record<string, unknown>, opts?: { onConflict: string }): Promise<{ error: { message: string } | null }>;
    update(values: Record<string, unknown>): { eq(column: string, value: unknown): Promise<{ error: { message: string } | null }> };
    select(columns: string): SelectQuery;
  };
  rpc<T = unknown>(fnName: string, args: Record<string, unknown>): Promise<{ data: T | null; error: { message: string } | null }>;
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        blob: Blob,
        opts?: { upsert?: boolean; contentType?: string },
      ): Promise<{ error: { message: string } | null }>;
      getPublicUrl(path: string): { data: { publicUrl: string } };
    };
  };
};

/**
 * Implementação de LeaderboardPort sobre o Supabase (`@supabase/supabase-js`).
 * Carregado só sob demanda (dynamic import), nunca no bundle inicial — mesmo
 * padrão de `PgliteEngine`. O cliente é criado uma única vez e reaproveitado.
 *
 * As políticas de RLS exigem `auth.uid() = uuid` pra gravar (ver `supabase/schema.sql`):
 * uma escrita só grava de verdade quando `ensureSignedIn()` já resolveu uma sessão real
 * (anônima ou por telefone+senha) para aquele mesmo uuid. Sem sessão, a escrita falha
 * silenciosamente (capturada no try/catch de cada método) — o jogo continua funcionando
 * só sem sincronizar.
 */
export class SupabaseLeaderboard implements LeaderboardPort {
  private client: SupabaseClientLike | null = null;
  private loading: Promise<SupabaseClientLike> | null = null;

  private ensureClient(): Promise<SupabaseClientLike> {
    if (this.client) return Promise.resolve(this.client);
    if (!this.loading) {
      this.loading = (async () => {
        const { createClient } = await import('@supabase/supabase-js');
        const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY) as unknown as SupabaseClientLike;
        this.client = client;
        return client;
      })();
    }
    return this.loading;
  }

  async upsertPlayer(uuid: string, nome: string): Promise<void> {
    try {
      const client = await this.ensureClient();
      const { error } = await client.from('jogadores').upsert({ uuid, nome }, { onConflict: 'uuid' });
      if (error && import.meta.env.DEV) console.warn('[SupabaseLeaderboard] upsertPlayer falhou:', error.message);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] upsertPlayer falhou:', e);
    }
  }

  async syncProgress(uuid: string, era: string, fase: string): Promise<void> {
    try {
      const client = await this.ensureClient();
      const { error } = await client
        .from('progresso')
        .upsert({ uuid, era, fase }, { onConflict: 'uuid,era,fase' });
      if (error && import.meta.env.DEV) console.warn('[SupabaseLeaderboard] syncProgress falhou:', error.message);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] syncProgress falhou:', e);
    }
  }

  async syncBadge(uuid: string, nomeInsignia: string): Promise<void> {
    try {
      const client = await this.ensureClient();
      const { error } = await client
        .from('insignias')
        .upsert({ uuid, nome_insignia: nomeInsignia }, { onConflict: 'uuid,nome_insignia' });
      if (error && import.meta.env.DEV) console.warn('[SupabaseLeaderboard] syncBadge falhou:', error.message);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] syncBadge falhou:', e);
    }
  }

  async listHallOfTravelers(): Promise<HallOfTravelersEntry[]> {
    const client = await this.ensureClient();
    const [jogadoresRes, insigniasRes, progressoRes] = await Promise.all([
      client.from('jogadores').select('uuid,nome,criado_em,bio,foto_url').order('criado_em', { ascending: true }),
      client.from('insignias').select('uuid,nome_insignia').order('conquistada_em', { ascending: true }),
      client.from('progresso').select('uuid,era').order('concluido_em', { ascending: true }),
    ]);
    if (jogadoresRes.error) throw new Error(jogadoresRes.error.message);
    if (insigniasRes.error) throw new Error(insigniasRes.error.message);
    if (progressoRes.error) throw new Error(progressoRes.error.message);

    const badgesByUuid = new Map<string, string[]>();
    for (const row of insigniasRes.data ?? []) {
      const uuid = String(row.uuid);
      const list = badgesByUuid.get(uuid) ?? [];
      list.push(String(row.nome_insignia));
      badgesByUuid.set(uuid, list);
    }

    // `era` = trail.id (ver syncProgress). Cada viajante toca a mesma trilha várias vezes
    // (um `era`/`fase` por módulo ou missão concluída) — aqui só quer-se as trilhas
    // distintas, na ordem em que apareceram pela primeira vez.
    const trailsByUuid = new Map<string, string[]>();
    for (const row of progressoRes.data ?? []) {
      const uuid = String(row.uuid);
      const era = String(row.era);
      const list = trailsByUuid.get(uuid) ?? [];
      if (!list.includes(era)) list.push(era);
      trailsByUuid.set(uuid, list);
    }

    return (jogadoresRes.data ?? []).map((row) => ({
      uuid: String(row.uuid),
      nome: String(row.nome),
      criadoEm: String(row.criado_em),
      insignias: badgesByUuid.get(String(row.uuid)) ?? [],
      bio: row.bio ? String(row.bio) : null,
      fotoUrl: row.foto_url ? String(row.foto_url) : null,
      trilhas: trailsByUuid.get(String(row.uuid)) ?? [],
    }));
  }

  async getPlayer(uuid: string): Promise<PlayerProfile | null> {
    try {
      const client = await this.ensureClient();
      const { data, error } = await client
        .from('jogadores')
        .select('nome,foto_url,sequencia_atual,sequencia_recorde,ultimo_dia_ativo')
        .eq('uuid', uuid)
        .maybeSingle();
      if (error || !data) {
        if (error && import.meta.env.DEV) console.warn('[SupabaseLeaderboard] getPlayer falhou:', error.message);
        return null;
      }
      return {
        nome: String(data.nome),
        fotoUrl: data.foto_url ? String(data.foto_url) : null,
        sequenciaAtual: Number(data.sequencia_atual ?? 0),
        sequenciaRecorde: Number(data.sequencia_recorde ?? 0),
        ultimoDiaAtivo: data.ultimo_dia_ativo ? String(data.ultimo_dia_ativo) : null,
      };
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] getPlayer falhou:', e);
      return null;
    }
  }

  async checkIn(
    uuid: string,
    params: { nome: string; sequenciaAtual: number; sequenciaRecorde: number; ultimoDiaAtivo: string },
  ): Promise<void> {
    try {
      const client = await this.ensureClient();
      const { error } = await client.from('jogadores').upsert(
        {
          uuid,
          nome: params.nome,
          sequencia_atual: params.sequenciaAtual,
          sequencia_recorde: params.sequenciaRecorde,
          ultimo_dia_ativo: params.ultimoDiaAtivo,
          ultima_atividade: new Date().toISOString(),
        },
        { onConflict: 'uuid' },
      );
      if (error && import.meta.env.DEV) console.warn('[SupabaseLeaderboard] checkIn falhou:', error.message);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] checkIn falhou:', e);
    }
  }

  async heartbeat(uuid: string): Promise<void> {
    try {
      const client = await this.ensureClient();
      const { error } = await client
        .from('jogadores')
        .update({ ultima_atividade: new Date().toISOString() })
        .eq('uuid', uuid);
      if (error && import.meta.env.DEV) console.warn('[SupabaseLeaderboard] heartbeat falhou:', error.message);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] heartbeat falhou:', e);
    }
  }

  async uploadAvatar(uuid: string, blob: Blob): Promise<string | null> {
    try {
      const client = await this.ensureClient();
      const path = `${uuid}.webp`;
      const { error } = await client.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: blob.type || 'image/webp' });
      if (error) {
        if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] uploadAvatar falhou:', error.message);
        return null;
      }
      const { data } = client.storage.from('avatars').getPublicUrl(path);
      const url = data.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : null;
      if (url) {
        // Guarda a URL pública também em `jogadores`, para leituras futuras (getPlayer)
        // não dependerem de recalcular o caminho no Storage.
        await client.from('jogadores').upsert({ uuid, foto_url: url }, { onConflict: 'uuid' });
      }
      return url;
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] uploadAvatar falhou:', e);
      return null;
    }
  }

  async listOnlinePlayers(sinceMinutes = 5): Promise<OnlinePlayer[]> {
    const client = await this.ensureClient();
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString();
    const { data, error } = await client.from('jogadores').select('uuid,nome,foto_url').gte('ultima_atividade', since);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      uuid: String(row.uuid),
      nome: String(row.nome),
      fotoUrl: row.foto_url ? String(row.foto_url) : null,
    }));
  }

  async backupProgress(uuid: string, progress: unknown): Promise<void> {
    try {
      const client = await this.ensureClient();
      const { error } = await client.from('jogadores').update({ progresso_completo: progress }).eq('uuid', uuid);
      if (error && import.meta.env.DEV) console.warn('[SupabaseLeaderboard] backupProgress falhou:', error.message);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] backupProgress falhou:', e);
    }
  }

  async setRecoveryCode(uuid: string, codigo: string): Promise<void> {
    try {
      const client = await this.ensureClient();
      const { error } = await client.rpc('definir_codigo_recuperacao', { p_uuid: uuid, p_codigo: codigo });
      if (error && import.meta.env.DEV) console.warn('[SupabaseLeaderboard] setRecoveryCode falhou:', error.message);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] setRecoveryCode falhou:', e);
    }
  }

  async restoreProgress(nome: string, codigo: string): Promise<{ uuid: string; progress: unknown } | null> {
    const client = await this.ensureClient();
    const { data, error } = await client.rpc<{ uuid: string; progresso: unknown }[]>('restaurar_progresso', {
      p_nome: nome,
      p_codigo: codigo,
    });
    if (error) throw new Error(error.message);
    const row = data?.[0];
    if (!row || row.progresso == null) return null;
    return { uuid: String(row.uuid), progress: row.progresso };
  }

  async saveBio(uuid: string, bio: string): Promise<void> {
    try {
      const client = await this.ensureClient();
      const { error } = await client.from('jogadores').upsert({ uuid, bio }, { onConflict: 'uuid' });
      if (error && import.meta.env.DEV) console.warn('[SupabaseLeaderboard] saveBio falhou:', error.message);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] saveBio falhou:', e);
    }
  }

  async ensureSignedIn(): Promise<string | null> {
    try {
      const client = await this.ensureClient();
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError && import.meta.env.DEV) {
        console.warn('[SupabaseLeaderboard] getSession falhou:', sessionError.message);
      }
      if (sessionData.session) return sessionData.session.user.id;

      const { data: signInData, error: signInError } = await client.auth.signInAnonymously();
      if (signInError || !signInData.session) {
        if (signInError && import.meta.env.DEV) {
          console.warn('[SupabaseLeaderboard] signInAnonymously falhou:', signInError.message);
        }
        return null;
      }
      return signInData.session.user.id;
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] ensureSignedIn falhou:', e);
      return null;
    }
  }

  private static readonly GENERIC_ERROR_REASON = 'Não foi possível salvar agora. Tente novamente em instantes.';

  /** Mensagens do Supabase Auth para "essa identidade já existe" variam por versão/idioma. */
  private static looksLikeAlreadyRegistered(message: string): boolean {
    return /already (been )?register|already exists|already in use/i.test(message);
  }

  /**
   * `progresso_completo` não é mais legível por `select` direto (coluna bloqueada no
   * banco, ver `supabase/schema.sql`) — só por esta RPC `meu_progresso()`, que só
   * devolve algo quando quem chama já está autenticado como o próprio dono da linha
   * (`auth.uid() = uuid`, checado dentro da função). É por isso que o `signInWithPassword`
   * precisa vir antes: só depois dele a sessão passa a ser desse uuid.
   */
  private async signInWithAccountEmail(email: string, password: string): Promise<SavePhoneResult> {
    try {
      const client = await this.ensureClient();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        return { ok: false, reason: 'Telefone já cadastrado, mas a senha não confere.' };
      }
      const { data: progresso } = await client.rpc<unknown>('meu_progresso', {});
      return { ok: true, uid: data.user.id, restoredProgress: progresso ?? null };
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] signInWithAccountEmail falhou:', e);
      return { ok: false, reason: SupabaseLeaderboard.GENERIC_ERROR_REASON };
    }
  }

  /**
   * `updateUser`/`signUp` erraram ao tentar criar ou vincular a conta. Antes de desistir,
   * tenta entrar como se o telefone já tivesse conta — cobre não só o caso já detectado
   * pelo regex de `looksLikeAlreadyRegistered` (mensagem varia por versão/idioma do
   * Supabase, então o regex nem sempre bate), como qualquer outra falha nessa chamada.
   * Se o login também falhar: com colisão confirmada pelo regex, devolve o motivo exato
   * do login ("senha não confere" é um diagnóstico confiável quando já sabemos que a
   * conta existe); sem confirmação, devolve o erro genérico em vez de arriscar uma
   * mensagem que pode estar errada (a conta pode nem existir ainda).
   */
  private async recoverAsLogin(
    accountEmail: string,
    password: string,
    originalError: { message: string },
    origin: string,
  ): Promise<SavePhoneResult> {
    const knownCollision = SupabaseLeaderboard.looksLikeAlreadyRegistered(originalError.message);
    const signIn = await this.signInWithAccountEmail(accountEmail, password);
    if (signIn.ok) return signIn;
    if (import.meta.env.DEV) {
      console.warn(`[SupabaseLeaderboard] saveProgressWithPhone (${origin}) falhou:`, originalError.message);
    }
    return knownCollision ? signIn : { ok: false, reason: SupabaseLeaderboard.GENERIC_ERROR_REASON };
  }

  /**
   * "Salvar progresso"/"Entrar" (ver LeaderboardPort): promove a sessão atual (anônima)
   * para uma conta permanente de telefone+senha. `accountEmail` é o e-mail informado
   * (quando houver) ou um e-mail sintético derivado só do telefone — em qualquer um dos
   * casos, é essa mesma combinação que precisa ser informada de novo pra entrar depois
   * (ver doc do método na porta). Sem SMS, sem e-mail de verdade obrigatório — exige
   * "Confirm email" desligado no painel do Supabase (ver `config/auth.ts`).
   */
  async saveProgressWithPhone(phone: string, password: string, email?: string): Promise<SavePhoneResult> {
    const accountEmail = email?.trim() || syntheticEmailForPhone(phone, PHONE_AUTH_EMAIL_DOMAIN);
    try {
      const client = await this.ensureClient();
      const { data: sessionData } = await client.auth.getSession();

      if (sessionData.session) {
        const { data, error } = await client.auth.updateUser({ email: accountEmail, password });
        if (!error && data.user) return { ok: true, uid: data.user.id, restoredProgress: null };
        if (error) return this.recoverAsLogin(accountEmail, password, error, 'updateUser');
      }

      // Sem sessão (raro: bootstrap anônimo ainda não rodou/falhou): cria a conta direto.
      const { data, error } = await client.auth.signUp({ email: accountEmail, password });
      if (error) return this.recoverAsLogin(accountEmail, password, error, 'signUp');
      if (!data.user) return { ok: false, reason: SupabaseLeaderboard.GENERIC_ERROR_REASON };
      return { ok: true, uid: data.user.id, restoredProgress: null };
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] saveProgressWithPhone falhou:', e);
      return { ok: false, reason: SupabaseLeaderboard.GENERIC_ERROR_REASON };
    }
  }

  /**
   * Só funciona pra contas que informaram um e-mail de verdade no cadastro (ver
   * `saveProgressWithPhone`) — o Supabase nunca revela se o e-mail existe ou não (sempre
   * devolve sucesso quando a chamada em si funcionou), então nem tentamos adivinhar aqui.
   */
  async requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; reason: string }> {
    try {
      const client = await this.ensureClient();
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/redefinir-senha` : undefined;
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] requestPasswordReset falhou:', error.message);
        return { ok: false, reason: SupabaseLeaderboard.GENERIC_ERROR_REASON };
      }
      return { ok: true };
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] requestPasswordReset falhou:', e);
      return { ok: false, reason: SupabaseLeaderboard.GENERIC_ERROR_REASON };
    }
  }

  /** Só funciona logo depois de abrir o link do e-mail de `requestPasswordReset`. */
  async updatePassword(newPassword: string): Promise<{ ok: true } | { ok: false; reason: string }> {
    try {
      const client = await this.ensureClient();
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) {
        return { ok: false, reason: 'Não foi possível salvar a nova senha. O link pode ter expirado — peça um novo.' };
      }
      return { ok: true };
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] updatePassword falhou:', e);
      return { ok: false, reason: 'Não foi possível salvar a nova senha. O link pode ter expirado — peça um novo.' };
    }
  }

  async signOut(): Promise<void> {
    try {
      const client = await this.ensureClient();
      await client.auth.signOut();
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] signOut falhou:', e);
    }
  }
}
