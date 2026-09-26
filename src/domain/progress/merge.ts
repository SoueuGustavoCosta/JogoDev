import { PROGRESS_SCHEMA_VERSION } from './factory';
import { bestQuizAttempt } from './attempt';
import { mergeAnomalies } from './anomalies';
import { mergeFragmentLedgers } from './fragments';
import { mergeQuizBackups } from './quizBackup';
import type { ModuleProgress, Progress, QuizAttemptResult, TrailProgress } from './types';

/**
 * Junta duas cópias do progresso sem nunca perder conquista de nenhuma delas: é a regra
 * usada sempre que o progresso do aparelho encontra a cópia da nuvem (login, troca de
 * identidade, backup, importação). Substituir uma pela outra foi o que apagou progresso
 * de verdade: um login restaurava uma cópia vazia por cima de dias de jogo.
 *
 * - Conquistas somam: módulo, missão, troféu e chefe concluídos em qualquer lado ficam
 *   concluídos; insígnias viram a união (com a data mais antiga).
 * - Quiz: fica a melhor tentativa de cada pergunta, pelo id (acerto > erro; entre acertos,
 *   menos tentativas), então o XP só pode subir. Resultados guardados à parte
 *   (`unmappedQuizResults`) também somam. Chaves antigas (posição) de uma cópia ainda não
 *   migrada são juntadas como estão; `migrateQuizResultKeys` as converte depois.
 * - Sequência: a do dia de acesso mais recente; recorde é o maior já visto.
 * - Perfil (nome, uuid, foto, resumo, código): de `primary`, completando com `secondary`.
 *   Quem chama decide quem é a identidade "dona" (a conta no login; o aparelho no backup).
 * - Preferência de lição (`lessonMode`): de `primary`, completando com `secondary`.
 * - Tela onde parou (`screen`): a mais adiantada das duas cópias.
 * - Anomalias do Dia: união por dia (fica a consertada primeiro). Última lição: a mais recente.
 * - Linha do Tempo: âncoras e ramificação da cópia do dia mais recente; Eco = o mais avançado.
 * - Fragmentos Temporais: união dos lançamentos por id (nada se perde nem se duplica).
 *   Cosméticos equipados: de `primary`, completando com `secondary`.
 */
export function mergeProgress(primary: Progress, secondary: Progress): Progress {
  const trailIds = new Set([...Object.keys(primary.trails ?? {}), ...Object.keys(secondary.trails ?? {})]);
  const trails: Record<string, TrailProgress> = {};
  for (const id of trailIds) {
    trails[id] = mergeTrail(id, primary.trails?.[id], secondary.trails?.[id]);
  }

  const [recent, older] = (primary.ultimoDiaAtivo ?? '') >= (secondary.ultimoDiaAtivo ?? '') ? [primary, secondary] : [secondary, primary];
  const sameDay = recent.ultimoDiaAtivo === older.ultimoDiaAtivo;
  const streakCurrent = sameDay
    ? Math.max(recent.streakCurrent ?? 0, older.streakCurrent ?? 0)
    : (recent.streakCurrent ?? 0);
  const streakBest = Math.max(primary.streakBest ?? 0, secondary.streakBest ?? 0, streakCurrent);

  const merged: Progress = {
    ...secondary,
    ...primary,
    version: PROGRESS_SCHEMA_VERSION,
    trails,
    travelerName: primary.travelerName || secondary.travelerName,
    travelerUuid: primary.travelerUuid || secondary.travelerUuid,
    avatarUrl: primary.avatarUrl || secondary.avatarUrl,
    bio: primary.bio || secondary.bio,
    recoveryCode: primary.recoveryCode || secondary.recoveryCode,
    prologueSeen: Boolean(primary.prologueSeen || secondary.prologueSeen),
    phoneLinked: Boolean(primary.phoneLinked || secondary.phoneLinked),
    lessonMode: primary.lessonMode ?? secondary.lessonMode,
    // Estado da sessão deste aparelho, não do jogo: nunca vem de uma das cópias por mistura.
    needsSignIn: primary.needsSignIn,
    badgesEarned: mergeBadges(primary.badgesEarned, secondary.badgesEarned),
    // TODO(autor): remover junto com `quizBackup` a partir de 2026-10-24.
    quizBackup: mergeQuizBackups(primary.quizBackup, secondary.quizBackup),
    anomalies: mergeAnomalies(primary.anomalies, secondary.anomalies),
    fragmentLedger: mergeFragmentLedgers(primary.fragmentLedger, secondary.fragmentLedger),
    equippedCosmetics: primary.equippedCosmetics ?? secondary.equippedCosmetics,
    lastLesson:
      (primary.lastLesson?.at ?? '') >= (secondary.lastLesson?.at ?? '') ? primary.lastLesson : secondary.lastLesson,
    streakCurrent,
    streakBest,
    ultimoDiaAtivo: recent.ultimoDiaAtivo ?? older.ultimoDiaAtivo,
    // Linha do Tempo (Etapa 8): âncoras e ramificação seguem a cópia do dia mais recente
    // (como a sequência); o Eco nunca recua; dias jogados e ancorados somam.
    anchors: recent.anchors ?? older.anchors,
    lineBrokenOn: recent.lineBrokenOn ?? older.lineBrokenOn,
    ecoEra:
      primary.ecoEra === undefined && secondary.ecoEra === undefined
        ? undefined
        : Math.max(primary.ecoEra ?? 0, secondary.ecoEra ?? 0),
    playedDays: unionDays(primary.playedDays, secondary.playedDays),
    anchoredDays: unionDays(primary.anchoredDays, secondary.anchoredDays),
  };
  // Não grava chaves opcionais vazias que nenhum dos dois lados tinha.
  for (const key of Object.keys(merged) as (keyof Progress)[]) {
    if (merged[key] === undefined) delete merged[key];
  }
  return merged;
}

function mergeTrail(trailId: string, a: TrailProgress | undefined, b: TrailProgress | undefined): TrailProgress {
  if (!a || !b) return (a ?? b)!;
  const moduleIds = new Set([...Object.keys(a.modules ?? {}), ...Object.keys(b.modules ?? {})]);
  const modules: Record<string, ModuleProgress> = {};
  for (const id of moduleIds) modules[id] = mergeModule(id, a.modules?.[id], b.modules?.[id]);

  const missionIds = new Set([...Object.keys(a.missionsCompleted ?? {}), ...Object.keys(b.missionsCompleted ?? {})]);
  const missionsCompleted: Record<string, boolean> = {};
  for (const id of missionIds) missionsCompleted[id] = Boolean(a.missionsCompleted?.[id] || b.missionsCompleted?.[id]);

  const trail: TrailProgress = {
    trailId,
    modules,
    missionsCompleted,
    trophyAwarded: Boolean(a.trophyAwarded || b.trophyAwarded),
  };
  if (a.bossDefeated || b.bossDefeated) trail.bossDefeated = true;
  return trail;
}

function mergeModule(moduleId: string, a: ModuleProgress | undefined, b: ModuleProgress | undefined): ModuleProgress {
  if (!a || !b) return (a ?? b)!;
  const merged: ModuleProgress = {
    moduleId,
    quizResults: mergeQuizResults(a.quizResults, b.quizResults),
    completed: Boolean(a.completed || b.completed),
  };
  if (a.unmappedQuizResults || b.unmappedQuizResults) {
    merged.unmappedQuizResults = mergeQuizResults(a.unmappedQuizResults, b.unmappedQuizResults);
  }
  const screen = Math.max(a.screen ?? -1, b.screen ?? -1);
  if (screen >= 0) merged.screen = screen;
  return merged;
}

/** Por chave (id da pergunta; posição, no formato antigo), a melhor tentativa das duas cópias. */
function mergeQuizResults(
  a: Record<string, QuizAttemptResult> | undefined,
  b: Record<string, QuizAttemptResult> | undefined,
): Record<string, QuizAttemptResult> {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  const out: Record<string, QuizAttemptResult> = {};
  for (const key of keys) out[key] = bestQuizAttempt(a?.[key], b?.[key]);
  return out;
}

function unionDays(a: string[] | undefined, b: string[] | undefined): string[] | undefined {
  if (!a && !b) return undefined;
  return [...new Set([...(a ?? []), ...(b ?? [])])].sort().slice(-14);
}

function mergeBadges(
  a: Record<string, string> | undefined,
  b: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!a && !b) return undefined;
  const out: Record<string, string> = { ...b, ...a };
  for (const [id, date] of Object.entries(b ?? {})) {
    if (a?.[id] && date < a[id]) out[id] = date;
  }
  return out;
}

/** Aceita o que veio da nuvem ou de um código importado só se tiver o formato de progresso. */
export function isProgressShape(value: unknown): value is Progress {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.version === 'number' && typeof candidate.trails === 'object' && candidate.trails !== null;
}
