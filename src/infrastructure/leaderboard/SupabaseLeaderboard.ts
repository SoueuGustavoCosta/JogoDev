import type {
  HallOfTravelersEntry,
  LeaderboardPort,
  OnlinePlayer,
  PlayerProfile,
  SignInIdentifier,
  SignInResult,
  SignUpResult,
} from '@/application/ports';
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
  in(column: string, values: unknown[]): Promise<SelectResult>;
};

type AuthSession = { user: { id: string; is_anonymous?: boolean } };
type AuthUserResult = { data: { user: { id: string } | null; session: AuthSession | null }; error: { message: string } | null };

type SupabaseClientLike = {
  auth: {
    getSession(): Promise<{ data: { session: AuthSession | null }; error: { message: string } | null }>;
    signInAnonymously(): Promise<{ data: { session: AuthSession | null }; error: { message: string } | null }>;
    updateUser(attrs: { email?: string; password?: string }): Promise<AuthUserResult>;
    signUp(params: { email: string; password: string }): Promise<AuthUserResult>;
    signInWithPassword(params: { email: string; password: string }): Promise<AuthUserResult>;
    resetPasswordForEmail(email: string, opts?: { redirectTo?: string }): Promise<{ error: { message: string } | null }>;
    signOut(opts?: { scope?: 'global' | 'local' | 'others' }): Promise<{ error: { message: string } | null }>;
  };
  from(table: string): {
    upsert(values: Record<string, unknown>, opts?: { onConflict: string }): Promise<{ error: { message: string } | null }>;
    update(
      values: Record<string, unknown>,
      opts?: { count: 'exact' },
    ): { eq(column: string, value: unknown): Promise<{ error: { message: string } | null; count: number | null }> };
    insert(values: Record<string, unknown>): Promise<{ error: { message: string; code?: string } | null }>;
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

  async recordAnomalySolved(uuid: string, anomalyId: string, day: string): Promise<void> {
    try {
      const client = await this.ensureClient();
      // Uma linha por viajante por dia (chave primária uuid + dia): repetir dá conflito 23505,
      // que é esperado (já estava registrada) e não é erro de verdade.
      const { error } = await client.from('anomalias_resolvidas').insert({ uuid, anomalia_id: anomalyId, dia: day });
      if (error && error.code !== '23505' && import.meta.env.DEV) {
        console.warn('[SupabaseLeaderboard] recordAnomalySolved falhou:', error.message);
      }
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] recordAnomalySolved falhou:', e);
    }
  }

  async countAnomalySolved(day: string): Promise<number | null> {
    try {
      const client = await this.ensureClient();
      const { data, error } = await client.rpc<number>('contar_anomalias_resolvidas', { p_dia: day });
      if (error || typeof data !== 'number') return null;
      return data;
    } catch {
      return null;
    }
  }

  async saveCosmetics(uuid: string, equipped: Record<string, string>): Promise<void> {
    try {
      const client = await this.ensureClient();
      // Update (não upsert): a linha do jogador já existe desde o primeiro check-in.
      const { error } = await client.from('jogadores').update({ cosmeticos: equipped }).eq('uuid', uuid);
      if (error && import.meta.env.DEV) console.warn('[SupabaseLeaderboard] saveCosmetics falhou:', error.message);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] saveCosmetics falhou:', e);
    }
  }

  /**
   * Consulta à parte (nunca junto das leituras do Hall/presença): enquanto a coluna
   * `cosmeticos` não existir no banco, só esta leitura falha, e o resto segue igual.
   */
  async listCosmetics(uuids: string[]): Promise<Record<string, unknown>> {
    if (uuids.length === 0) return {};
    try {
      const client = await this.ensureClient();
      const { data, error } = await client.from('jogadores').select('uuid,cosmeticos').in('uuid', uuids.slice(0, 200));
      if (error || !data) return {};
      const out: Record<string, unknown> = {};
      for (const row of data) if (row.cosmeticos) out[String(row.uuid)] = row.cosmeticos;
      return out;
    } catch {
      return {};
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

  /**
   * Nunca upsert/`ON CONFLICT DO UPDATE` aqui, só update-e-se-não-existir-insere na mão:
   * Postgres exige privilégio de SELECT nas colunas do SET de um `ON CONFLICT DO UPDATE`
   * — mesmo só escrevendo nelas, nunca lendo — e `progresso_completo` não tem SELECT de
   * propósito (protege o backup de leitura direta, ver `supabase/schema.sql`). Confirmado
   * ao vivo: um upsert bate exatamente nesse muro ("permission denied for table
   * jogadores") assim que `progresso_completo` entra no SET, mesmo com o GRANT de
   * colunas públicas certo. Update comum não tem essa exigência; `{ count: 'exact' }` vem
   * do próprio comando UPDATE (quantas linhas afetou), não de nenhuma leitura — por isso
   * também não precisa de SELECT.
   *
   * Update-então-insere não é atômico: `openTimeline` e o batimento de presença disparam
   * juntos, sem esperar um pelo outro (ver `Layout.tsx`), e ambos podem tentar criar a
   * linha do jogador pela primeira vez ao mesmo tempo. Se o UPDATE daqui não achar
   * nenhuma linha (`count === 0`) mas, entre isso e o INSERT, o outro lado já tiver
   * criado a linha, o INSERT esbarra em "duplicate key" (23505) — não é erro de verdade,
   * só perdeu a corrida. Refaz o UPDATE uma vez mais nesse caso (a linha já existe agora).
   */
  async backupProgress(uuid: string, nome: string, progress: unknown): Promise<void> {
    try {
      const client = await this.ensureClient();
      const doUpdate = () =>
        client.from('jogadores').update({ nome, progresso_completo: progress }, { count: 'exact' }).eq('uuid', uuid);

      const { error: updateError, count } = await doUpdate();
      if (updateError) {
        if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] backupProgress (update) falhou:', updateError.message);
        return;
      }
      if (count && count > 0) return;

      // Nenhuma linha existia ainda pra esse uuid: insere (sem ON CONFLICT).
      const { error: insertError } = await client
        .from('jogadores')
        .insert({ uuid, nome, progresso_completo: progress });
      if (!insertError) return;

      if (insertError.code === '23505') {
        const { error: retryError } = await doUpdate();
        if (retryError && import.meta.env.DEV) {
          console.warn('[SupabaseLeaderboard] backupProgress (update pós-corrida) falhou:', retryError.message);
        }
        return;
      }
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] backupProgress (insert) falhou:', insertError.message);
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
   * (`auth.uid() = uuid`, checado dentro da função).
   */
  async getMyProgress(): Promise<unknown | null> {
    // Lança em falha de leitura (nunca devolve null nesse caso): quem chama decide o que
    // gravar a partir disto, e "não consegui ler" tratado como "não tem nada salvo" foi o
    // que deixou cópias vazias sobrescreverem progresso de verdade.
    const client = await this.ensureClient();
    const { data, error } = await client.rpc<unknown>('meu_progresso', {});
    if (error) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] meu_progresso falhou:', error.message);
      throw new Error(error.message);
    }
    return data ?? null;
  }

  /**
   * "Criar conta" (ver LeaderboardPort). Só promove sessão ANÔNIMA: `updateUser` numa
   * sessão de conta de verdade trocaria o e-mail/senha daquela conta — era assim que a
   * antiga caixa "Salvar ou entrar" podia sobrescrever a conta de outra pessoa. Nunca
   * tenta entrar na conta quando o telefone já existe: só avisa. Exige "Confirm email"
   * desligado no painel do Supabase (ver `config/auth.ts`).
   */
  async signUpWithPhone(phone: string, password: string, email?: string): Promise<SignUpResult> {
    const accountEmail = email?.trim() || syntheticEmailForPhone(phone, PHONE_AUTH_EMAIL_DOMAIN);
    try {
      const client = await this.ensureClient();
      const { data: sessionData } = await client.auth.getSession();
      const session = sessionData.session;
      if (session && session.user.is_anonymous === false) {
        return { ok: false, reason: 'Este aparelho já está numa conta. Saia dela antes de criar outra.' };
      }

      // O telefone pode já ser de uma conta criada com e-mail (o e-mail de login dela não é
      // o sintético): sem esta checagem, "Criar conta" abria uma segunda conta vazia.
      const { data: phoneTaken, error: phoneCheckError } = await client.rpc<boolean>('telefone_tem_conta', {
        p_telefone: phone,
      });
      if (phoneCheckError) {
        if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] telefone_tem_conta falhou:', phoneCheckError.message);
        return { ok: false, reason: SupabaseLeaderboard.GENERIC_ERROR_REASON };
      }
      if (phoneTaken) return { ok: false, exists: true, reason: 'Esse telefone já tem conta. Use "Entrar".' };

      const { data, error } = session
        ? await client.auth.updateUser({ email: accountEmail, password })
        : await client.auth.signUp({ email: accountEmail, password });
      if (error || !data.user) {
        if (import.meta.env.DEV && error) console.warn('[SupabaseLeaderboard] signUpWithPhone falhou:', error.message);
        if (error && SupabaseLeaderboard.looksLikeAlreadyRegistered(error.message)) {
          const reason = email ? 'Esse e-mail já tem conta. Use "Entrar".' : 'Esse telefone já tem conta. Use "Entrar".';
          return { ok: false, exists: true, reason };
        }
        return { ok: false, reason: 'Não foi possível criar a conta agora. Se esse telefone já tem conta, use "Entrar".' };
      }
      // Liga o telefone à conta, para dar pra entrar por ele mesmo quando o login é o e-mail.
      const { error: registerError } = await client.rpc('registrar_telefone', { p_telefone: phone });
      if (registerError && import.meta.env.DEV) {
        console.warn('[SupabaseLeaderboard] registrar_telefone falhou:', registerError.message);
      }
      return { ok: true, uid: data.user.id };
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] signUpWithPhone falhou:', e);
      return { ok: false, reason: SupabaseLeaderboard.GENERIC_ERROR_REASON };
    }
  }

  /**
   * "Entrar" (ver LeaderboardPort). `getMyProgress` precisa vir depois do login: só
   * então a sessão passa a ser desta conta e a RPC `meu_progresso()` devolve o backup.
   * Se a leitura falhar, sai da conta de novo (só neste aparelho) em vez de seguir sem
   * saber o que está salvo nela.
   */
  async signInWithPassword(identifier: SignInIdentifier, password: string): Promise<SignInResult> {
    const byPhone = 'phone' in identifier;
    const accountEmail = byPhone ? syntheticEmailForPhone(identifier.phone, PHONE_AUTH_EMAIL_DOMAIN) : identifier.email;
    try {
      const client = await this.ensureClient();
      let { data, error } = await client.auth.signInWithPassword({ email: accountEmail, password });
      if ((error || !data.user) && byPhone) {
        // Conta criada com e-mail: o login dela é o e-mail, não o sintético do telefone. A
        // RPC só devolve esse e-mail se a senha conferir (ver `email_de_login` no schema).
        const { data: loginEmail } = await client.rpc<string>('email_de_login', {
          p_telefone: identifier.phone,
          p_senha: password,
        });
        if (loginEmail) ({ data, error } = await client.auth.signInWithPassword({ email: loginEmail, password }));
      }
      if (error || !data.user) {
        if (import.meta.env.DEV && error) console.warn('[SupabaseLeaderboard] signInWithPassword falhou:', error.message);
        const reason = byPhone
          ? 'Telefone ou senha não conferem.'
          : 'E-mail ou senha não conferem.';
        return { ok: false, reason };
      }
      try {
        const progress = await this.getMyProgress();
        return { ok: true, uid: data.user.id, progress };
      } catch {
        await client.auth.signOut({ scope: 'local' });
        return { ok: false, reason: 'Não consegui carregar sua conta agora. Tente de novo em instantes.' };
      }
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] signInWithPassword falhou:', e);
      return { ok: false, reason: 'Não foi possível entrar agora. Tente novamente em instantes.' };
    }
  }

  /**
   * Só funciona pra contas que informaram um e-mail de verdade no cadastro (ver
   * `signUpWithPhone`) — o Supabase nunca revela se o e-mail existe ou não (sempre
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

  async hasRealSession(): Promise<boolean> {
    try {
      const client = await this.ensureClient();
      const { data } = await client.auth.getSession();
      return Boolean(data.session && data.session.user.is_anonymous === false);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] hasRealSession falhou:', e);
      return false;
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
      // Só este aparelho: o padrão do supabase-js ("global") derruba a sessão da conta em
      // todos os aparelhos, e cada um deles passava a jogar numa sessão anônima nova sem
      // perceber — o progresso de lá deixava de subir para a conta.
      await client.auth.signOut({ scope: 'local' });
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[SupabaseLeaderboard] signOut falhou:', e);
    }
  }
}
