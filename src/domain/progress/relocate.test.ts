import { describe, expect, it } from 'vitest';
import type { Module, Trail } from '../trail/types';
import { createEmptyProgress } from './factory';
import { bonusXpTotal } from './bonusXp';
import { foldXpSourceId, relocateModules, type ModuleRelocation } from './relocate';
import type { ModuleProgress, Progress } from './types';

function mod(id: string, quiz: string[]): Module {
  return {
    id,
    short: id,
    title: id,
    lead: 'l',
    level: 'Base',
    blocks: [{ t: 'p', x: 'x' }],
    quiz: quiz.map((q) => ({ id: q, q: 'q', options: ['a', 'b'], answer: 0, explain: 'e' })),
  };
}

function trail(id: string, modules: Module[]): Trail {
  return { id, title: id, tagline: 't', symbol: 's', accent: '#000', modules };
}

// Antes: velha = [a, b, c, d]. Depois: velha = [a, b (com c dentro)], nova = [d].
const trails = [trail('velha', [mod('a', ['q1']), mod('b', ['q1', 'c-q1', 'c-q2'])]), trail('nova', [mod('d', ['q1'])])];
const relocations: ModuleRelocation[] = [
  { fromTrail: 'velha', toTrail: 'velha', moduleId: 'c', fold: { toModule: 'b', quizIdPrefix: 'c-', legacyQuizOrder: ['q1', 'q2'] } },
  { fromTrail: 'velha', toTrail: 'nova', moduleId: 'd' },
];

const right = { correct: true, triesUsed: 1 };
const late = { correct: true, triesUsed: 2 };
const wrong = { correct: false, triesUsed: 1 };

function m(moduleId: string, quizResults: ModuleProgress['quizResults'], completed = false, extra: Partial<ModuleProgress> = {}): ModuleProgress {
  return { moduleId, quizResults, completed, ...extra };
}

function withOld(modules: Record<string, ModuleProgress>, over: Partial<Progress> = {}): Progress {
  return {
    ...createEmptyProgress(),
    trails: { velha: { trailId: 'velha', modules, missionsCompleted: { m1: true }, trophyAwarded: false, bossDefeated: true } },
    ...over,
  };
}

describe('relocateModules (módulos que mudaram de trilha)', () => {
  it('jogador novo ou já migrado: devolve o mesmo objeto', () => {
    const empty = createEmptyProgress();
    expect(relocateModules(empty, relocations, trails)).toBe(empty);
    const onlyA = withOld({ a: m('a', { q1: right }, true) });
    expect(relocateModules(onlyA, relocations, trails)).toBe(onlyA);
  });

  it('leva o módulo para a trilha nova e tira do lugar antigo, sem mexer em missões nem chefe', () => {
    const p = withOld({ a: m('a', { q1: right }, true), d: m('d', { q1: late }, true, { screen: 3 }) });
    const r = relocateModules(p, relocations, trails);
    expect(r.trails.velha.modules).toEqual({ a: p.trails.velha.modules.a });
    expect(r.trails.velha.missionsCompleted).toEqual({ m1: true });
    expect(r.trails.velha.bossDefeated).toBe(true);
    expect(r.trails.nova.modules.d).toEqual(m('d', { q1: late }, true, { screen: 3 }));
    // Rodar de novo não muda nada.
    expect(relocateModules(r, relocations, trails)).toBe(r);
  });

  it('módulo fundido: perguntas com o id novo (também pela posição antiga) e concluído se qualquer um estava', () => {
    const p = withOld({
      b: m('b', { q1: wrong }, false, { screen: 2 }),
      c: m('c', { q2: right, '0': late, '5': right }, true, { screen: 7, unmappedQuizResults: { '9': wrong } }),
    });
    const r = relocateModules(p, relocations, trails);
    expect(r.trails.velha.modules.c).toBeUndefined();
    expect(r.trails.velha.modules.b).toEqual({
      moduleId: 'b',
      quizResults: { q1: wrong, 'c-q1': late, 'c-q2': right },
      completed: true,
      // Posições que não existiam ficam guardadas, marcadas com o módulo de origem.
      unmappedQuizResults: { 'c:5': right, 'c:9': wrong },
      // A tela onde parou no módulo antigo não vale no módulo fundido.
      screen: 2,
    });
    // Só um dos dois estava concluído: o bônus de conclusão do fundido já cobre, sem XP extra.
    expect(r.xpBonus).toBeUndefined();
  });

  it('quem tinha concluído os dois módulos fundidos não perde o bônus de conclusão', () => {
    const p = withOld({ b: m('b', {}, true), c: m('c', {}, true) });
    const r = relocateModules(p, relocations, trails);
    expect(r.xpBonus).toEqual({ [foldXpSourceId(relocations[0]!)]: 150 });
    expect(bonusXpTotal(r)).toBe(150);
  });

  it('junta com o que já estava no lugar novo (aba com o app antigo gravou de novo no lugar antigo)', () => {
    const migrated = relocateModules(withOld({ d: m('d', { q1: wrong }, false) }), relocations, trails);
    const oldTab: Progress = {
      ...migrated,
      trails: { ...migrated.trails, velha: { ...migrated.trails.velha, modules: { d: m('d', { q1: right }, true) } } },
    };
    const r = relocateModules(oldTab, relocations, trails);
    expect(r.trails.velha.modules.d).toBeUndefined();
    expect(r.trails.nova.modules.d).toEqual(m('d', { q1: right }, true));
  });

  it('a última lição aberta segue o módulo', () => {
    const p = withOld({ c: m('c', {}, false) }, { lastLesson: { trailId: 'velha', moduleId: 'c', at: '2026-09-20T00:00:00.000Z' } });
    expect(relocateModules(p, relocations, trails).lastLesson).toEqual({ trailId: 'velha', moduleId: 'b', at: '2026-09-20T00:00:00.000Z' });
    // Mesmo sem progresso guardado no módulo (abriu e saiu sem responder nada).
    const opened = withOld({}, { lastLesson: { trailId: 'velha', moduleId: 'd', at: 'z' } });
    const r = relocateModules(opened, relocations, trails);
    expect(r.lastLesson).toEqual({ trailId: 'nova', moduleId: 'd', at: 'z' });
    expect(relocateModules(r, relocations, trails)).toBe(r);
  });

  it('trilhas mexidas que ficaram completas ganham o troféu', () => {
    const p = withOld({ a: m('a', {}, true), b: m('b', {}, true), c: m('c', {}, false), d: m('d', {}, true) });
    const r = relocateModules(p, relocations, trails);
    expect(r.trails.velha.trophyAwarded).toBe(true);
    expect(r.trails.nova.trophyAwarded).toBe(true);
    const partial = relocateModules(withOld({ a: m('a', {}, false), d: m('d', {}, false) }), relocations, trails);
    expect(partial.trails.velha.trophyAwarded).toBe(false);
    expect(partial.trails.nova.trophyAwarded).toBe(false);
  });
});
