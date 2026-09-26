-- Etapa 11 (Convergência: meta coletiva da turma). PARA O AUTOR APLICAR no SQL Editor do
-- Supabase (projeto haukhnpiaczkkwncnmlu). O Claude Code NÃO rodou nada no banco.
--
-- DEPENDE de supabase/2026-09-26_anomalias_resolvidas.sql (Etapa 7): aplique aquele antes.
--
-- Conta quantas Anomalias do Dia a turma toda consertou entre dois dias (inclusive). Só o
-- número: sem nomes nem uuids. Conferido contra o banco real em 2026-09-26 (só leitura):
-- ainda não existe função com este nome.
--
-- Sem isto aplicado, o card da Convergência aparece sem a contagem da turma ("contagem
-- indisponível") e ninguém ganha o prêmio até a função existir.

create or replace function public.contar_anomalias_periodo(p_inicio date, p_fim date)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  -- No máximo 1 ano de janela, para a função nunca varrer a tabela inteira sem motivo.
  select case
    when p_inicio is null or p_fim is null or p_fim < p_inicio or p_fim - p_inicio > 366 then 0
    else (select count(*)::integer from public.anomalias_resolvidas where dia between p_inicio and p_fim)
  end;
$$;

revoke all on function public.contar_anomalias_periodo(date, date) from public;
grant execute on function public.contar_anomalias_periodo(date, date) to anon, authenticated;

-- Conferência depois de aplicar:
--   select public.contar_anomalias_periodo('2026-10-01', '2026-10-31');
