-- Etapa 10 (Liga dos Viajantes semanal). PARA O AUTOR APLICAR no SQL Editor do Supabase
-- (projeto haukhnpiaczkkwncnmlu). O Claude Code NÃO rodou nada no banco.
--
-- Escolha: TABELA xp_semanal (uma linha por viajante por semana), não uma view sobre
-- eventos de XP. O XP é calculado no app (não existe tabela de eventos de XP no banco);
-- guardar cada resposta viraria centenas de linhas por viajante no plano gratuito, só
-- para somar depois. Aqui o app manda o total da semana e o servidor guarda o maior valor
-- visto (nunca diminui). A semana começa segunda 00:00 e termina domingo 23:59 no fuso
-- America/Sao_Paulo, e é identificada pela data da segunda-feira.
--
-- Proteção básica (decisão do autor): ninguém grava direto na tabela. Só a função
-- registrar_xp_semanal grava, e ela confere que:
--   * quem grava é o próprio viajante (auth.uid(), não um uuid mandado pelo cliente);
--   * a semana é a semana atual (não dá para mexer em semanas passadas ou futuras);
--   * o XP está entre 0 e o teto da semana (valores absurdos são recusados).
--
-- Conferido contra o banco real em 2026-09-26 (information_schema, só leitura): não existe
-- tabela xp_semanal nem funções com estes nomes; jogadores.uuid é a chave primária usada
-- pelas outras tabelas.
--
-- O app já funciona sem isto aplicado: o envio falha em silêncio e a aba Liga mostra só
-- o próprio viajante, com o aviso de que o ranking está fora do ar.

create table if not exists public.xp_semanal (
  uuid uuid not null references public.jogadores (uuid) on delete cascade,
  -- segunda-feira da semana (fuso de São Paulo)
  semana date not null check (extract(isodow from semana) = 1),
  xp integer not null default 0 check (xp >= 0),
  atualizado_em timestamptz not null default now(),
  primary key (uuid, semana)
);

create index if not exists xp_semanal_ranking on public.xp_semanal (semana, xp desc);

alter table public.xp_semanal enable row level security;

-- Leitura pública (como as outras tabelas públicas); escrita só pela função abaixo.
create policy "xp_semanal: leitura publica" on public.xp_semanal for select using (true);
revoke insert, update, delete, truncate on public.xp_semanal from anon, authenticated;
grant select on public.xp_semanal to anon, authenticated;

-- Segunda-feira da semana atual em São Paulo (date_trunc('week') começa na segunda).
create or replace function public.semana_atual()
returns date
language sql
stable
as $$
  select date_trunc('week', now() at time zone 'America/Sao_Paulo')::date;
$$;

create or replace function public.registrar_xp_semanal(p_semana date, p_xp integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uuid uuid := auth.uid();
  -- TODO(autor): teto de XP por semana. 10000 cobre ~12 módulos inteiros de primeira
  -- (cada um ~750 XP) + 7 anomalias. Ajuste se alguém legítimo bater no limite.
  v_teto constant integer := 10000;
begin
  if v_uuid is null then
    raise exception 'sem sessão';
  end if;
  if p_semana is distinct from public.semana_atual() then
    raise exception 'semana fora da atual';
  end if;
  if p_xp is null or p_xp < 0 or p_xp > v_teto then
    raise exception 'xp fora do limite';
  end if;
  -- Só quem já é viajante (linha em jogadores, criada no check-in).
  if not exists (select 1 from public.jogadores where uuid = v_uuid) then
    return;
  end if;
  insert into public.xp_semanal (uuid, semana, xp)
  values (v_uuid, p_semana, p_xp)
  on conflict (uuid, semana)
  do update set xp = greatest(public.xp_semanal.xp, excluded.xp),
                atualizado_em = case when excluded.xp > public.xp_semanal.xp then now() else public.xp_semanal.atualizado_em end;
end;
$$;

revoke all on function public.registrar_xp_semanal(date, integer) from public;
grant execute on function public.registrar_xp_semanal(date, integer) to authenticated;

-- Ranking de uma semana (padrão: a atual): nome, foto, dias de linha e XP. Sem telefone,
-- e-mail nem backup. Empate: quem chegou primeiro ao XP fica na frente.
create or replace function public.liga_da_semana(p_semana date default null)
returns table (uuid uuid, nome text, foto_url text, sequencia_atual integer, xp integer)
language sql
stable
security definer
set search_path = public
as $$
  select j.uuid, j.nome, j.foto_url, j.sequencia_atual, x.xp
  from public.xp_semanal x
  join public.jogadores j on j.uuid = x.uuid
  where x.semana = coalesce(p_semana, public.semana_atual()) and x.xp > 0
  order by x.xp desc, x.atualizado_em asc
  limit 100;
$$;

revoke all on function public.liga_da_semana(date) from public;
grant execute on function public.liga_da_semana(date) to anon, authenticated;

-- Conferência depois de aplicar:
--   select public.semana_atual();                       -- a segunda-feira desta semana
--   select * from public.liga_da_semana();              -- vazio até alguém ganhar XP
--   select policyname, cmd from pg_policies where tablename = 'xp_semanal';
