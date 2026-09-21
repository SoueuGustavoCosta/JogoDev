/**
 * Domínio usado para montar o e-mail sintético do cadastro por telefone+senha (ver
 * `domain/traveler/credentials.ts`). É só um rótulo interno para o provedor de e-mail/
 * senha do Supabase Auth aceitar — nunca é enviado nenhum e-mail de verdade para ele,
 * nem precisa ser um domínio de verdade.
 *
 * REQUISITO no painel do Supabase (TODO(autor), se ainda não feito): desligar
 * "Confirm email" em Authentication → Providers → Email. Sem isso, o cadastro fica
 * pendente de confirmação que nunca chega (nenhum e-mail real é enviado).
 */
export const PHONE_AUTH_EMAIL_DOMAIN = 'viajante.jogodev.app';
