import { createEmptyProgress } from '@/domain/progress';
import {
  isValidEmail,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
  normalizePhone,
} from '@/domain/traveler';
import type { LeaderboardPort, ProgressRepository, SignInIdentifier } from '../ports';
import { adoptAccountProgress, syncProgressSafely } from './progressSync';

export type SimpleResult = { ok: true } | { ok: false; reason: string };
export type SignUpWithPhoneResult = { ok: true } | { ok: false; reason: string; exists?: boolean };

/**
 * "Criar conta" (rota `/cadastro`): quem já está jogando anônimo cadastra telefone+senha
 * e continua com o mesmo progresso — a sessão anônima vira permanente, com o mesmo uid,
 * então nada precisa ser copiado nem juntado. E-mail opcional, só pra "esqueci a senha".
 *
 * Nunca entra numa conta que já existe (isso é "Entrar", ver `signInWithPhone`): foi a
 * caixa única "Salvar ou entrar" que misturava as duas coisas e acabava gravando por
 * cima de dados salvos. Se o telefone já tiver conta, só avisa (`exists`).
 *
 * Faz o primeiro backup na hora, pra conta já nascer com o progresso salvo na nuvem.
 */
export async function signUpWithPhone(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort },
  params: { phone: string; password: string; email?: string },
): Promise<SignUpWithPhoneResult> {
  const phone = normalizePhone(params.phone);
  if (!phone) return { ok: false, reason: 'Digite um telefone válido, com DDD.' };
  if (!isValidPassword(params.password)) {
    return {
      ok: false,
      reason: `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }
  const email = params.email?.trim();
  if (email && !isValidEmail(email)) {
    return { ok: false, reason: 'Digite um e-mail válido, ou deixe em branco.' };
  }
  const local = deps.repository.load();
  if (local?.phoneLinked || local?.needsSignIn) {
    return {
      ok: false,
      reason: 'Este aparelho já está numa conta. Saia dela antes de criar outra.',
    };
  }

  // Garante a sessão anônima que vai ser promovida (o bootstrap do Layout pode não ter rodado).
  await deps.leaderboard.ensureSignedIn();

  const result = await deps.leaderboard.signUpWithPhone(phone, params.password, email || undefined);
  if (!result.ok) return result;

  const progress = deps.repository.load() ?? createEmptyProgress();
  deps.repository.save({ ...progress, travelerUuid: result.uid, phoneLinked: true });
  await syncProgressSafely(deps);
  return { ok: true };
}

/**
 * "Entrar" (rota `/entrar`): telefone (ou o e-mail do cadastro) + senha.
 *
 * O que acontece com o progresso deste aparelho:
 * - se ele era de quem estava jogando anônimo (ou já era desta mesma conta), junta com o
 *   da conta (`adoptAccountProgress`): nenhuma conquista se perde de nenhum dos lados, e
 *   o perfil (nome, foto) vem da conta;
 * - se ele era de OUTRA conta (sessão perdida, ver `Progress.needsSignIn`), não mistura:
 *   o aparelho passa a mostrar só a conta que entrou. O da outra conta está salvo na
 *   nuvem dela.
 *
 * Depois sobe a união na hora, sempre juntando com a nuvem antes (`syncProgressSafely`).
 */
export async function signInWithPhone(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort },
  params: { login: string; password: string },
): Promise<SimpleResult> {
  const login = params.login.trim();
  let identifier: SignInIdentifier;
  if (login.includes('@')) {
    if (!isValidEmail(login)) return { ok: false, reason: 'Digite um e-mail válido.' };
    identifier = { email: login };
  } else {
    const phone = normalizePhone(login);
    if (!phone)
      return { ok: false, reason: 'Digite um telefone válido, com DDD, ou o e-mail do cadastro.' };
    identifier = { phone };
  }
  if (!params.password) return { ok: false, reason: 'Digite sua senha.' };

  const result = await deps.leaderboard.signInWithPassword(identifier, params.password);
  if (!result.ok) return result;

  const local = deps.repository.load();
  const localIsOtherAccount =
    local !== null && Boolean(local.phoneLinked || local.needsSignIn) && local.travelerUuid !== result.uid;
  if (localIsOtherAccount) deps.repository.clear();

  adoptAccountProgress(deps, { uuid: result.uid, cloud: result.progress, extra: { phoneLinked: true, needsSignIn: undefined } });
  await syncProgressSafely(deps);
  return { ok: true };
}

/** Se o viajante já vinculou telefone+senha neste aparelho (esconde o botão "Criar conta"). */
export function hasPhoneLinked(deps: { repository: ProgressRepository }): boolean {
  return Boolean(deps.repository.load()?.phoneLinked);
}

/** Se a sessão da conta deste aparelho se perdeu e a pessoa precisa entrar de novo. */
export function needsSignInAgain(deps: { repository: ProgressRepository }): boolean {
  return Boolean(deps.repository.load()?.needsSignIn);
}

/**
 * Pede o e-mail de redefinição de senha (ver `LeaderboardPort.requestPasswordReset`).
 * Só funciona pra contas que informaram um e-mail de verdade no cadastro — mas a
 * resposta nunca revela se a conta existe ou tem e-mail cadastrado (o próprio Supabase
 * já não revela isso), então a tela sempre mostra a mesma mensagem de sucesso.
 */
export async function requestPasswordReset(
  deps: { leaderboard: LeaderboardPort },
  params: { email: string },
): Promise<SimpleResult> {
  const email = params.email.trim();
  if (!isValidEmail(email)) return { ok: false, reason: 'Digite um e-mail válido.' };
  return deps.leaderboard.requestPasswordReset(email);
}

/** Define a nova senha depois de abrir o link do e-mail de `requestPasswordReset`. */
export async function updatePassword(
  deps: { leaderboard: LeaderboardPort },
  params: { password: string },
): Promise<SimpleResult> {
  if (!isValidPassword(params.password)) {
    return { ok: false, reason: `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` };
  }
  return deps.leaderboard.updatePassword(params.password);
}
