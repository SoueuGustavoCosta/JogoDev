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

/**
 * REQUISITO 3 (TODO(autor), verificar — provável causa de "clico no link de redefinir
 * senha e dá erro"): em Authentication → URL Configuration no painel do Supabase, a URL
 * de destino do link (`SupabaseLeaderboard.requestPasswordReset` manda
 * `redirectTo: <origem atual>/redefinir-senha`, ex.: `https://jogo-dev-rho.vercel.app/
 * redefinir-senha`) precisa estar na lista "Redirect URLs". Se não estiver, o Supabase
 * recusa o redirecionamento depois de validar o link e mostra a própria página de erro
 * dele — antes mesmo do app (rota /redefinir-senha, ver ResetPasswordPage.tsx) carregar.
 * Adicione a URL exata de produção (ou um curinga, ex.: `https://jogo-dev-rho.vercel.app/**`,
 * se quiser cobrir também os previews do Vercel) nessa lista.
 */
