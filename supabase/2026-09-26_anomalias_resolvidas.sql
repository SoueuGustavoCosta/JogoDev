-- Etapa 7 (Anomalia do Dia). PARA O AUTOR APLICAR no SQL Editor do Supabase
-- (projeto haukhnpiaczkkwncnmlu). O Claude Code NÃO rodou nada no banco.
--
-- Conferido contra o banco real em 2026-09-26 (pg_policies, só leitura): as tabelas
-- públicas usam "leitura publica" (select using true) + "inserir so a propria linha"
-- (insert to authenticated with check auth.uid() = uuid). Esta tabela segue o mesmo padrão
-- de escrita, mas SEM leitura pública: a turma só vê a contagem do dia, pela função
-- contar_anomalias_resolvidas, nunca quem consertou.
--
-- O app já funciona sem isto aplicado: a gravação falha em silêncio e o contador
-- "N viajantes já consertaram" simplesmente não aparece.

create table if not exists public.anomalias_resolvidas (
  uuid uuid not null references public.jogadores (uuid) on delete cascade,
  anomalia_id text not null check (char_length(anomalia_id) between 1 and 60),
  -- dia da anomalia no fuso de São Paulo (AAAA-MM-DD), o mesmo que o app usa
  dia date not null,
  resolvida_em timestamptz not null default now(),
  primary key (uuid, dia)
);

alter table public.anomalias_resolvidas enable row level security;

create policy "anomalias: ler so as proprias linhas"
  on public.anomalias_resolvidas for select to authenticated
  using (auth.uid() = uuid);

-- Só a própria linha e só para um dia perto de hoje (evita "consertar" dias passados em massa).
create policy "anomalias: inserir so a propria linha"
  on public.anomalias_resolvidas for insert to authenticated
  with check (
    auth.uid() = uuid
    and dia between (now() at time zone 'America/Sao_Paulo')::date - 1
                and (now() at time zone 'America/Sao_Paulo')::date + 1
  );

grant select, insert on public.anomalias_resolvidas to authenticated;

-- Contagem pública do dia, sem nomes nem uuids.
create or replace function public.contar_anomalias_resolvidas(p_dia date)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.anomalias_resolvidas where dia = p_dia;
$$;

revoke all on function public.contar_anomalias_resolvidas(date) from public;
grant execute on function public.contar_anomalias_resolvidas(date) to anon, authenticated;

-- Conferência depois de aplicar (deve listar as 2 políticas e a função):
--   select policyname, cmd from pg_policies where tablename = 'anomalias_resolvidas';
--   select public.contar_anomalias_resolvidas((now() at time zone 'America/Sao_Paulo')::date);
