/**
 * Domínio usado para montar o e-mail sintético do cadastro por telefone+senha (ver
 * `domain/traveler/credentials.ts`). É só um rótulo interno para o provedor de e-mail/
 * senha do Supabase Auth aceitar — nunca é enviado nenhum e-mail de verdade para ele,
 * nem precisa ser um domínio de verdade.
 *
 * REQUISITO no painel do Supabase (TODO(autor), se ainda não feito): desligar
 * "Confirm email" em Authentication → Providers → Email. Sem isso, o cadastro fica
 * pendente de confirmação que nunca chega (nenhum e-mail real é enviado).
 *
 * REQUISITO 2 (TODO(autor), verificar): desligar também "Secure email change" na mesma
 * tela. Ligado (padrão do Supabase), trocar o e-mail de uma conta exige confirmação por
 * e-mail — e como os e-mails aqui são sintéticos (`tel-...@viajante.jogodev.app`,
 * ninguém os lê), essa confirmação nunca chega. Isso pode ser o motivo de "salvar
 * progresso"/"entrar" às vezes não recuperar a conta certa quando o telefone já tem
 * cadastro em outro aparelho: a chamada que tenta vincular a conta (`updateUser`) fica
 * pendente sem erro, em vez de acusar e-mail duplicado — ver `SupabaseLeaderboard.
 * saveProgressWithPhone`.
 */
export const PHONE_AUTH_EMAIL_DOMAIN = 'viajante.jogodev.app';
