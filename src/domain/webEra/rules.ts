import type { Progress } from '../progress/types';
import type {
  GemSpec,
  PortfolioPiece,
  WebEraProgress,
  WebEraTrail,
  WebMoon,
  WebPortfolio,
  WebStageKind,
  WebStageResult,
} from './types';

/** XP (protótipo): +10 por missão, e o bônus da etapa ao vencê-la. */
export const WEB_XP_PER_MISSION = 10;
export const WEB_XP_BONUS: Record<WebStageKind, number> = {
  trail: 50,
  boss: 200,
  moon: 40,
  moonboss: 150,
};
/** Corações por tentativa de etapa. */
export const WEB_HEARTS = 3;
/** Id da etapa do chefe da era. */
export const ECO_STAGE_ID = 'eco';
/** Chave do Evento Nexus da Era da Web em `Progress.nexusSeen` (a cena toca uma vez). */
export const WEB_NEXUS_KEY = 'web';

export function moonBossStageId(moonId: string): string {
  return `${moonId}-chefe`;
}

/** XP de uma etapa vencida: sai do conteúdo (número de missões), nunca escrito à mão. */
export function webStageXp(kind: WebStageKind, missions: number): number {
  return missions * WEB_XP_PER_MISSION + WEB_XP_BONUS[kind];
}

const EMPTY: WebEraProgress = { done: {} };

export function webEraOf(progress: Progress | null | undefined): WebEraProgress {
  return progress?.webEra ?? EMPTY;
}

export function isWebStageDone(web: WebEraProgress, stageId: string): boolean {
  return Boolean(web.done?.[stageId]);
}

export function eraTrailsDone(trails: readonly WebEraTrail[], web: WebEraProgress): number {
  return trails.filter((t) => isWebStageDone(web, t.id)).length;
}

/** As trilhas da era abrem em sequência: a primeira sempre, as outras depois da anterior. */
export function isEraTrailUnlocked(trails: readonly WebEraTrail[], index: number, web: WebEraProgress): boolean {
  if (index <= 0) return true;
  const previous = trails[index - 1];
  return Boolean(previous) && isWebStageDone(web, previous!.id);
}

/** O Eco só aparece depois das 10 trilhas. */
export function isEcoUnlocked(trails: readonly WebEraTrail[], web: WebEraProgress): boolean {
  return eraTrailsDone(trails, web) === trails.length;
}

export function isEcoDefeated(web: WebEraProgress): boolean {
  return isWebStageDone(web, ECO_STAGE_ID);
}

/** As luas nascem da vitória sobre o Eco. */
export function areMoonsOpen(web: WebEraProgress): boolean {
  return isEcoDefeated(web);
}

export function isMoonTrailUnlocked(moon: WebMoon, index: number, web: WebEraProgress): boolean {
  if (!areMoonsOpen(web)) return false;
  if (index <= 0) return true;
  const previous = moon.trails[index - 1];
  return Boolean(previous) && isWebStageDone(web, previous!.id);
}

export function moonTrailsDone(moon: WebMoon, web: WebEraProgress): number {
  return moon.trails.filter((t) => isWebStageDone(web, t.id)).length;
}

export function isMoonBossUnlocked(moon: WebMoon, web: WebEraProgress): boolean {
  return areMoonsOpen(web) && moonTrailsDone(moon, web) === moon.trails.length;
}

export function isMoonDone(moon: WebMoon, web: WebEraProgress): boolean {
  return isWebStageDone(web, moonBossStageId(moon.id));
}

/** Com as 3 luas vencidas, dispara o Evento Nexus e as Ramificações abrem. */
export function areAllMoonsDone(moons: readonly WebMoon[], web: WebEraProgress): boolean {
  return moons.length > 0 && moons.every((m) => isMoonDone(m, web));
}

/** Peças do portfólio já liberadas (uma por trilha da era concluída). */
export function unlockedPieces(trails: readonly WebEraTrail[], web: WebEraProgress): Set<PortfolioPiece> {
  return new Set(trails.filter((t) => isWebStageDone(web, t.id)).map((t) => t.piece));
}

/** Quanto do portfólio já foi restaurado (0–100). */
export function portfolioPercent(trails: readonly WebEraTrail[], web: WebEraProgress): number {
  if (trails.length === 0) return 0;
  return Math.round((eraTrailsDone(trails, web) / trails.length) * 100);
}

/** XP ganho na Era da Web (soma do que cada etapa vencida guardou). */
export function webEraXpTotal(progress: Progress): number {
  return Object.values(progress.webEra?.done ?? {}).reduce((sum, r) => sum + (r?.xp ?? 0), 0);
}

/**
 * Registra uma etapa vencida. Vencer de novo nunca tira XP nem muda a data da primeira
 * vitória. Devolve o mesmo objeto quando nada muda.
 */
export function recordWebStage(progress: Progress, stageId: string, result: WebStageResult): Progress {
  const web = webEraOf(progress);
  const before = web.done?.[stageId];
  const merged = before ? mergeStage(before, result) : result;
  if (before && before.at === merged.at && before.xp === merged.xp) return progress;
  return { ...progress, webEra: { ...web, done: { ...web.done, [stageId]: merged } } };
}

/** Junta o que o viajante escreveu numa missão ao portfólio salvo. */
export function saveWebPortfolio(progress: Progress, patch: Partial<WebPortfolio>, at: string): Progress {
  const clean = cleanPortfolio(patch);
  if (Object.keys(clean).length === 0) return progress;
  const web = webEraOf(progress);
  return { ...progress, webEra: { ...web, portfolio: { ...web.portfolio, ...clean }, portfolioAt: at } };
}

export function markWebIntroSeen(progress: Progress): Progress {
  const web = webEraOf(progress);
  if (web.introSeen) return progress;
  return { ...progress, webEra: { ...web, introSeen: true } };
}

const MAX_TEXT = 140;
const MAX_LINKS = 4;

/** Limita tamanhos (o portfólio sobe para a nuvem com o progresso) e descarta vazios. */
function cleanPortfolio(patch: Partial<WebPortfolio>): Partial<WebPortfolio> {
  const out: Partial<WebPortfolio> = {};
  for (const key of ['name', 'bio', 'title', 'color'] as const) {
    const v = patch[key];
    if (typeof v === 'string' && v.trim()) out[key] = v.trim().slice(0, MAX_TEXT);
  }
  if (Array.isArray(patch.links)) {
    const links = patch.links
      .filter((l) => l && typeof l.href === 'string' && /^https?:\/\//i.test(l.href))
      .slice(0, MAX_LINKS)
      .map((l) => ({ href: l.href.slice(0, 300), t: (l.t || l.href).trim().slice(0, 60) }));
    if (links.length) out.links = links;
  }
  return out;
}

function mergeStage(a: WebStageResult, b: WebStageResult): WebStageResult {
  return { at: a.at <= b.at ? a.at : b.at, xp: Math.max(a.xp, b.xp) };
}

/**
 * Merge entre aparelhos: etapas somam (fica a primeira vitória, com o maior XP), a intro
 * vista fica vista, e no portfólio vale a cópia editada por último, campo a campo.
 */
export function mergeWebEra(a: WebEraProgress | undefined, b: WebEraProgress | undefined): WebEraProgress | undefined {
  if (!a || !b) return a ?? b;
  const done: Record<string, WebStageResult> = { ...b.done };
  for (const [id, r] of Object.entries(a.done ?? {})) done[id] = done[id] ? mergeStage(r, done[id]!) : r;
  const [newer, older] = (a.portfolioAt ?? '') >= (b.portfolioAt ?? '') ? [a, b] : [b, a];
  const merged: WebEraProgress = { done };
  // Campo a campo: o que só uma cópia tem (ex.: a bio escrita no outro aparelho) fica.
  if (newer.portfolio || older.portfolio) merged.portfolio = { ...older.portfolio, ...newer.portfolio };
  const portfolioAt = newer.portfolioAt ?? older.portfolioAt;
  if (portfolioAt) merged.portfolioAt = portfolioAt;
  if (a.introSeen || b.introSeen) merged.introSeen = true;
  return merged;
}

/**
 * Insígnias que uma vitória dá: a da trilha; no Eco, a rara e (sem perder coração) também a
 * lendária; no chefe de lua, a exclusiva da lua. Trilha de lua não dá insígnia.
 */
export function badgesForWebStage(
  stage: { kind: WebStageKind; gem?: GemSpec },
  special: { rara: GemSpec; lendaria: GemSpec },
  heartsLost: number,
): GemSpec[] {
  if (stage.kind === 'boss') return heartsLost === 0 ? [special.rara, special.lendaria] : [special.rara];
  if (stage.kind === 'moon') return [];
  return stage.gem ? [stage.gem] : [];
}

/**
 * Pressão da etapa, de 0 (primeira trilha da era) a 1 (chefes de lua). Cresce aos poucos,
 * fase a fase: trilhas da era 0 → 0,7, Eco 0,85, trilhas de lua 0,6, chefes de lua 1.
 */
export function webStageDifficulty(kind: WebStageKind, trailIndex = 0, trailCount = 10): number {
  if (kind === 'trail') return trailCount > 1 ? (Math.max(0, trailIndex) / (trailCount - 1)) * 0.7 : 0;
  if (kind === 'boss') return 0.85;
  if (kind === 'moon') return 0.6;
  return 1;
}

/** Tempo da missão já ajustado: 50% maior no começo da era, o tempo normal nos chefes de lua. */
export function webMissionTime(seconds: number, difficulty: number): number {
  return Math.round(seconds * (1.5 - 0.5 * Math.min(1, Math.max(0, difficulty))));
}

export type CatchPace = {
  /** Máximo de palavras caindo ao mesmo tempo (2 nas fases iniciais). */
  maxOnScreen: number;
  /** Velocidade da primeira palavra, em px/s. */
  baseSpeed: number;
  /** Quanto cada acerto acelera as próximas, em px/s. */
  speedPerHit: number;
  /** Intervalo mínimo entre uma palavra e a próxima, em ms. */
  spawnMs: number;
};

/** Ritmo da chuva de palavras: começa devagar e acelera a cada acerto. */
export function catchPace(difficulty: number): CatchPace {
  const d = Math.min(1, Math.max(0, difficulty));
  return {
    maxOnScreen: d < 0.35 ? 2 : d < 0.75 ? 3 : 4,
    baseSpeed: 40 + d * 36,
    speedPerHit: 3 + d * 5,
    spawnMs: 1150 - d * 450,
  };
}
