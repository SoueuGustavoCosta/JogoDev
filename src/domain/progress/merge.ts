import { PROGRESS_SCHEMA_VERSION } from './factory';
import type { ModuleProgress, Progress, QuizAttemptResult, TrailProgress } from './types';

/**
 * Junta duas cópias do progresso sem nunca perder conquista de nenhuma delas: é a regra
 * usada sempre que o progresso do aparelho encontra a cópia da nuvem (login, troca de
 * identidade, backup, importação). Substituir uma pela outra foi o que apagou progresso
 * de verdade: um login restaurava uma cópia vazia por cima de dias de jogo.
 *
 * - Conquistas somam: módulo, missão, troféu e chefe concluídos em qualquer lado ficam
 *   concluídos; insígnias viram a união (com a data mais antiga).
 * - Quiz: fica a melhor tentativa de cada pergunta (acerto > erro; entre acertos, menos
 *   tentativas), então o XP só pode subir.
 * - Sequência: a do dia de acesso mais recente; recorde é o maior já visto.
 * - Perfil (nome, uuid, foto, resumo, código): de `primary`, completando com `secondary`.
 *   Quem chama decide quem é a identidade "dona" (a conta no login; o aparelho no backup).
 * - Preferência de lição (`lessonMode`): de `primary`, completando com `secondary`.
 * - Tela onde parou (`screen`): a mais adiantada das duas cópias.
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
    streakCurrent,
    streakBest,
    ultimoDiaAtivo: recent.ultimoDiaAtivo ?? older.ultimoDiaAtivo,
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
  const indexes = new Set([...Object.keys(a.quizResults ?? {}), ...Object.keys(b.quizResults ?? {})].map(Number));
  const quizResults: Record<number, QuizAttemptResult> = {};
  for (const i of indexes) quizResults[i] = bestAttempt(a.quizResults?.[i], b.quizResults?.[i]);
  const merged: ModuleProgress = { moduleId, quizResults, completed: Boolean(a.completed || b.completed) };
  const screen = Math.max(a.screen ?? -1, b.screen ?? -1);
  if (screen >= 0) merged.screen = screen;
  return merged;
}

function bestAttempt(a: QuizAttemptResult | undefined, b: QuizAttemptResult | undefined): QuizAttemptResult {
  if (!a || !b) return (a ?? b)!;
  if (a.correct !== b.correct) return a.correct ? a : b;
  if (a.correct) return a.triesUsed <= b.triesUsed ? a : b;
  return a.triesUsed >= b.triesUsed ? a : b;
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
