import { createEmptyProgress } from '@/domain/progress';
import type { Progress } from '@/domain/progress';
import { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH, normalizePhone } from '@/domain/traveler';
import type { LeaderboardPort, ProgressRepository } from '../ports';
import { getTraveler } from './traveler';

export type SaveProgressWithPhoneResult = { ok: true } | { ok: false; reason: string };
export type SimpleResult = { ok: true } | { ok: false; reason: string };

/**
 * "Salvar progresso"/"Entrar": cadastro (ou login, se o telefone já tiver conta) por
 * telefone+senha, sem SMS nem confirmação por e-mail obrigatória (ver
 * `LeaderboardPort.saveProgressWithPhone` e `domain/traveler/credentials.ts`). O e-mail
 * é opcional — só existe pra habilitar "esqueci a senha" depois (ver
 * `requestPasswordReset`); sem ele, a conta usa um e-mail sintético e não há como
 * recuperar a senha se for esquecida.
 *
 * Se a conta já existir e a senha bater, entra nela e adota o progresso salvo lá
 * (`isLogin: true`; ver `LeaderboardPort.saveProgressWithPhone`) — nunca o progresso
 * local de antes de entrar, que pode ser de uma sessão anônima sem nenhuma relação com
 * essa conta. EXCEÇÃO deliberada: se a conta existir mas não vier nada salvo
 * (`restoredProgress` nulo — conta de verdade sem nenhum backup completo ainda, ou uma
 * falha silenciosa ao buscar), mantém o progresso local em vez de zerar a tela: entre
 * "a conta pode estar vazia mesmo" e "posso estar prestes a apagar um progresso de
 * verdade que não consegui ler", a segunda é bem pior — perder o jogo de alguém é o
 * jeito mais rápido de fazer a pessoa desistir. Esse progresso local vira, a partir daí,
 * o que fica salvo na conta (backup imediato). Senão (conta nova de verdade), também
 * preserva o progresso deste aparelho — e faz o primeiro backup na hora (sem esperar o
 * batimento periódico, ~90s), para a conta já nascer com alguma coisa salva na nuvem,
 * caso o aluno feche o app logo em seguida e só volte a jogar (ou tente entrar) de outro
 * aparelho.
 */
export async function saveProgressWithPhone(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort },
  params: { phone: string; password: string; email?: string },
): Promise<SaveProgressWithPhoneResult> {
  const phone = normalizePhone(params.phone);
  if (!phone) return { ok: false, reason: 'Digite um telefone válido, com DDD.' };
  if (!isValidPassword(params.password)) {
    return { ok: false, reason: `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` };
  }
  const email = params.email?.trim();
  if (email && !isValidEmail(email)) {
    return { ok: false, reason: 'Digite um e-mail válido, ou deixe em branco.' };
  }

  // Garante que já existe uma sessão (mesmo anônima) antes de tentar promovê-la — reforço
  // caso o bootstrap silencioso em Layout ainda não tenha rodado/tenha falhado.
  await deps.leaderboard.ensureSignedIn();

  const result = await deps.leaderboard.saveProgressWithPhone(phone, params.password, email || undefined);
  if (!result.ok) return result;

  if (result.isLogin && result.restoredProgress) {
    // Login numa conta que já existia e trouxe progresso salvo: adota o estado da nuvem
    // — nunca o progresso local de antes de entrar, que pode ser de uma sessão anônima
    // sem nenhuma relação com essa conta.
    const restored = result.restoredProgress as Progress;
    deps.repository.save({ ...restored, travelerUuid: result.uid, phoneLinked: true });
  } else {
    // Conta nova, ou login numa conta que existe mas não trouxe nada salvo: preserva o
    // progresso deste aparelho (nunca zera a tela) e faz o backup na hora, pra essa
    // passar a ser a versão salva na conta a partir de agora.
    const progress = deps.repository.load() ?? createEmptyProgress();
    // getTraveler resolve o nome de exibição de verdade, incluindo o padrão único por
    // aparelho quando o viajante nunca escolheu um (ver defaultTravelerName em
    // traveler.ts) — nunca o literal "Viajante" puro, que colide com qualquer outro
    // viajante que também não tenha escolhido nome.
    const nome = getTraveler({ repository: deps.repository }).name;
    const linked = { ...progress, travelerUuid: result.uid, phoneLinked: true };
    deps.repository.save(linked);
    await deps.leaderboard.backupProgress(result.uid, nome, linked);
  }
  return { ok: true };
}

/** Se o viajante já vinculou telefone+senha neste aparelho (esconde a caixa "Salvar progresso"). */
export function hasPhoneLinked(deps: { repository: ProgressRepository }): boolean {
  return Boolean(deps.repository.load()?.phoneLinked);
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
