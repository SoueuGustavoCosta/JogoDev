import { describe, expect, it } from 'vitest';
import {
  breakTimeline,
  daysToNextAnchor,
  evaluateTimeline,
  MAX_ANCHORS,
  registerPlay,
  spendAnchors,
  weekNodes,
  type TimelineState,
} from './timeline';

const empty: TimelineState = { current: 0, best: 0, lastPlayed: null, anchors: 0, ecoEra: 0, played: [], anchored: [] };
const at = (current: number, lastPlayed: string, extra: Partial<TimelineState> = {}): TimelineState => ({
  ...empty,
  current,
  best: current,
  lastPlayed,
  ...extra,
});

describe('evaluateTimeline (virada de dia)', () => {
  it('nunca jogou ou sequência zerada: nada a perder', () => {
    expect(evaluateTimeline(empty, '2026-09-26')).toEqual({ kind: 'new' });
    expect(evaluateTimeline(at(0, '2026-09-20'), '2026-09-26')).toEqual({ kind: 'new' });
  });

  it('jogou hoje, jogou ontem, perdeu dias', () => {
    expect(evaluateTimeline(at(5, '2026-09-26'), '2026-09-26').kind).toBe('played-today');
    expect(evaluateTimeline(at(5, '2026-09-25'), '2026-09-26').kind).toBe('alive');
    expect(evaluateTimeline(at(5, '2026-09-24'), '2026-09-26')).toEqual({ kind: 'broken', missed: 1 });
    expect(evaluateTimeline(at(5, '2026-09-24', { anchors: 1 }), '2026-09-26')).toEqual({ kind: 'can-anchor', missed: 1 });
    expect(evaluateTimeline(at(5, '2026-09-23', { anchors: 1 }), '2026-09-26')).toEqual({ kind: 'broken', missed: 2 });
    expect(evaluateTimeline(at(5, '2026-09-23', { anchors: 2 }), '2026-09-26')).toEqual({ kind: 'can-anchor', missed: 2 });
  });

  it('vira o mês e o ano', () => {
    expect(evaluateTimeline(at(3, '2026-09-30'), '2026-10-01').kind).toBe('alive');
    expect(evaluateTimeline(at(3, '2026-12-31'), '2027-01-01').kind).toBe('alive');
  });
});

describe('registerPlay', () => {
  it('conta um dia por dia, e o segundo jogo do mesmo dia não conta de novo', () => {
    const first = registerPlay(empty, '2026-09-26');
    expect(first).toMatchObject({ counted: true, state: { current: 1, best: 1, lastPlayed: '2026-09-26', played: ['2026-09-26'] } });
    expect(registerPlay(first.state, '2026-09-26').counted).toBe(false);
    expect(registerPlay(first.state, '2026-09-27').state.current).toBe(2);
  });

  it('depois de dia perdido, recomeça do 1 (o recorde fica)', () => {
    const r = registerPlay(at(9, '2026-09-20', { best: 12 }), '2026-09-26');
    expect(r.state.current).toBe(1);
    expect(r.state.best).toBe(12);
  });

  it(`ganha uma âncora a cada 7 dias seguidos, até ${MAX_ANCHORS}`, () => {
    expect(registerPlay(at(6, '2026-09-25'), '2026-09-26')).toMatchObject({ gainedAnchor: true, state: { current: 7, anchors: 1 } });
    expect(registerPlay(at(13, '2026-09-25', { anchors: 1 }), '2026-09-26').state.anchors).toBe(2);
    expect(registerPlay(at(20, '2026-09-25', { anchors: 3 }), '2026-09-26')).toMatchObject({ gainedAnchor: false, state: { anchors: 3 } });
    expect(registerPlay(at(7, '2026-09-25', { anchors: 1 }), '2026-09-26').gainedAnchor).toBe(false);
  });
});

describe('âncora e linha ramificada', () => {
  it('usar âncora cobre os dias perdidos e a sequência segue do mesmo número', () => {
    const state = at(12, '2026-09-24', { anchors: 1 });
    const saved = spendAnchors(state, '2026-09-26');
    expect(saved).toMatchObject({ current: 12, anchors: 0, lastPlayed: '2026-09-25', anchored: ['2026-09-25'] });
    expect(evaluateTimeline(saved, '2026-09-26').kind).toBe('alive');
    expect(registerPlay(saved, '2026-09-26').state.current).toBe(13);
  });

  it('sem âncora suficiente, não gasta nada', () => {
    const state = at(12, '2026-09-23', { anchors: 1 });
    expect(spendAnchors(state, '2026-09-26')).toBe(state);
  });

  it('ramificar: sequência zera, Eco avança uma era, e não pergunta de novo no mesmo dia', () => {
    const broken = breakTimeline(at(12, '2026-09-24', { ecoEra: 2, best: 15 }), '2026-09-26');
    expect(broken).toMatchObject({ current: 0, best: 15, ecoEra: 3, brokenOn: '2026-09-26' });
    expect(evaluateTimeline(broken, '2026-09-26').kind).toBe('new');
    expect(registerPlay(broken, '2026-09-26').state.current).toBe(1);
    // Ramificar de novo no mesmo estado não faz o Eco andar duas vezes.
    expect(breakTimeline(broken, '2026-09-26')).toBe(broken);
  });

  it('nada além disso muda: o recorde e as âncoras continuam', () => {
    const broken = breakTimeline(at(5, '2026-09-20', { best: 30, anchors: 0 }), '2026-09-26');
    expect(broken.best).toBe(30);
  });
});

describe('daysToNextAnchor e weekNodes', () => {
  it('conta quantos dias faltam para a próxima âncora', () => {
    expect(daysToNextAnchor(at(5, '2026-09-26'))).toBe(2);
    expect(daysToNextAnchor(at(7, '2026-09-26'))).toBe(7);
    expect(daysToNextAnchor(at(5, '2026-09-26', { anchors: 3 }))).toBe(0);
  });

  it('desenha a semana de segunda a domingo com hoje, jogados, ancorados e perdidos', () => {
    // 2026-09-26 é um sábado.
    const state = at(3, '2026-09-25', { played: ['2026-09-22', '2026-09-24', '2026-09-25'], anchored: ['2026-09-23'] });
    const nodes = weekNodes(state, '2026-09-26');
    expect(nodes.map((n) => n.label)).toEqual(['seg', 'ter', 'qua', 'qui', 'sex', 'hoje', 'dom']);
    expect(nodes.map((n) => n.state)).toEqual(['missed', 'played', 'anchored', 'played', 'played', 'today', 'future']);
  });
});
