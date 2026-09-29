import type { Trail } from '../trail/types';
import { bestQuizAttempt } from './attempt';
import { XP_MODULE_COMPLETION_BONUS } from './xp';
import { recordBonusXp } from './bonusXp';
import { isLegacyQuizKey } from './quizIds';
import { isTrailCompleted } from './unlock';
import type { ModuleProgress, Progress, QuizAttemptResult, TrailProgress } from './types';

/**
 * Um módulo que mudou de trilha (Etapa 14A: a Era dos Dados virou ilha + 2 luas). O id do
 * módulo nunca muda; só a trilha onde o progresso dele fica guardado.
 *
 * `fold`: o módulo foi fundido em outro (`toModule`, da mesma ou de outra trilha). As
 * perguntas dele passam a viver no módulo que o absorveu com o id `quizIdPrefix + id antigo`
 * (dois módulos fundidos tinham `q1`, e ids não se repetem num módulo). `legacyQuizOrder` é
 * a ordem das perguntas do módulo antigo, para converter resultados ainda guardados pela
 * posição (formato de antes da Etapa 3.5).
 */
export type ModuleRelocation = {
  fromTrail: string;
  toTrail: string;
  moduleId: string;
  fold?: { toModule: string; quizIdPrefix: string; legacyQuizOrder: readonly string[] };
};

/** Fonte do XP que compensa a fusão (ver `relocateModules`). */
export function foldXpSourceId(r: ModuleRelocation): string {
  return `fusao:${r.fromTrail}/${r.moduleId}`;
}

/**
 * Leva o progresso dos módulos que mudaram de trilha para a trilha nova. Roda em toda
 * leitura e gravação (ver `withQuizIdMigration`): o que ainda estiver no lugar antigo
 * (progresso local, cópia da nuvem, código importado, ou uma aba com o app antigo que
 * gravou de novo no lugar antigo) é juntado ao lugar novo e sai do antigo. Sem nada no
 * lugar antigo, devolve o mesmo objeto: rodar de novo não muda nada.
 *
 * - Junta com o que já existir no lugar novo pela mesma regra do merge: fica a melhor
 *   tentativa de cada pergunta, concluído em qualquer lado fica concluído.
 * - Módulo fundido conta como concluído se qualquer um dos dois estava concluído. Quem
 *   tinha concluído os dois perderia o bônus de conclusão de um deles; esses 150 XP
 *   ficam guardados como XP extra (`xpBonus`), então o XP total não muda.
 * - Última lição aberta segue o módulo (mesmo sem progresso nele).
 * - Trilhas mexidas que ficaram completas ganham o troféu (sem festa): quem já tinha
 *   feito tudo não perde o troféu nas luas, e quem já fez os 10 da ilha principal o recebe.
 * - Missões, chefe, insígnias e o resto do progresso não mudam.
 */
export function relocateModules(
  progress: Progress,
  relocations: readonly ModuleRelocation[],
  trails: readonly Trail[],
): Progress {
  const pending = relocations.filter((r) => progress.trails?.[r.fromTrail]?.modules?.[r.moduleId]);
  const last = progress.lastLesson;
  const lastMoved = last && relocations.find((r) => r.fromTrail === last.trailId && r.moduleId === last.moduleId);
  if (pending.length === 0 && !lastMoved) return progress;

  let next: Progress = { ...progress, trails: { ...progress.trails } };
  if (last && lastMoved) {
    next.lastLesson = { ...last, trailId: lastMoved.toTrail, moduleId: lastMoved.fold?.toModule ?? lastMoved.moduleId };
  }
  const touched = new Set<string>();
  for (const r of pending) {
    const source = next.trails[r.fromTrail]!;
    const moved = source.modules[r.moduleId]!;
    const sourceModules = { ...source.modules };
    delete sourceModules[r.moduleId];
    next.trails[r.fromTrail] = { ...source, modules: sourceModules };

    const target: TrailProgress = next.trails[r.toTrail] ?? {
      trailId: r.toTrail,
      modules: {},
      missionsCompleted: {},
      trophyAwarded: false,
    };
    const toModule = r.fold?.toModule ?? r.moduleId;
    const existing = target.modules?.[toModule];
    const incoming = r.fold ? foldedModule(moved, r.fold, toModule) : moved;
    next.trails[r.toTrail] = {
      ...target,
      modules: { ...target.modules, [toModule]: existing ? joinModules(existing, incoming, !r.fold) : incoming },
    };
    touched.add(r.fromTrail).add(r.toTrail);

    if (r.fold && moved.completed && existing?.completed) {
      next = recordBonusXp(next, foldXpSourceId(r), XP_MODULE_COMPLETION_BONUS);
    }
  }

  for (const trailId of touched) {
    const tp = next.trails[trailId];
    const trail = trails.find((t) => t.id === trailId);
    if (tp && trail && !tp.trophyAwarded && isTrailCompleted(trail, tp)) next.trails[trailId] = { ...tp, trophyAwarded: true };
  }
  return next;
}

/** O módulo fundido, já com os ids das perguntas no módulo que o absorveu. */
function foldedModule(module: ModuleProgress, fold: NonNullable<ModuleRelocation['fold']>, toModule: string): ModuleProgress {
  const quizResults: Record<string, QuizAttemptResult> = {};
  const unmapped: Record<string, QuizAttemptResult> = {};
  for (const [key, result] of Object.entries(module.quizResults ?? {})) {
    if (!result) continue;
    const oldId = isLegacyQuizKey(key) ? fold.legacyQuizOrder[Number(key)] : key;
    // Posição sem pergunta: guardada intacta, com o módulo de origem para não misturar posições.
    if (!oldId) unmapped[`${module.moduleId}:${key}`] = result;
    else quizResults[fold.quizIdPrefix + oldId] = bestQuizAttempt(quizResults[fold.quizIdPrefix + oldId], result);
  }
  for (const [key, result] of Object.entries(module.unmappedQuizResults ?? {})) {
    if (result) unmapped[`${module.moduleId}:${key}`] = result;
  }
  // A tela onde parou (`screen`) era do módulo antigo: não vale no módulo que o absorveu.
  const folded: ModuleProgress = { moduleId: toModule, quizResults, completed: Boolean(module.completed) };
  if (Object.keys(unmapped).length > 0) folded.unmappedQuizResults = unmapped;
  return folded;
}

function joinModules(a: ModuleProgress, b: ModuleProgress, keepScreen: boolean): ModuleProgress {
  const joined: ModuleProgress = {
    moduleId: a.moduleId,
    quizResults: joinResults(a.quizResults, b.quizResults),
    completed: Boolean(a.completed || b.completed),
  };
  if (a.unmappedQuizResults || b.unmappedQuizResults) {
    joined.unmappedQuizResults = joinResults(a.unmappedQuizResults, b.unmappedQuizResults);
  }
  const screen = keepScreen ? Math.max(a.screen ?? -1, b.screen ?? -1) : (a.screen ?? -1);
  if (screen >= 0) joined.screen = screen;
  return joined;
}

function joinResults(
  a: Record<string, QuizAttemptResult> | undefined,
  b: Record<string, QuizAttemptResult> | undefined,
): Record<string, QuizAttemptResult> {
  const out: Record<string, QuizAttemptResult> = {};
  for (const key of new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])) out[key] = bestQuizAttempt(a?.[key], b?.[key]);
  return out;
}
