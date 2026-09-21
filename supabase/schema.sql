-- Esquema já aplicado no projeto Supabase remoto (haukhnpiaczkkwncnmlu, sa-east-1).
-- Este arquivo é só documentação viva do que está no ar: nada aqui é executado
-- automaticamente pelo app nem pelo CI. Se o esquema remoto mudar, atualize este
-- arquivo para que ele continue refletindo a realidade.

create table public.jogadores (
  uuid uuid primary key,
  nome text not null check (char_length(nome) between 1 and 24),
  criado_em timestamptz not null default now()
);

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
