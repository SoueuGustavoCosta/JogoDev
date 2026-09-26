import { describe, expect, it } from 'vitest';
import {
  activeEvents,
  addDays,
  bonusXp,
  convergenceProgress,
  eventCalendarSchema,
  isEventActiveOn,
  nextOccurrence,
  pickForDay,
  weekdayOf,
  xpMultiplier,
  type ConvergenciaEvent,
  type GameEvent,
} from '.';

const surto: GameEvent = { id: 'surto', kind: 'surto', title: 'S', description: 'd', multiplier: 2, when: { weekly: ['sab', 'dom'] } };
const surto3: GameEvent = { id: 'surto-3', kind: 'surto', title: 'S', description: 'd', multiplier: 3, when: { from: '2026-10-10', to: '2026-10-12' } };
const eco: GameEvent = { id: 'eco', kind: 'eco-solto', title: 'E', description: 'd', rewardItemId: 'x', bonusFragments: 15, when: { weekly: ['sex'] } };
const conv: ConvergenciaEvent = { id: 'c', kind: 'convergencia', title: 'C', description: 'd', target: 100, rewardItemId: 'y', when: { from: '2026-10-01', to: '2026-10-31' } };

describe('calendário de eventos', () => {
  it('dias da semana e contas de data', () => {
    expect(weekdayOf('2026-10-02')).toBe('sex');
    expect(weekdayOf('2026-10-04')).toBe('dom');
    expect(weekdayOf('2026-10-05')).toBe('seg');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
  });

  it('evento semanal e evento datado (data final inclusiva)', () => {
    expect(isEventActiveOn(surto, '2026-10-03')).toBe(true);
    expect(isEventActiveOn(surto, '2026-10-02')).toBe(false);
    expect(isEventActiveOn(conv, '2026-10-31')).toBe(true);
    expect(isEventActiveOn(conv, '2026-11-01')).toBe(false);
  });

  it('ativos no dia, com até quando', () => {
    const sat = activeEvents([surto, eco, conv], '2026-10-03');
    expect(sat.map((a) => `${a.event.id}:${a.until}`)).toEqual(['surto:2026-10-04', 'c:2026-10-31']);
    expect(activeEvents([surto, eco], '2026-10-02').map((a) => a.event.id)).toEqual(['eco']);
    expect(nextOccurrence(eco, '2026-10-02')).toBe('2026-10-09');
    expect(nextOccurrence(conv, '2026-10-31')).toBeNull();
  });

  it('multiplicador: o maior Surto do dia, sem somar; 1 sem Surto', () => {
    expect(xpMultiplier(activeEvents([surto, surto3], '2026-10-10'))).toBe(3);
    expect(xpMultiplier(activeEvents([surto, eco], '2026-10-09'))).toBe(1);
    expect(bonusXp(100, 2)).toBe(100);
    expect(bonusXp(40, 1.5)).toBe(20);
    expect(bonusXp(100, 1)).toBe(0);
    expect(bonusXp(0, 2)).toBe(0);
  });

  it('progresso da Convergência', () => {
    expect(convergenceProgress(conv, 64)).toEqual({ count: 64, target: 100, percent: 64, reached: false });
    expect(convergenceProgress(conv, 130)).toMatchObject({ percent: 100, reached: true });
    expect(convergenceProgress(conv, null)).toEqual({ count: null, target: 100, percent: 0, reached: false });
  });

  it('sorteio do dia: igual para todos, sem repetir', () => {
    const pool = ['a', 'b', 'c', 'd', 'e', 'f'];
    const today = pickForDay(pool, '2026-10-02', 3);
    expect(today).toEqual(pickForDay(pool, '2026-10-02', 3));
    expect(new Set(today).size).toBe(3);
    expect(pickForDay(pool, '2026-10-02', 10)).toHaveLength(6);
  });

  it('esquema recusa id repetido, data inválida e intervalo invertido', () => {
    expect(eventCalendarSchema.safeParse([surto, eco, conv]).success).toBe(true);
    expect(eventCalendarSchema.safeParse([surto, surto]).success).toBe(false);
    expect(eventCalendarSchema.safeParse([{ ...conv, when: { from: '2026-02-30', to: '2026-03-01' } }]).success).toBe(false);
    expect(eventCalendarSchema.safeParse([{ ...conv, when: { from: '2026-10-31', to: '2026-10-01' } }]).success).toBe(false);
  });
});
