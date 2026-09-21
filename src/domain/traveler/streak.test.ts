import { describe, expect, it } from 'vitest';
import { nextStreak, travelerLevel } from './streak';

describe('nextStreak', () => {
  it('primeira vez (sem última data): reinicia em 1', () => {
    expect(nextStreak(null, '2026-09-21', 0, 0)).toEqual({ current: 1, best: 1 });
  });

  it('mesmo dia do último check-in: não muda', () => {
    expect(nextStreak('2026-09-21', '2026-09-21', 4, 4)).toEqual({ current: 4, best: 4 });
  });

  it('exatamente um dia depois: soma 1', () => {
    expect(nextStreak('2026-09-20', '2026-09-21', 4, 5)).toEqual({ current: 5, best: 5 });
  });

  it('intervalo maior que um dia: reinicia em 1', () => {
    expect(nextStreak('2026-09-10', '2026-09-21', 7, 9)).toEqual({ current: 1, best: 9 });
  });

  it('recorde acompanha o maior valor já visto, mesmo depois de reiniciar', () => {
    const r = nextStreak('2026-09-01', '2026-09-25', 3, 12);
    expect(r).toEqual({ current: 1, best: 12 });
  });

  it('atravessando a virada do mês, um dia depois ainda soma 1', () => {
    expect(nextStreak('2026-09-30', '2026-10-01', 2, 2)).toEqual({ current: 3, best: 3 });
  });
});

describe('travelerLevel', () => {
  it('começa no nível 1 com 0 XP', () => {
    expect(travelerLevel(0)).toBe(1);
  });

  it('sobe de nível a cada 500 XP', () => {
    expect(travelerLevel(499)).toBe(1);
    expect(travelerLevel(500)).toBe(2);
    expect(travelerLevel(1200)).toBe(3);
  });
});
