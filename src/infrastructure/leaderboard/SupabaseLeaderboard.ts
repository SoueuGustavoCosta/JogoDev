import type { HallOfTravelersEntry, LeaderboardPort, OnlinePlayer, PlayerProfile } from '@/application/ports';
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

type SupabaseClientLike = {
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
 * RESSALVA (ver `supabase/schema.sql`): não há Supabase Auth aqui, então estas
 * escritas não conseguem provar que o uuid pertence a quem está escrevendo. Foi
 * uma decisão aceita para manter o app sem login/senha — não "corrija" isso
 * adicionando autenticação sem que o autor peça.
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
    const [jogadoresRes, insigniasRes] = await Promise.all([
      client.from('jogadores').select('uuid,nome,criado_em').order('criado_em', { ascending: true }),
      client.from('insignias').select('uuid,nome_insignia').order('conquistada_em', { ascending: true }),
    ]);
    if (jogadoresRes.error) throw new Error(jogadoresRes.error.message);
    if (insigniasRes.error) throw new Error(insigniasRes.error.message);

    const badgesByUuid = new Map<string, string[]>();
    for (const row of insigniasRes.data ?? []) {
      const uuid = String(row.uuid);
      const list = badgesByUuid.get(uuid) ?? [];
      list.push(String(row.nome_insignia));
      badgesByUuid.set(uuid, list);
    }

    return (jogadoresRes.data ?? []).map((row) => ({
      nome: String(row.nome),
      criadoEm: String(row.criado_em),
      insignias: badgesByUuid.get(String(row.uuid)) ?? [],
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
}
