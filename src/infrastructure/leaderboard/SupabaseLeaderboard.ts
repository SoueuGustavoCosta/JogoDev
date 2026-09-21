import type { HallOfTravelersEntry, LeaderboardPort } from '@/application/ports';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/config/supabase';

type SupabaseClientLike = {
  from(table: string): {
    upsert(values: Record<string, unknown>, opts?: { onConflict: string }): Promise<{ error: { message: string } | null }>;
    select(columns: string): {
      order(column: string, opts?: { ascending: boolean }): Promise<{
        data: Record<string, unknown>[] | null;
        error: { message: string } | null;
      }>;
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
}
