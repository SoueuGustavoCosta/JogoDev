import { createEmptyProgress } from '@/domain/progress';
import {
  markWebIntroSeen,
  recordWebStage,
  saveWebPortfolio,
  WEB_NEXUS_KEY,
  webEraOf,
  webStageXp,
  type WebEraProgress,
  type WebPortfolio,
  type WebStageKind,
} from '@/domain/webEra';
import type { AnalyticsPort, ClipboardPort, LeaderboardPort, ProgressRepository } from '../ports';
import { awardBadge } from './badges';
import { recordXpGain, syncWeeklyXp } from './league';
import { getOrCreateTravelerUuid, getTraveler } from './traveler';

export type WebEraView = {
  web: WebEraProgress;
  travelerName: string;
  /** Insígnias conquistadas (catálogo compartilhado), por id. */
  badgesEarned: Record<string, string>;
  /** A cena do Evento Nexus da Web já tocou (toca uma vez). */
  nexusSeen: boolean;
};

/** O progresso da Era da Web, o nome do viajante (falas e portfólio) e as insígnias. */
export function getWebEra(deps: { repository: ProgressRepository }): WebEraView {
  const progress = deps.repository.load();
  return {
    web: webEraOf(progress),
    travelerName: getTraveler(deps).name,
    badgesEarned: progress?.badgesEarned ?? {},
    nexusSeen: Boolean(progress?.nexusSeen?.[WEB_NEXUS_KEY]),
  };
}

/** Entrou na era (ou numa lua dela). */
export function openWebEra(deps: { analytics: AnalyticsPort }, params: { moon?: string } = {}): void {
  deps.analytics.track('island_opened', { island: params.moon ? `web-${params.moon}` : 'web' });
}

const isBoss =(kind: WebStageKind) => kind === 'boss' || kind === 'moonboss';

export function startWebStage(deps: { analytics: AnalyticsPort }, params: { stageId: string; kind: WebStageKind }): void {
  if (isBoss(params.kind)) deps.analytics.track('boss_fight_started', { island: 'web', boss: params.stageId });
  else deps.analytics.track('web_stage_started', { stage: params.stageId });
}

/** Os corações acabaram: a linha do tempo ramificou (nada se perde, a etapa recomeça). */
export function loseWebStage(deps: { analytics: AnalyticsPort }, params: { stageId: string; kind: WebStageKind; mission: number }): void {
  if (isBoss(params.kind)) deps.analytics.track('boss_fight_lost', { island: 'web', boss: params.stageId });
  else deps.analytics.track('web_stage_failed', { stage: params.stageId, mission: params.mission });
}

/**
 * Etapa vencida: guarda o XP (missões + bônus), dá as insígnias e soma na semana da Liga.
 * Vencer de novo nunca tira XP nem duplica nada. Devolve o XP que esta vitória acrescentou.
 */
export function winWebStage(
  deps: { repository: ProgressRepository; analytics: AnalyticsPort; leaderboard: LeaderboardPort },
  params: { stageId: string; kind: WebStageKind; missions: number; badgeIds: string[]; now?: Date },
): { xpGained: number; firstWin: boolean } {
  const now = params.now ?? new Date();
  const progress = deps.repository.load() ?? createEmptyProgress();
  const before = webEraOf(progress).done[params.stageId];
  const xp = webStageXp(params.kind, params.missions);
  const next = recordWebStage(progress, params.stageId, { at: now.toISOString(), xp });
  if (next !== progress) deps.repository.save(next);

  const traveler = { uuid: getOrCreateTravelerUuid(deps), name: getTraveler(deps).name };
  for (const badgeId of params.badgeIds) awardBadge(deps, { badgeId, traveler });

  if (isBoss(params.kind)) deps.analytics.track('boss_fight_won', { island: 'web', boss: params.stageId });
  else deps.analytics.track('web_stage_completed', { stage: params.stageId });

  const xpGained = Math.max(0, xp - (before?.xp ?? 0));
  if (xpGained > 0) {
    recordXpGain(deps, { sourceId: `web:${params.stageId}`, xp, now });
    syncWeeklyXp(deps, now);
  }
  return { xpGained, firstWin: !before };
}

/** Guarda no portfólio o que o viajante escreveu numa missão (nome, bio, links, cor...). */
export function saveWebPortfolioPiece(
  deps: { repository: ProgressRepository },
  params: { patch: Partial<WebPortfolio>; now?: Date },
): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const next = saveWebPortfolio(progress, params.patch, (params.now ?? new Date()).toISOString());
  if (next !== progress) deps.repository.save(next);
}

export function markWebEraIntroSeen(deps: { repository: ProgressRepository }): void {
  const progress = deps.repository.load() ?? createEmptyProgress();
  const next = markWebIntroSeen(progress);
  if (next !== progress) deps.repository.save(next);
}

export function openWebPortfolio(deps: { analytics: AnalyticsPort }): void {
  deps.analytics.track('web_portfolio_opened');
}

/** Copia um arquivo do portfólio (index.html, style.css, script.js). Devolve se deu certo. */
export async function copyWebPortfolioFile(
  deps: { clipboard: ClipboardPort; analytics: AnalyticsPort },
  params: { file: 'html' | 'css' | 'js'; text: string },
): Promise<boolean> {
  const ok = await deps.clipboard.copy(params.text);
  if (ok) deps.analytics.track('web_portfolio_copied', { file: params.file });
  return ok;
}
