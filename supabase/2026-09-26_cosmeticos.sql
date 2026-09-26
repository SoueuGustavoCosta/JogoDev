-- Etapa 9 (Fragmentos Temporais e cosméticos): itens equipados no avatar, salvos junto
-- do avatar na tabela `jogadores`. PARA O AUTOR APLICAR no SQL Editor do Supabase; o app
-- não roda nada no banco. Até aplicar, o app funciona igual: o visual fica salvo só no
-- progresso local e os avatares dos outros aparecem sem cosméticos.
--
-- Conferido contra o banco real (information_schema, só leitura, 2026-09-26):
--   * `jogadores` ainda não tem a coluna `cosmeticos`;
--   * UPDATE em `jogadores` é concedido na tabela inteira para anon/authenticated, então
--     a coluna nova já fica gravável, e a política "jogadores: atualizar so a propria
--     linha" (auth.uid() = uuid) continua valendo: cada um só muda o próprio avatar;
--   * SELECT em `jogadores` é concedido COLUNA POR COLUNA (para proteger
--     `progresso_completo` e o hash do código): a coluna nova precisa do grant abaixo
--     para aparecer no Hall e na presença.
--
-- O conteúdo é só encaixe -> id do item, ex.: {"frame":"moldura-neon","hair":"cabelo-coque"}.
-- Os ◆ e as compras NÃO vão para cá: ficam no histórico do progresso (backup completo).

alter table public.jogadores add column if not exists cosmeticos jsonb;

-- Objeto pequeno e nada além disso (o app manda no máximo 4 encaixes).
alter table public.jogadores drop constraint if exists jogadores_cosmeticos_formato;
alter table public.jogadores add constraint jogadores_cosmeticos_formato
  check (cosmeticos is null or (jsonb_typeof(cosmeticos) = 'object' and pg_column_size(cosmeticos) <= 512));

grant select (cosmeticos) on public.jogadores to anon, authenticated;
