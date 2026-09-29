import { describe, expect, it } from 'vitest';
import { cometArrived, cometBadgeFor, cometOfTrail, formatCountdown, pastComets, skyAt } from './rules';
import { cometSchema } from './schema';
import type { Comet } from './types';

// Dados de exemplo: dois cometas de 14 dias com 1 dia de céu limpo entre eles.
const a: Comet = { id: 'a', trailId: 'cometa-a', name: 'A', from: '2026-10-12T00:00:00-03:00', to: '2026-10-26T00:00:00-03:00', rareBadgeId: 'a-rara', commonBadgeId: 'a-comum' };
const b: Comet = { id: 'b', trailId: 'cometa-b', name: 'B', from: '2026-10-27T00:00:00-03:00', to: '2026-11-10T00:00:00-03:00', rareBadgeId: 'b-rara', commonBadgeId: 'b-comum' };
const calendar = [b, a];
const at = (iso: string) => new Date(iso);

describe('céu dos cometas', () => {
  it('antes do primeiro: céu limpo com a hora em que ele chega', () => {
    const sky = skyAt(calendar, at('2026-10-11T00:00:00-03:00'));
    expect(sky).toEqual({ kind: 'gap', next: a, untilMs: 24 * 3600 * 1000 });
  });

  it('com o cometa no céu: posição pelo tempo, da direita (0) para a esquerda (1)', () => {
    const start = skyAt(calendar, at('2026-10-12T00:00:00-03:00'));
    expect(start.kind === 'comet' && start.progress).toBe(0);
    const middle = skyAt(calendar, at('2026-10-19T00:00:00-03:00'));
    expect(middle.kind === 'comet' && middle.comet).toBe(a);
    expect(middle.kind === 'comet' && middle.progress).toBeCloseTo(0.5);
    expect(middle.kind === 'comet' && middle.urgent).toBe(false);
  });

  it('nas últimas 24 horas fica urgente', () => {
    const late = skyAt(calendar, at('2026-10-25T01:00:00-03:00'));
    expect(late.kind === 'comet' && late.urgent).toBe(true);
    expect(late.kind === 'comet' && late.remainingMs).toBe(23 * 3600 * 1000);
  });

  it('no fim ele some; no intervalo, o céu mostra quando chega o próximo', () => {
    const gap = skyAt(calendar, at('2026-10-26T00:00:00-03:00'));
    expect(gap).toEqual({ kind: 'gap', next: b, untilMs: 24 * 3600 * 1000 });
  });

  it('depois do último: novos cometas em breve', () => {
    expect(skyAt(calendar, at('2026-11-10T00:00:00-03:00'))).toEqual({ kind: 'soon' });
    expect(skyAt([], at('2026-11-10T00:00:00-03:00'))).toEqual({ kind: 'soon' });
  });

  it('Arquivo da AVT: só os que já passaram, do mais recente para o mais antigo', () => {
    expect(pastComets(calendar, at('2026-10-20T00:00:00-03:00'))).toEqual([]);
    expect(pastComets(calendar, at('2026-10-26T00:00:00-03:00'))).toEqual([a]);
    expect(pastComets(calendar, at('2026-12-01T00:00:00-03:00'))).toEqual([b, a]);
  });

  it('insígnia: rara durante o cometa, comum pelo Arquivo', () => {
    expect(cometBadgeFor(a, at('2026-10-25T23:59:00-03:00'))).toBe('a-rara');
    expect(cometBadgeFor(a, at('2026-10-26T00:00:00-03:00'))).toBe('a-comum');
    expect(cometOfTrail(calendar, 'cometa-b')).toBe(b);
  });

  it('a trilha do cometa só abre quando ele chega', () => {
    expect(cometArrived(a, at('2026-10-11T23:59:00-03:00'))).toBe(false);
    expect(cometArrived(a, at('2026-10-12T00:00:00-03:00'))).toBe(true);
    expect(cometArrived(a, at('2027-01-01T00:00:00-03:00'))).toBe(true);
  });

  it('contagem regressiva em dias, horas e minutos', () => {
    expect(formatCountdown((3 * 24 * 60 + 4 * 60 + 12) * 60000)).toBe('3d 04h 12m');
    expect(formatCountdown(59 * 60000)).toBe('00h 59m');
    expect(formatCountdown(-5)).toBe('00h 00m');
  });

  it('esquema: datas com fuso, from antes de to, insígnias diferentes', () => {
    expect(() => cometSchema.parse(a)).not.toThrow();
    expect(() => cometSchema.parse({ ...a, from: '2026-10-12' })).toThrow();
    expect(() => cometSchema.parse({ ...a, to: a.from })).toThrow();
    expect(() => cometSchema.parse({ ...a, commonBadgeId: 'a-rara' })).toThrow();
  });
});
