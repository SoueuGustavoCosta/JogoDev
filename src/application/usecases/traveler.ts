import { createEmptyProgress } from '@/domain/progress';
import type { Progress } from '@/domain/progress';
import type { LeaderboardPort, ProgressRepository } from '../ports';

const MAX_NAME_LENGTH = 20;

/**
 * Nome padrão pra quem não escolhe um: "Viajante" sozinho colide direto com qualquer
 * outro viajante que também não tenha escolhido nome (é o valor padrão de todo mundo) —
 * e `jogadores.nome` é único (índice `jogadores_nome_unique_ci`, sem diferenciar
 * maiúsculas/minúsculas). Descoberto numa auditoria rodando o app de verdade contra o
 * banco: o SEGUNDO viajante a nunca ter escolhido nome já falha (409, chave duplicada)
 * em todo envio pra nuvem — checkInDaily, upsertPlayer (a cada módulo/insígnia/chefe) e
 * o backup do progresso — silenciosamente, porque essas chamadas nunca propagam erro pra
 * tela. Sufixo derivado do próprio `travelerUuid` (já único) resolve isso sem pedir nada
 * a mais do aluno: cada aparelho que nunca nomeou o viajante ganha um nome padrão só
 * seu, nunca precisa ser digitado, e nunca muda (mesmo uuid → mesmo sufixo sempre).
 */
function defaultTravelerName(uuid: string): string {
  return `Viajante ${uuid.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

export function getTraveler(deps: { repository: ProgressRepository }): {
  name: string;
  prologueSeen: boolean;
} {
  const progress = deps.repository.load();
  const uuid = getOrCreateTravelerUuid({ repository: deps.repository });
  return {
    name: progress?.travelerName || defaultTravelerName(uuid),
    prologueSeen: Boolean(progress?.prologueSeen),
  };
}

/** Salva o nome (máx. 20 caracteres; vazio vira o padrão "Viajante ####") e marca o prólogo como visto. */
export function completePrologue(
  deps: { repository: ProgressRepository },
  params: { name: string },
): string {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const uuid = getOrCreateTravelerUuid({ repository: deps.repository });
  const name = params.name.trim().slice(0, MAX_NAME_LENGTH) || defaultTravelerName(uuid);
  deps.repository.save({ ...progress, travelerName: name, prologueSeen: true });
  return name;
}

export function markPrologueSkipped(deps: { repository: ProgressRepository }): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  deps.repository.save({ ...progress, prologueSeen: true });
}

/**
 * Devolve o identificador anônimo do viajante para o Hall dos Viajantes, gerando um
 * com `crypto.randomUUID()` e persistindo-o na primeira vez que for preciso. Ponto
 * único desta lógica: componentes nunca leem/gravam `travelerUuid` diretamente no
 * `ProgressRepository`, sempre por aqui.
 */
export function getOrCreateTravelerUuid(deps: { repository: ProgressRepository }): string {
  const progress = deps.repository.load() ?? createEmptyProgress();
  if (progress.travelerUuid) return progress.travelerUuid;
  const uuid = crypto.randomUUID();
  deps.repository.save({ ...progress, travelerUuid: uuid });
  return uuid;
}

/**
 * Resolve a identidade real do viajante via login anônimo do Supabase Auth e a
 * grava em `Progress.travelerUuid`, para que `getOrCreateTravelerUuid` (síncrono,
 * chamado de muitos lugares) passe a devolver o `auth.uid()` real assim que possível.
 *
 * Quando o uid da sessão já resolvida é DIFERENTE do `travelerUuid` que este aparelho
 * já tinha salvo (não é a primeira vez), busca o progresso salvo nessa conta
 * (`getMyProgress`) antes de trocar o rótulo local — nunca troca "no escuro". Isso
 * cobre o caso de uma sessão de recuperação de senha (link de e-mail) assumir sozinha
 * neste aparelho, fora do fluxo controlado de `saveProgressWithPhone`: sem essa checagem,
 * o progresso local (que podia ser de uma sessão anônima sem nenhuma relação com a
 * conta) virava o rótulo dessa conta e, no próximo backup silencioso, sobrescrevia o
 * progresso de verdade dela. Mesma regra de segurança do login por telefone+senha: se
 * vier progresso salvo, adota; se não vier nada (conta vazia ou falha ao buscar),
 * preserva o progresso local em vez de zerá-lo.
 *
 * Desenhado para nunca bloquear o jogo: é a única ponta assíncrona desta troca de
 * identidade. Chame uma vez por sessão do app (ver `Layout.tsx`), sem aguardar o
 * resultado antes de liberar a tela — antes da primeira resolução (ou se ela nunca
 * chegar a acontecer: rede fora do ar, login anônimo ainda desligado no painel do
 * Supabase, projeto pausado), `getOrCreateTravelerUuid` continua funcionando com o
 * uuid local de sempre (gerado na hora, se for a primeira vez). Falha silenciosa:
 * nunca lança, nunca mostra erro ao aluno.
 */
export async function bootstrapTravelerIdentity(deps: {
  repository: ProgressRepository;
  leaderboard: LeaderboardPort;
}): Promise<void> {
  try {
    const authUid = await deps.leaderboard.ensureSignedIn();
    if (!authUid) return;
    const progress = deps.repository.load() ?? createEmptyProgress();
    if (progress.travelerUuid === authUid) return;

    if (!progress.travelerUuid) {
      // Primeira vez neste aparelho: não há nada local a proteger, só rotular.
      deps.repository.save({ ...progress, travelerUuid: authUid });
      return;
    }

    const restored = (await deps.leaderboard.getMyProgress()) as Progress | null;
    if (restored) {
      deps.repository.save({ ...restored, travelerUuid: authUid });
    } else {
      deps.repository.save({ ...progress, travelerUuid: authUid });
    }
  } catch {
    // Falha silenciosa: o jogo continua com o uuid local (gerado sob demanda).
  }
}

/**
 * "Sair": encerra a sessão do Supabase Auth deste aparelho e apaga o progresso local, para
 * outra pessoa poder usar o mesmo aparelho/navegador com a própria conta em seguida.
 *
 * Antes de mais nada, espera um backup final do progresso local na nuvem: o batimento
 * periódico (`backupProgress`, a cada ~90s) pode não ter alcançado ainda a última lição
 * concluída, e este método está prestes a apagar esse progresso deste aparelho — sem o
 * backup, essa última parte se perderia mesmo a conta continuando salva.
 *
 * Sempre limpa o progresso local, mesmo se `leaderboard.signOut()` falhar silenciosamente
 * (rede fora do ar etc.) — a conta que estava salva na nuvem continua lá, intacta (com o
 * backup final, o mais atualizado possível); só o que fica neste aparelho é apagado. Quem
 * chama deve recarregar o app logo em seguida (`window.location.reload()`), para todo o
 * estado em memória (nome em cache, sessão anônima antiga etc.) ser recriado do zero.
 */
export async function signOutTraveler(deps: { repository: ProgressRepository; leaderboard: LeaderboardPort }): Promise<void> {
  try {
    const progress = deps.repository.load();
    if (progress) {
      const uuid = getOrCreateTravelerUuid({ repository: deps.repository });
      const name = getTraveler({ repository: deps.repository }).name;
      await deps.leaderboard.backupProgress(uuid, name, progress);
    }
    await deps.leaderboard.signOut();
  } finally {
    deps.repository.clear();
  }
}
