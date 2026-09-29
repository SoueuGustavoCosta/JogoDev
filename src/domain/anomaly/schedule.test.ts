import { describe, expect, it } from 'vitest';
import { anomalyDay, anomalyNumber, globalAnomalyForDay, msUntilNextAnomaly, pickAnomaly } from './schedule';
import { ANOMALY_NO_REPEAT_DAYS, type Anomaly } from './types';

const challenge = { id: 'desafio', q: 'q', options: ['a', 'b'], answer: 0, explain: 'e' };
const make = (n: number, era = 'logica', level: Anomaly['level'] = 'Base'): Anomaly => ({
  id: `a${String(n).padStart(2, '0')}`,
  era,
  title: `t${n}`,
  story: 's',
  level,
  challenge,
});
const pool = Array.from({ length: 30 }, (_, i) => make(i));

function addDays(dayISO: string, n: number): string {
  const [y, m, d] = dayISO.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

describe('anomalyDay / msUntilNextAnomaly (fuso de São Paulo)', () => {
  it('usa o dia de São Paulo, não o UTC', () => {
    // 02:00 UTC do dia 27 ainda é 23:00 do dia 26 em São Paulo (UTC-3).
    expect(anomalyDay(new Date('2026-09-27T02:00:00Z'))).toBe('2026-09-26');
    expect(anomalyDay(new Date('2026-09-27T03:00:00Z'))).toBe('2026-09-27');
  });

  it('conta o tempo até a meia-noite de São Paulo', () => {
    expect(msUntilNextAnomaly(new Date('2026-09-26T18:00:00Z'))).toBe(9 * 3_600_000);
    expect(msUntilNextAnomaly(new Date('2026-09-27T02:59:00Z'))).toBe(60_000);
  });

  it('numera a partir do dia 1 da contagem', () => {
    expect(anomalyNumber('2026-09-01')).toBe(1);
    expect(anomalyNumber('2026-09-26')).toBe(26);
  });
});

describe('globalAnomalyForDay', () => {
  it('é determinística: a mesma entrada dá a mesma anomalia, em qualquer ordem da lista', () => {
    const shuffled = [...pool].reverse();
    for (const day of ['2026-09-01', '2026-10-15', '2027-03-02']) {
      expect(globalAnomalyForDay(day, shuffled).id).toBe(globalAnomalyForDay(day, pool).id);
    }
  });

  it(`não repete nenhuma anomalia em menos de ${ANOMALY_NO_REPEAT_DAYS} dias (400 dias seguidos)`, () => {
    const lastSeen = new Map<string, number>();
    for (let i = 0; i < 400; i++) {
      const id = globalAnomalyForDay(addDays('2026-09-01', i), pool).id;
      const prev = lastSeen.get(id);
      if (prev !== undefined) expect(i - prev, id).toBeGreaterThanOrEqual(ANOMALY_NO_REPEAT_DAYS);
      lastSeen.set(id, i);
    }
    expect(lastSeen.size).toBe(pool.length);
  });

  it('dia anterior à contagem ainda devolve uma anomalia', () => {
    expect(pool.map((a) => a.id)).toContain(globalAnomalyForDay('2026-01-01', pool).id);
  });
});

describe('pickAnomaly', () => {
  const mixed = [...Array.from({ length: 25 }, (_, i) => make(i)), ...Array.from({ length: 5 }, (_, i) => make(30 + i, 'java', 'Avançado'))];

  it('nível Base de qualquer era vale para todos; acima de Base só em era aberta', () => {
    let fallbacks = 0;
    for (let i = 0; i < 200; i++) {
      const day = addDays('2026-09-01', i);
      const global = globalAnomalyForDay(day, mixed);
      const closed = pickAnomaly(day, mixed, new Set());
      const opened = pickAnomaly(day, mixed, new Set(['java']));
      expect(opened.anomaly.id).toBe(global.id);
      expect(closed.anomaly.level).toBe('Base');
      if (global.level !== 'Base') {
        fallbacks++;
        expect(closed.fallback).toBe(true);
      } else {
        expect(closed.anomaly.id).toBe(global.id);
      }
    }
    expect(fallbacks).toBeGreaterThan(0);
  });
});

describe('pickAnomaly: não repete até ver todas da ilha (Etapa 15A)', () => {
  // 12 de Lógica, 12 de Banco de Dados e 5 de Java, todas Base.
  const eras = [
    ...Array.from({ length: 12 }, (_, i) => make(i, 'logica')),
    ...Array.from({ length: 12 }, (_, i) => make(20 + i, 'banco-de-dados')),
    ...Array.from({ length: 5 }, (_, i) => make(40 + i, 'java')),
  ];

  it('quem conserta todo dia não vê a mesma anomalia de uma ilha antes de ver todas dela', () => {
    const history = new Map<string, number>();
    const byEra = new Map<string, string[]>();
    for (let i = 0; i < 400; i++) {
      const { anomaly } = pickAnomaly(addDays('2026-09-01', i), eras, new Set(), history);
      history.set(anomaly.id, (history.get(anomaly.id) ?? 0) + 1);
      const seq = byEra.get(anomaly.era) ?? [];
      seq.push(anomaly.id);
      byEra.set(anomaly.era, seq);
    }
    for (const [era, seq] of byEra) {
      const size = eras.filter((a) => a.era === era).length;
      // Em cada volta completa (size seguidas), nenhuma se repete.
      for (let start = 0; start + size <= seq.length; start += size) {
        expect(new Set(seq.slice(start, start + size)).size, `${era} volta ${start / size + 1}`).toBe(size);
      }
    }
  });

  it('sem histórico, é a mesma anomalia para todos; com histórico, troca só para quem já viu', () => {
    const day = '2026-10-10';
    const global = pickAnomaly(day, eras, new Set()).anomaly;
    expect(global.id).toBe(globalAnomalyForDay(day, eras).id);
    const seenIt = pickAnomaly(day, eras, new Set(), new Map([[global.id, 1]])).anomaly;
    expect(seenIt.id).not.toBe(global.id);
    expect(seenIt.era).toBe(global.era);
    // Determinística: o mesmo histórico dá a mesma escolha no mesmo dia.
    expect(pickAnomaly(day, eras, new Set(), new Map([[global.id, 1]])).anomaly.id).toBe(seenIt.id);
  });

  it('a reserva Base de quem não abriu a era também não repete', () => {
    const withHard = [...eras, ...Array.from({ length: 30 }, (_, i) => make(60 + i, 'php', 'Avançado'))];
    const history = new Map<string, number>();
    const seen: string[] = [];
    for (let i = 0; i < 300; i++) {
      const pick = pickAnomaly(addDays('2026-09-01', i), withHard, new Set(), history);
      expect(pick.anomaly.level).toBe('Base');
      if (pick.fallback) seen.push(pick.anomaly.id);
      history.set(pick.anomaly.id, (history.get(pick.anomaly.id) ?? 0) + 1);
    }
    expect(seen.length).toBeGreaterThan(0);
    // Nenhuma anomalia foi vista 2 vezes a mais que outra da mesma ilha.
    for (const era of ['logica', 'banco-de-dados', 'java']) {
      const counts = eras.filter((a) => a.era === era).map((a) => history.get(a.id) ?? 0);
      expect(Math.max(...counts) - Math.min(...counts), era).toBeLessThanOrEqual(1);
    }
  });
});
