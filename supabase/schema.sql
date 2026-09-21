-- Esquema já aplicado no projeto Supabase remoto (haukhnpiaczkkwncnmlu, sa-east-1).
-- Este arquivo é só documentação viva do que está no ar: nada aqui é executado
-- automaticamente pelo app nem pelo CI. Se o esquema remoto mudar, atualize este
-- arquivo para que ele continue refletindo a realidade.

create table public.jogadores (
  uuid uuid primary key,
  nome text not null check (char_length(nome) between 1 and 24),
  criado_em timestamptz not null default now()
);

-- nome único (case-insensitive) — já era pedido do autor há uma mensagem: "nenhum nome pode
-- ser igual ao outro". O histórico do jogador nunca depende do nome, sempre do uuid.
create unique index if not exists jogadores_nome_unique_ci on public.jogadores (lower(nome));

alter table public.jogadores
  add column if not exists foto_url text,
  add column if not exists ultima_atividade timestamptz,
  add column if not exists sequencia_atual integer not null default 0,
  add column if not exists sequencia_recorde integer not null default 0,
  add column if not exists ultimo_dia_ativo date;

-- backup silencioso do `Progress` inteiro (não só o resumo público usado no Hall dos
-- Viajantes): permite recuperar o progresso completo de outro aparelho pelo nome único,
-- sem login/senha. Guardado como JSON opaco — o app nunca modela essa coluna no Supabase,
-- só serializa/deserializa o mesmo objeto que já vive em `localStorage`.
alter table public.jogadores
  add column if not exists progresso_completo jsonb;

-- resumo curto e público sobre o viajante ("Estou cursando Ciência da Computação..."),
-- mostrado no Hall dos Viajantes junto com o nome e as insígnias. Coberto pelas mesmas
-- políticas públicas de `jogadores` (leitura/upsert/update), como `nome`/`foto_url`.
alter table public.jogadores add column if not exists bio text;

-- bucket de storage "avatars": público pra leitura, aceita só imagem, limite de 60KB
-- (o cliente já manda redimensionado a ~128x128px/50KB, a margem é só segurança)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 61440, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars: leitura publica" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: upload publico" on storage.objects for insert with check (bucket_id = 'avatars');
create policy "avatars: update publico" on storage.objects for update using (bucket_id = 'avatars') with check (bucket_id = 'avatars');

create table public.progresso (
  uuid uuid not null references public.jogadores (uuid) on delete cascade,
  era text not null,
  fase text not null,
  concluido_em timestamptz not null default now(),
  primary key (uuid, era, fase)
);

create table public.insignias (
  uuid uuid not null references public.jogadores (uuid) on delete cascade,
  nome_insignia text not null,
  conquistada_em timestamptz not null default now(),
  primary key (uuid, nome_insignia)
);

-- RLS habilitado nas três tabelas. SELECT público nas três (é isso que torna o Hall dos
-- Viajantes público) — mas só nas colunas realmente públicas de `jogadores` (ver GRANT
-- abaixo; `progresso_completo` nunca entra nesse grant). INSERT/UPDATE em `jogadores`,
-- `progresso` e `insignias`, e INSERT/UPDATE dos avatares no Storage, exigem
-- `auth.uid() = uuid` (ou `name = auth.uid() || '.webp'` pros avatares) — só o dono
-- daquele uuid grava naquela linha. Isso ficou possível com o login anônimo do Supabase
-- Auth (`ensureSignedIn`/`bootstrapTravelerIdentity`): cada viajante, mesmo sem cadastro
-- nenhum, passou a ter uma sessão real com um `auth.uid()` verdadeiro.
--
-- ATENÇÃO — pegadinha real que já aconteceu aqui (2026-09-21): um `revoke select
-- (coluna) on tabela from anon` **não tem efeito nenhum** se `anon`/`authenticated` já
-- tiverem um GRANT SELECT na TABELA INTEIRA (que é o padrão de bootstrap de projeto do
-- Supabase) — o grant de tabela inteira já libera todas as colunas, e o revoke por
-- coluna só desfaz um grant que tivesse sido dado por coluna, que nunca existiu. A forma
-- certa de bloquear uma coluna sensível é `revoke select on tabela from anon,
-- authenticated` (a tabela inteira) e depois `grant select (só as colunas públicas) on
-- tabela to anon, authenticated`. Antes de confiar em qualquer `revoke`/RLS novo,
-- confirme de verdade consultando `information_schema.column_privileges` — não baste
-- confiar no que este arquivo diz, ele pode ter ficado desatualizado (foi exatamente o
-- que aconteceu com `codigo_recuperacao_hash` abaixo, por um bom tempo).
grant select (uuid, nome, criado_em, foto_url, ultima_atividade, sequencia_atual, sequencia_recorde, ultimo_dia_ativo, bio)
  on public.jogadores to anon, authenticated;

create policy "jogadores: atualizar so a propria linha"
  on public.jogadores for update to authenticated
  using (auth.uid() = uuid)
  with check (auth.uid() = uuid);

create policy "jogadores: inserir so a propria linha"
  on public.jogadores for insert to authenticated
  with check (auth.uid() = uuid);

create policy "insignias: inserir so a propria linha"
  on public.insignias for insert to authenticated
  with check (auth.uid() = uuid);

create policy "progresso: inserir so a propria linha"
  on public.progresso for insert to authenticated
  with check (auth.uid() = uuid);

create policy "avatars: upload da propria foto"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and name = (auth.uid())::text || '.webp');

create policy "avatars: atualizar a propria foto"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and name = (auth.uid())::text || '.webp')
  with check (bucket_id = 'avatars' and name = (auth.uid())::text || '.webp');

-- `progresso_completo` (o backup completo do Progress) nunca é legível por `select`
-- direto — nem pela chave anon, nem autenticado — porque não entra no grant de colunas
-- acima. Só é lido por `meu_progresso()` (o próprio dono, autenticado) ou por
-- `restaurar_progresso()` (nome+código, ver abaixo). Ambas SECURITY DEFINER.
revoke select on public.jogadores from anon, authenticated;

create or replace function public.meu_progresso()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v jsonb;
begin
  select progresso_completo into v from public.jogadores where uuid = auth.uid();
  return v;
end;
$$;
revoke all on function public.meu_progresso() from public;
grant execute on function public.meu_progresso() to authenticated;

-- Código de recuperação: a busca de progresso de outro aparelho antes bastava saber o
-- nome do jogador (`fetchProgressByName`/`ilike nome`) — inseguro, porque nomes são
-- públicos no Hall dos Viajantes, e isso permitia a qualquer um sequestrar/ver o
-- progresso de qualquer jogador só por saber o nome dele. Substituído por um código de
-- recuperação curto, gerado uma vez no cliente e mostrado uma vez, obrigatório junto do
-- nome para restaurar qualquer coisa. O hash nunca é lido pelo cliente (a coluna já não
-- está no grant de SELECT acima, ver pegadinha do `revoke select on tabela` no
-- comentário lá de cima) — só as duas funções SECURITY DEFINER abaixo, chamadas via RPC
-- (`client.rpc(...)`, não `.from('jogadores')...`), conseguem lê-lo.
create extension if not exists pgcrypto;

alter table public.jogadores add column if not exists codigo_recuperacao_hash text;

create or replace function public.definir_codigo_recuperacao(p_uuid uuid, p_codigo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.jogadores
  set codigo_recuperacao_hash = crypt(p_codigo, gen_salt('bf'))
  where uuid = p_uuid;
end;
$$;

create or replace function public.restaurar_progresso(p_nome text, p_codigo text)
returns table(uuid uuid, progresso jsonb)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select j.uuid, j.progresso_completo
    from public.jogadores j
    where lower(j.nome) = lower(p_nome)
      and j.codigo_recuperacao_hash is not null
      and j.codigo_recuperacao_hash = crypt(p_codigo, j.codigo_recuperacao_hash);
end;
$$;

revoke all on function public.definir_codigo_recuperacao(uuid, text) from public;
revoke all on function public.restaurar_progresso(text, text) from public;
grant execute on function public.definir_codigo_recuperacao(uuid, text) to anon;
grant execute on function public.restaurar_progresso(text, text) to anon;

-- "Salvar progresso" (telefone+senha, ver `application/usecases/phoneAuth.ts`): usa o
-- provedor padrão de e-mail/senha do Supabase Auth, sem nenhuma tabela nova — o telefone
-- vira um e-mail sintético só internamente (`tel-<dígitos>@<domínio>`, ver `config/auth.ts`).
-- REQUISITO no painel (Authentication → Providers → Email): desligar "Confirm email".
-- Sem isso nenhum cadastro completa, porque nenhum e-mail de confirmação de verdade é
-- enviado para esses endereços sintéticos.
