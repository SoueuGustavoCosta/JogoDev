import { describe, expect, it } from 'vitest';
import { checkInStreak, localDateISO, nextStreak, travelerLevel } from './streak';

describe('checkInStreak', () => {
  it('primeira vez: started, sem recorde', () => {
    expect(checkInStreak(null, '2026-09-21', 0, 0)).toEqual({ current: 1, best: 1, kind: 'started', newRecord: false });
  });

  it('mesmo dia: same-day, nada muda', () => {
    expect(checkInStreak('2026-09-21', '2026-09-21', 3, 5)).toEqual({ current: 3, best: 5, kind: 'same-day', newRecord: false });
  });

  it('dia seguinte abaixo do recorde: continued sem recorde', () => {
    expect(checkInStreak('2026-09-20', '2026-09-21', 2, 5)).toEqual({ current: 3, best: 5, kind: 'continued', newRecord: false });
  });

  it('dia seguinte passando o recorde: newRecord', () => {
    expect(checkInStreak('2026-09-20', '2026-09-21', 5, 5)).toEqual({ current: 6, best: 6, kind: 'continued', newRecord: true });
  });

  it('segundo dia de todos também é recorde', () => {
    expect(checkInStreak('2026-09-20', '2026-09-21', 1, 1).newRecord).toBe(true);
  });

  it('depois de sumir dias: restarted, recorde preservado', () => {
    expect(checkInStreak('2026-09-10', '2026-09-21', 7, 9)).toEqual({ current: 1, best: 9, kind: 'restarted', newRecord: false });
  });
});

describe('localDateISO', () => {
  it('usa o dia local, não o UTC', () => {
    // 22h30 local: em UTC-3 isso já seria o dia seguinte no toISOString().
    expect(localDateISO(new Date(2026, 8, 21, 22, 30))).toBe('2026-09-21');
  });

  it('preenche mês e dia com zero', () => {
    expect(localDateISO(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
  });
});

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
