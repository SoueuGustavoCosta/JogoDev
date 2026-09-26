-- Etapa 13B (Oficina do Viajante: mural da turma e oficinas resolvidas). PARA O AUTOR
-- APLICAR no SQL Editor do Supabase (projeto haukhnpiaczkkwncnmlu). O Claude Code NÃO
-- rodou nada no banco.
--
-- Conferido contra o banco real em 2026-09-26 (information_schema, só leitura): não
-- existem as tabelas nem as funções abaixo. Mesmo padrão de RLS de supabase/schema.sql:
-- leitura pública onde o mural precisa, escrita só da própria linha (auth.uid() = uuid).
-- Testado num Postgres local (PGlite) antes de entregar.
--
-- Sem isto aplicado, a Oficina funciona igual: só o mural aparece como "fora do ar" e a
-- Convergência por oficinas não conta.

-- 1) Soluções publicadas no mural (só quem toca em "Publicar no mural").
create table if not exists public.solucoes_oficina (
  id bigint generated always as identity primary key,
  uuid uuid not null references public.jogadores (uuid) on delete cascade,
  workshop_id text not null check (workshop_id ~ '^[a-z][a-z0-9-]{0,59}$'),
  linguagem text not null check (linguagem in ('php', 'js', 'python')),
  -- limite de tamanho (o app também limita, e filtra palavrões antes de enviar)
  codigo text not null check (char_length(codigo) between 1 and 4000),
  criada_em timestamptz not null default now(),
  unique (uuid, workshop_id, linguagem)
);

alter table public.solucoes_oficina enable row level security;
create policy "solucoes: leitura publica" on public.solucoes_oficina for select using (true);
create policy "solucoes: inserir so a propria" on public.solucoes_oficina for insert to authenticated
  with check (auth.uid() = uuid);
create policy "solucoes: atualizar so a propria" on public.solucoes_oficina for update to authenticated
  using (auth.uid() = uuid) with check (auth.uid() = uuid);
create policy "solucoes: apagar so a propria" on public.solucoes_oficina for delete to authenticated
  using (auth.uid() = uuid);
revoke all on public.solucoes_oficina from anon, authenticated;
grant select on public.solucoes_oficina to anon, authenticated;
grant insert, update, delete on public.solucoes_oficina to authenticated;

-- 2) Estrelas: cada viajante dá no máximo uma por solução, e nunca na própria.
create table if not exists public.estrelas_solucao (
  uuid uuid not null references public.jogadores (uuid) on delete cascade,
  solucao_id bigint not null references public.solucoes_oficina (id) on delete cascade,
  dada_em timestamptz not null default now(),
  primary key (uuid, solucao_id)
);

alter table public.estrelas_solucao enable row level security;
create policy "estrelas: ler so as proprias" on public.estrelas_solucao for select to authenticated
  using (auth.uid() = uuid);
create policy "estrelas: dar so em nome proprio e nao na propria solucao" on public.estrelas_solucao
  for insert to authenticated
  with check (
    auth.uid() = uuid
    and not exists (select 1 from public.solucoes_oficina s where s.id = solucao_id and s.uuid = auth.uid())
  );
create policy "estrelas: tirar so as proprias" on public.estrelas_solucao for delete to authenticated
  using (auth.uid() = uuid);
revoke all on public.estrelas_solucao from anon, authenticated;
grant select, insert, delete on public.estrelas_solucao to authenticated;

-- 3) Oficinas resolvidas (para a Convergência poder contar oficinas da turma).
create table if not exists public.oficinas_resolvidas (
  uuid uuid not null references public.jogadores (uuid) on delete cascade,
  workshop_id text not null check (workshop_id ~ '^[a-z][a-z0-9-]{0,59}$'),
  resolvida_em timestamptz not null default now(),
  primary key (uuid, workshop_id)
);

alter table public.oficinas_resolvidas enable row level security;
create policy "oficinas: ler so as proprias" on public.oficinas_resolvidas for select to authenticated
  using (auth.uid() = uuid);
create policy "oficinas: inserir so a propria" on public.oficinas_resolvidas for insert to authenticated
  with check (auth.uid() = uuid);
revoke all on public.oficinas_resolvidas from anon, authenticated;
grant select, insert on public.oficinas_resolvidas to authenticated;

-- 4) Mural de uma oficina: nome, foto, linguagem, código e estrelas (sem telefone, e-mail
-- nem backup). `minha_estrela` diz se quem pergunta já deu estrela naquela solução.
create or replace function public.mural_oficina(p_workshop text)
returns table (
  id bigint,
  uuid uuid,
  nome text,
  foto_url text,
  linguagem text,
  codigo text,
  criada_em timestamptz,
  estrelas integer,
  minha_estrela boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.uuid, j.nome, j.foto_url, s.linguagem, s.codigo, s.criada_em,
         (select count(*)::integer from public.estrelas_solucao e where e.solucao_id = s.id),
         exists (select 1 from public.estrelas_solucao e where e.solucao_id = s.id and e.uuid = auth.uid())
  from public.solucoes_oficina s
  join public.jogadores j on j.uuid = s.uuid
  where s.workshop_id = p_workshop
  order by 8 desc, s.criada_em asc
  limit 50;
$$;

revoke all on function public.mural_oficina(text) from public;
grant execute on function public.mural_oficina(text) to anon, authenticated;

-- 5) Quantas oficinas a turma resolveu num período (Convergência com metric 'oficinas').
create or replace function public.contar_oficinas_periodo(p_inicio date, p_fim date)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_inicio is null or p_fim is null or p_fim < p_inicio or p_fim - p_inicio > 366 then 0
    else (
      select count(*)::integer from public.oficinas_resolvidas
      where (resolvida_em at time zone 'America/Sao_Paulo')::date between p_inicio and p_fim
    )
  end;
$$;

revoke all on function public.contar_oficinas_periodo(date, date) from public;
grant execute on function public.contar_oficinas_periodo(date, date) to anon, authenticated;

-- Conferência depois de aplicar:
--   select * from public.mural_oficina('mini-calculadora');
--   select public.contar_oficinas_periodo('2026-10-01', '2026-10-31');
--   select tablename, policyname, cmd from pg_policies where tablename in ('solucoes_oficina', 'estrelas_solucao', 'oficinas_resolvidas');
