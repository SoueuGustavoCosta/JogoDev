import { describe, expect, it } from 'vitest';
import { ANOMALY_NO_REPEAT_DAYS, anomalySchema } from '@/domain/anomaly';
import { fillAnswerMatches } from '@/domain/progress';
import { anomalies } from './anomalies';
import { trailRegistry } from './registry';

describe('banco de Anomalias do Dia', () => {
  it(`tem ao menos ${ANOMALY_NO_REPEAT_DAYS} (o sorteio não repete em ${ANOMALY_NO_REPEAT_DAYS} dias) e ids únicos`, () => {
    expect(anomalies.length).toBeGreaterThanOrEqual(ANOMALY_NO_REPEAT_DAYS);
    expect(new Set(anomalies.map((a) => a.id)).size).toBe(anomalies.length);
  });

  it('cobre todas as ilhas e só ilhas que existem', () => {
    const eras = new Set(trailRegistry.map((t) => t.id));
    for (const a of anomalies) expect(eras.has(a.era), a.id).toBe(true);
    for (const era of eras) expect(anomalies.some((a) => a.era === era), era).toBe(true);
  });

  it('a maioria é de nível Base (vale para quem ainda não abriu a era)', () => {
    expect(anomalies.filter((a) => a.level === 'Base').length).toBeGreaterThanOrEqual(anomalies.length / 2);
  });

  for (const anomaly of anomalies) {
    it(`${anomaly.id}: formato válido e história com o Eco`, () => {
      expect(() => anomalySchema.parse(anomaly)).not.toThrow();
      expect(anomaly.story).toMatch(/Eco/);
      const c = anomaly.challenge;
      if (!('t' in c) && 'fill' in c) {
        expect(fillAnswerMatches(c.accept, c.accept[0])).toBe(true);
        for (const w of c.wrong ?? []) expect(fillAnswerMatches(c.accept, w), w).toBe(false);
      }
    });
  }
});
