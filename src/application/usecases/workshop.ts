import { createEmptyProgress, recordWorkshop, type WorkshopResult } from '@/domain/progress';
import {
  checkPublishable,
  outputMatches,
  summarizeResults,
  testsToRun,
  workshopXp,
  type Workshop,
  type WorkshopLang,
  type WorkshopTestResult,
} from '@/domain/workshop';
import type { AnalyticsPort, CodeRunnerPort, LeaderboardPort, MuralRow, ProgressRepository } from '../ports';
import { recordXpGain, syncWeeklyXp } from './league';

export type WorkshopCard = { workshop: Workshop; solved: WorkshopResult | null };

/** As oficinas, com o que o viajante já resolveu. */
export function listWorkshops(deps: { repository: ProgressRepository }, params: { catalog: readonly Workshop[] }): WorkshopCard[] {
  const done = deps.repository.load()?.workshops ?? {};
  return params.catalog.map((workshop) => ({ workshop, solved: done[workshop.id] ?? null }));
}

/** Oficinas ligadas a uma ilha, para aparecerem nela depois do módulo relacionado. */
export function workshopsForTrail(catalog: readonly Workshop[], trailId: string): Workshop[] {
  return catalog.filter((w) => w.after?.trailId === trailId);
}

export function startWorkshop(deps: { analytics: AnalyticsPort }, params: { workshop: Workshop; lang: WorkshopLang }): void {
  deps.analytics.track('workshop_started', { workshop: params.workshop.id, lang: params.lang });
}

export type WorkshopRun = {
  results: WorkshopTestResult[];
  passed: number;
  total: number;
  firstFailure: WorkshopTestResult | null;
};

/**
 * "Testar": roda o código em cada teste (visíveis, surpresa e, se pedido, os do extra),
 * cada um com as suas entradas. Confere só a saída, nunca a forma do código.
 */
export async function runWorkshopTests(
  deps: { runner: CodeRunnerPort; analytics: AnalyticsPort },
  params: { workshop: Workshop; lang: WorkshopLang; code: string; withExtra?: boolean },
): Promise<WorkshopRun> {
  const planned = testsToRun(params.workshop, Boolean(params.withExtra));
  const results: WorkshopTestResult[] = [];
  for (const { test, kind } of planned) {
    const run = await deps.runner.run(params.lang, params.code, test.inputs);
    const passed = !run.timedOut && !run.error && outputMatches(run.output, test.expected);
    results.push({ test, kind, output: run.output, error: run.error, timedOut: run.timedOut, passed });
    // Laço sem fim quase sempre trava em todos os testes: para no primeiro, sem esperar os outros.
    if (run.timedOut) break;
  }
  const summary = { ...summarizeResults(results), total: planned.length };
  deps.analytics.track('workshop_test_run', { workshop: params.workshop.id, passed: summary.passed, total: summary.total });
  return { results, ...summary };
}

/**
 * Oficina resolvida (todos os testes passaram): grava o XP (50 − dicas, mínimo 20; +25 com o
 * extra), que também entra na semana da Liga. Resolver de novo nunca tira XP.
 * Devolve quanto XP a mais esta resolução deu.
 */
export function solveWorkshop(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort; leaderboard: LeaderboardPort },
  params: { workshop: Workshop; lang: WorkshopLang; hintsUsed: number; extra: boolean; now?: Date },
): { xpGained: number; totalXp: number } {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const before = progress.workshops?.[params.workshop.id];
  const xp = workshopXp({ hintsUsed: before ? Math.min(before.hintsUsed, params.hintsUsed) : params.hintsUsed, extra: params.extra || Boolean(before?.extra) });
  const next = recordWorkshop(progress, params.workshop.id, {
    solvedAt: (params.now ?? new Date()).toISOString(),
    langs: [params.lang],
    hintsUsed: params.hintsUsed,
    xp,
    ...(params.extra ? { extra: true } : {}),
  });
  deps.repository.save(next);
  const totalXp = next.workshops?.[params.workshop.id]?.xp ?? xp;
  const xpGained = totalXp - (before?.xp ?? 0);
  if (!before) {
    deps.analytics.track('workshop_solved', { workshop: params.workshop.id, lang: params.lang, hints: params.hintsUsed });
    // Para a Convergência poder contar oficinas da turma (só com identidade e sessão válidas).
    if (next.travelerUuid && !next.needsSignIn) void deps.leaderboard.recordWorkshopSolved(next.travelerUuid, params.workshop.id);
  }
  if (xpGained > 0) {
    recordXpGain(deps, { sourceId: `workshop:${params.workshop.id}`, xp: totalXp, now: params.now });
    syncWeeklyXp(deps, params.now);
  }
  return { xpGained, totalXp };
}

export type PublishResult = { ok: true } | { ok: false; reason: 'not-solved' | 'no-identity' | 'empty' | 'too-long' | 'profanity' | 'offline' };

/**
 * "Publicar no mural": só depois de resolver, só quem tocou no botão, com limite de tamanho e
 * filtro básico de palavrões. O nome e o código ficam visíveis para a turma.
 */
export async function publishToMural(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort; analytics: AnalyticsPort },
  params: { workshop: Workshop; lang: WorkshopLang; code: string },
): Promise<PublishResult> {
  const progress = deps.repository.load() ?? createEmptyProgress();
  if (!progress.workshops?.[params.workshop.id]) return { ok: false, reason: 'not-solved' };
  if (!progress.travelerUuid || progress.needsSignIn) return { ok: false, reason: 'no-identity' };
  const check = checkPublishable(params.code);
  if (!check.ok) return check;
  const ok = await deps.leaderboard.publishSolution(progress.travelerUuid, params.workshop.id, params.lang, params.code.trim());
  if (!ok) return { ok: false, reason: 'offline' };
  deps.analytics.track('workshop_published', { workshop: params.workshop.id, lang: params.lang });
  return { ok: true };
}

export type MuralView = { status: 'locked' } | { status: 'offline' } | { status: 'ok'; entries: MuralRow[]; myUuid: string | null };

/** O mural de uma oficina só abre depois que o viajante a resolve (para não copiar). */
export async function loadMural(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort },
  params: { workshop: Workshop },
): Promise<MuralView> {
  const progress = deps.repository.load() ?? createEmptyProgress();
  if (!progress.workshops?.[params.workshop.id]) return { status: 'locked' };
  let rows: MuralRow[] | null = null;
  try {
    rows = await deps.leaderboard.listMural(params.workshop.id);
  } catch {
    rows = null;
  }
  if (!rows) return { status: 'offline' };
  return { status: 'ok', entries: rows, myUuid: progress.travelerUuid ?? null };
}

/** Dá ou tira a estrela (nunca na própria solução). Devolve se deu certo. */
export async function toggleStar(
  deps: { repository: ProgressRepository; leaderboard: LeaderboardPort; analytics: AnalyticsPort },
  params: { entry: MuralRow; on: boolean },
): Promise<boolean> {
  const uuid = deps.repository.load()?.travelerUuid;
  if (!uuid || uuid === params.entry.uuid) return false;
  const ok = await deps.leaderboard.setStar(uuid, params.entry.id, params.on);
  if (ok && params.on) deps.analytics.track('workshop_starred');
  return ok;
}
