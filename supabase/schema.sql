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

-- RLS habilitado nas três tabelas.
-- SELECT público nas três (é isso que torna o Hall dos Viajantes público).
-- INSERT público nas três, UPDATE público só em `jogadores` (para permitir renomear),
-- todas com `check (true)`.
--
-- RESSALVA IMPORTANTE (o autor foi avisado e aceitou deliberadamente): não existe
-- Supabase Auth aqui, então qualquer cliente pode, tecnicamente, escrever nas linhas
-- de qualquer `uuid` — a chave anon não tem como provar que o cliente é dono daquele
-- uuid, já que não há `auth.uid()`. Isso foi aceito de propósito, para manter o fluxo
-- simples (sem senha, sem e-mail). Não "conserte" isso adicionando autenticação: está
-- fora de escopo. Ver o mesmo aviso, repetido perto de cada escrita, no código do
-- cliente (`src/infrastructure/leaderboard/SupabaseLeaderboard.ts`), para que ninguém
-- esqueça essa decisão.
