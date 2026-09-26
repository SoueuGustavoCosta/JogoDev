import { bestQuizAttempt } from './attempt';
import { isLegacyQuizKey } from './quizIds';
import type { ModuleProgress, Progress, QuizAttemptResult, QuizBackup, TrailProgress } from './types';

/*
 * Cópia de segurança da transição da Etapa 3.5 (decisão do autor, 2026-09-26): os
 * resultados por id são gravados também na raiz do progresso (`quizBackup`), onde o merge
 * do app antigo não mexe. Ao ler e ao gravar, o app novo devolve aos módulos o que só
 * existir na cópia e refaz a cópia a partir dos módulos.
 * TODO(autor): remover a partir de 2026-10-24 (este arquivo, o campo `quizBackup` e as
 * chamadas em quizIdMigration.ts e merge.ts).
 */

/** Devolve aos módulos os resultados que só existem na cópia (fica a melhor tentativa). */
export function restoreFromQuizBackup(progress: Progress): Progress {
  const backup = progress.quizBackup;
  if (!backup) return progress;
  let trails: Record<string, TrailProgress> | null = null;
  for (const [trailId, modulesBackup] of Object.entries(backup)) {
    const trail: TrailProgress = (trails ?? progress.trails ?? {})[trailId] ?? {
      trailId,
      modules: {},
      missionsCompleted: {},
      trophyAwarded: false,
    };
    let modules: Record<string, ModuleProgress> | null = null;
    for (const [moduleId, results] of Object.entries(modulesBackup ?? {})) {
      const module: ModuleProgress = trail.modules?.[moduleId] ?? { moduleId, quizResults: {}, completed: false };
      const current = module.quizResults ?? {};
      const missing = Object.entries(results ?? {}).filter(
        ([id, result]) => !isLegacyQuizKey(id) && result && bestQuizAttempt(current[id], result) !== current[id],
      );
      if (missing.length === 0) continue;
      const quizResults = { ...current };
      for (const [id, result] of missing) quizResults[id] = bestQuizAttempt(current[id], result);
      modules ??= { ...trail.modules };
      modules[moduleId] = { ...module, quizResults };
    }
    if (!modules) continue;
    trails ??= { ...progress.trails };
    trails[trailId] = { ...trail, modules };
  }
  return trails ? { ...progress, trails } : progress;
}

/** Refaz a cópia a partir dos módulos (só chaves por id). Sem nenhum resultado, sem cópia. */
export function withQuizBackup(progress: Progress): Progress {
  const backup: QuizBackup = {};
  for (const [trailId, trail] of Object.entries(progress.trails ?? {})) {
    for (const [moduleId, module] of Object.entries(trail?.modules ?? {})) {
      const byId = Object.entries(module?.quizResults ?? {}).filter(([key]) => !isLegacyQuizKey(key));
      if (byId.length === 0) continue;
      (backup[trailId] ??= {})[moduleId] = Object.fromEntries(byId);
    }
  }
  const next: Progress = { ...progress, quizBackup: backup };
  if (Object.keys(backup).length === 0) delete next.quizBackup;
  return next;
}

/** União de duas cópias (usada pelo `mergeProgress`), com a melhor tentativa de cada pergunta. */
export function mergeQuizBackups(a: QuizBackup | undefined, b: QuizBackup | undefined): QuizBackup | undefined {
  if (!a || !b) return a ?? b;
  const out: QuizBackup = {};
  for (const trailId of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const ta = a[trailId] ?? {};
    const tb = b[trailId] ?? {};
    out[trailId] = {};
    for (const moduleId of new Set([...Object.keys(ta), ...Object.keys(tb)])) {
      const ra: Record<string, QuizAttemptResult> = ta[moduleId] ?? {};
      const rb: Record<string, QuizAttemptResult> = tb[moduleId] ?? {};
      const results: Record<string, QuizAttemptResult> = {};
      for (const id of new Set([...Object.keys(ra), ...Object.keys(rb)])) results[id] = bestQuizAttempt(ra[id], rb[id]);
      out[trailId][moduleId] = results;
    }
  }
  return out;
}
