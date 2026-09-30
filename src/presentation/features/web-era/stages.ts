import { ECO_STAGE_ID, moonBossStageId, webStageDifficulty, type WebEraTrail, type WebMoon, type WebMoonTrail } from '@/domain/webEra';
import { ecoBoss, webEraTrails } from '@/content/webEra';
import type { WebStage } from './StageRunner';

/** Monta a etapa jogável (palco) de cada ponto da era. */
export function eraTrailStage(t: WebEraTrail): WebStage {
  return {
    kind: 'trail',
    stageId: t.id,
    title: t.title,
    color: t.color,
    say: t.say,
    doc: t.doc,
    rounds: t.rounds,
    gem: t.gem,
    pieceName: t.pieceName,
    difficulty: webStageDifficulty('trail', webEraTrails.indexOf(t), webEraTrails.length),
  };
}

export function ecoStage(): WebStage {
  return {
    kind: 'boss',
    stageId: ECO_STAGE_ID,
    title: ecoBoss.name,
    color: 'var(--web-bad)',
    say: ecoBoss.say,
    rounds: ecoBoss.rounds,
    boss: { name: ecoBoss.name, face: ecoBoss.face },
    difficulty: webStageDifficulty('boss'),
  };
}

export function moonTrailStage(m: WebMoon, t: WebMoonTrail): WebStage {
  return { kind: 'moon', stageId: t.id, title: t.title, color: m.color, say: t.say, doc: t.doc, rounds: t.rounds, moonName: m.name, difficulty: webStageDifficulty('moon') };
}

export function moonBossStage(m: WebMoon): WebStage {
  return {
    kind: 'moonboss',
    stageId: moonBossStageId(m.id),
    title: m.boss.name,
    color: m.color,
    say: m.boss.say,
    rounds: m.boss.rounds,
    boss: { name: m.boss.name, face: m.boss.face },
    gem: m.gem,
    moonName: m.name,
    difficulty: webStageDifficulty('moonboss'),
  };
}
