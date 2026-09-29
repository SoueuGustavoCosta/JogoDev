import { describe, expect, it } from 'vitest';
import { createEmptyProgress, mergeProgress } from '../progress';
import {
  areAllMoonsDone,
  areMoonsOpen,
  badgesForWebStage,
  isEcoUnlocked,
  isEraTrailUnlocked,
  isMoonBossUnlocked,
  isMoonTrailUnlocked,
  markWebIntroSeen,
  mergeWebEra,
  moonBossStageId,
  portfolioPercent,
  recordWebStage,
  saveWebPortfolio,
  unlockedPieces,
  webEraOf,
  webEraXpTotal,
  webStageXp,
} from './rules';
import type { GemSpec, WebEraTrail, WebMoon } from './types';

const gem = (id: string, tier: GemSpec['tier'] = 'comum'): GemSpec => ({ badgeId: id, name: id, icon: 'globe', sides: 8, c1: '#fff', c2: '#000', tier });
const trail = (id: string, piece: WebEraTrail['piece']): WebEraTrail => ({
  id, title: id, year: '1991', color: '#fff', say: ['oi'], doc: { label: 'x', url: 'https://x' }, gem: gem(`g-${id}`), piece, pieceName: piece, rounds: [],
});
const trails = [trail('w1', 'files'), trail('w2', 'title'), trail('w3', 'hero')];
const moon = (id: string): WebMoon => ({
  id, name: id, short: id, color: '#fff', description: 'x', gem: gem(`${id}-g`, 'lua'),
  boss: { id: `${id}-chefe`, name: 'b', face: 'b', say: ['x'], rounds: [] },
  trails: [1, 2].map((n) => ({ id: `${id}${n}`, title: 't', icon: 'form', say: ['x'], doc: { label: 'x', url: 'https://x' }, rounds: [] })),
});
const moons = [moon('mh'), moon('mc')];

const win = (progress: ReturnType<typeof createEmptyProgress>, ids: string[]) =>
  ids.reduce((p, id) => recordWebStage(p, id, { at: '2026-09-29T10:00:00.000Z', xp: 10 }), progress);

describe('Era da Web: regras', () => {
  it('XP sai do conteúdo: +10 por missão e o bônus da etapa', () => {
    expect(webStageXp('trail', 3)).toBe(80);
    expect(webStageXp('boss', 6)).toBe(260);
    expect(webStageXp('moon', 2)).toBe(60);
    expect(webStageXp('moonboss', 3)).toBe(180);
  });

  it('trilhas abrem em sequência e o Eco só depois de todas', () => {
    let p = createEmptyProgress();
    expect(isEraTrailUnlocked(trails, 0, webEraOf(p))).toBe(true);
    expect(isEraTrailUnlocked(trails, 1, webEraOf(p))).toBe(false);
    p = win(p, ['w1']);
    expect(isEraTrailUnlocked(trails, 1, webEraOf(p))).toBe(true);
    expect(isEcoUnlocked(trails, webEraOf(p))).toBe(false);
    p = win(p, ['w2', 'w3']);
    expect(isEcoUnlocked(trails, webEraOf(p))).toBe(true);
    expect(portfolioPercent(trails, webEraOf(p))).toBe(100);
    expect([...unlockedPieces(trails, webEraOf(p))]).toEqual(['files', 'title', 'hero']);
  });

  it('luas só nascem depois do Eco; chefe da lua depois das trilhas dela; Nexus com todas', () => {
    let p = createEmptyProgress();
    expect(areMoonsOpen(webEraOf(p))).toBe(false);
    expect(isMoonTrailUnlocked(moons[0]!, 0, webEraOf(p))).toBe(false);
    p = win(p, ['eco']);
    expect(isMoonTrailUnlocked(moons[0]!, 0, webEraOf(p))).toBe(true);
    expect(isMoonTrailUnlocked(moons[0]!, 1, webEraOf(p))).toBe(false);
    expect(isMoonBossUnlocked(moons[0]!, webEraOf(p))).toBe(false);
    p = win(p, ['mh1', 'mh2']);
    expect(isMoonBossUnlocked(moons[0]!, webEraOf(p))).toBe(true);
    p = win(p, [moonBossStageId('mh')]);
    expect(areAllMoonsDone(moons, webEraOf(p))).toBe(false);
    p = win(p, ['mc1', 'mc2', moonBossStageId('mc')]);
    expect(areAllMoonsDone(moons, webEraOf(p))).toBe(true);
  });

  it('vencer de novo nunca tira XP nem muda a primeira vitória', () => {
    let p = recordWebStage(createEmptyProgress(), 'w1', { at: '2026-09-01T00:00:00.000Z', xp: 80 });
    const same = recordWebStage(p, 'w1', { at: '2026-09-02T00:00:00.000Z', xp: 80 });
    expect(same).toBe(p);
    p = recordWebStage(p, 'eco', { at: '2026-09-03T00:00:00.000Z', xp: 260 });
    expect(webEraXpTotal(p)).toBe(340);
  });

  it('insígnias: trilha dá a dela, Eco dá rara (e lendária sem perder coração), lua dá a exclusiva', () => {
    const special = { rara: gem('rara', 'rara'), lendaria: gem('lend', 'lendaria') };
    expect(badgesForWebStage({ kind: 'trail', gem: gem('w1') }, special, 2).map((g) => g.badgeId)).toEqual(['w1']);
    expect(badgesForWebStage({ kind: 'boss' }, special, 1).map((g) => g.badgeId)).toEqual(['rara']);
    expect(badgesForWebStage({ kind: 'boss' }, special, 0).map((g) => g.badgeId)).toEqual(['rara', 'lend']);
    expect(badgesForWebStage({ kind: 'moon' }, special, 0)).toEqual([]);
    expect(badgesForWebStage({ kind: 'moonboss', gem: gem('coroa', 'lua') }, special, 3).map((g) => g.badgeId)).toEqual(['coroa']);
  });

  it('portfólio: guarda só texto limpo e links http(s)', () => {
    const p = saveWebPortfolio(
      createEmptyProgress(),
      { name: '  Ana  ', bio: '', links: [{ href: 'javascript:alert(1)', t: 'x' }, { href: 'https://github.com/ana', t: '' }] },
      '2026-09-29T10:00:00.000Z',
    );
    expect(p.webEra?.portfolio).toEqual({ name: 'Ana', links: [{ href: 'https://github.com/ana', t: 'https://github.com/ana' }] });
    expect(saveWebPortfolio(p, { bio: '   ' }, '2026-09-30T00:00:00.000Z')).toBe(p);
  });

  it('merge entre aparelhos: etapas somam, portfólio do mais recente campo a campo, intro vista fica', () => {
    const a = markWebIntroSeen(saveWebPortfolio(win(createEmptyProgress(), ['w1']), { name: 'Ana', bio: 'velha' }, '2026-09-01T00:00:00.000Z'));
    const b = saveWebPortfolio(win(createEmptyProgress(), ['w2']), { bio: 'nova' }, '2026-09-05T00:00:00.000Z');
    const merged = mergeWebEra(a.webEra, b.webEra)!;
    expect(Object.keys(merged.done).sort()).toEqual(['w1', 'w2']);
    expect(merged.portfolio).toEqual({ name: 'Ana', bio: 'nova' });
    expect(merged.introSeen).toBe(true);
    expect(mergeProgress(a, b).webEra).toEqual(merged);
    expect(mergeProgress(createEmptyProgress(), createEmptyProgress()).webEra).toBeUndefined();
  });
});
