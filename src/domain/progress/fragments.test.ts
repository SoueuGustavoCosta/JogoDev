import { describe, expect, it } from 'vitest';
import { createEmptyProgress } from './factory';
import {
  earnFragments,
  fragmentBalance,
  fragmentHistory,
  fragmentsEarned,
  grantItem,
  mergeFragmentLedgers,
  ownedCosmeticIds,
  purchaseItem,
} from './fragments';
import { mergeProgress } from './merge';
import type { AnomalyResult, Progress } from './types';

function anomaly(day: string, fragments = 10): [string, AnomalyResult] {
  return [day, { anomalyId: `a-${day}`, tries: 1, solvedAt: `${day}T12:00:00.000Z`, xp: 30, fragments }];
}

function withAnomalies(...days: string[]): Progress {
  return { ...createEmptyProgress(), anomalies: Object.fromEntries(days.map((d) => anomaly(d))) };
}

function buy(progress: Progress, itemId: string, price: number, at = '2026-10-10T00:00:00.000Z'): Progress {
  const r = purchaseItem(progress, { itemId, price, at });
  if (!r.ok) throw new Error(r.reason);
  return r.progress;
}

describe('Fragmentos Temporais: saldo a partir do histórico', () => {
  it('progresso sem histórico (salvo antes da Etapa 9) começa com saldo 0', () => {
    expect(fragmentBalance(createEmptyProgress())).toBe(0);
    expect(fragmentHistory(createEmptyProgress())).toEqual([]);
  });

  it('os ganhos das anomalias já registradas contam, sem migração', () => {
    const p = withAnomalies('2026-09-26', '2026-09-27');
    expect(fragmentBalance(p)).toBe(20);
    expect(fragmentHistory(p).map((e) => e.id)).toEqual(['anomaly:2026-09-26', 'anomaly:2026-09-27']);
  });

  it('comprar desconta do saldo e o item passa a ser do viajante', () => {
    const p = buy(withAnomalies('2026-09-26', '2026-09-27', '2026-09-28'), 'moldura-neon', 25);
    expect(fragmentBalance(p)).toBe(5);
    expect(fragmentsEarned(p)).toBe(30);
    expect(ownedCosmeticIds(p).has('moldura-neon')).toBe(true);
  });

  it('não compra sem saldo, nem o mesmo item duas vezes', () => {
    const p = withAnomalies('2026-09-26');
    expect(purchaseItem(p, { itemId: 'x', price: 11, at: '2026-10-01T00:00:00.000Z' })).toEqual({ ok: false, reason: 'insufficient' });
    const bought = buy(p, 'x', 10);
    expect(purchaseItem(withAnomalies('2026-09-26', '2026-09-27'), { itemId: 'x', price: 1, at: 'z' }).ok).toBe(true);
    expect(purchaseItem({ ...bought, anomalies: withAnomalies('2026-09-26', '2026-09-27').anomalies }, { itemId: 'x', price: 1, at: 'z' })).toEqual({
      ok: false,
      reason: 'owned',
    });
  });

  it('recusa preço inválido', () => {
    const p = withAnomalies('2026-09-26');
    expect(purchaseItem(p, { itemId: 'x', price: -5, at: 'z' })).toEqual({ ok: false, reason: 'invalid' });
    expect(purchaseItem(p, { itemId: 'x', price: 1.5, at: 'z' })).toEqual({ ok: false, reason: 'invalid' });
  });

  it('o saldo nunca fica negativo, mesmo com um histórico que gasta mais do que tinha', () => {
    const p: Progress = {
      ...withAnomalies('2026-09-26'),
      fragmentLedger: [
        { id: 'buy:a', amount: -10, at: '2026-09-27T00:00:00.000Z', itemId: 'a' },
        { id: 'buy:b', amount: -10, at: '2026-09-27T00:00:01.000Z', itemId: 'b' },
      ],
    };
    expect(fragmentBalance(p)).toBe(0);
    // O gasto excedente é perdoado: o próximo ganho vale inteiro.
    const next = { ...p, anomalies: { ...p.anomalies, ...Object.fromEntries([anomaly('2026-09-28')]) } };
    expect(fragmentBalance(next)).toBe(10);
  });

  it('um gasto com relógio atrasado nunca é contado antes dos ganhos que o pagaram', () => {
    const p = buy(withAnomalies('2026-09-26'), 'x', 10, '2000-01-01T00:00:00.000Z');
    expect(fragmentBalance(p)).toBe(0);
    expect(fragmentBalance({ ...p, anomalies: { ...p.anomalies, ...Object.fromEntries([anomaly('2026-09-27')]) } })).toBe(10);
  });

  it('prêmio de evento dá o item sem mexer no saldo, e só uma vez', () => {
    const p = grantItem(withAnomalies('2026-09-26'), { itemId: 'coroa-eco', at: '2026-10-02T00:00:00.000Z' });
    expect(grantItem(p, { itemId: 'coroa-eco', at: 'z' })).toBe(p);
    expect(ownedCosmeticIds(p).has('coroa-eco')).toBe(true);
    expect(fragmentBalance(p)).toBe(10);
  });

  it('ganho de evento é idempotente pelo id', () => {
    const p = earnFragments(createEmptyProgress(), { id: 'event:eco-1', amount: 15, at: '2026-10-02T00:00:00.000Z' });
    expect(earnFragments(p, { id: 'event:eco-1', amount: 15, at: 'z' })).toBe(p);
    expect(fragmentBalance(p)).toBe(15);
  });
});

describe('Fragmentos Temporais: merge entre aparelhos', () => {
  it('une os lançamentos por id: não perde nem duplica ◆', () => {
    const base = withAnomalies('2026-09-26', '2026-09-27', '2026-09-28');
    const phone = buy(base, 'cabelo-espetado', 10, '2026-09-29T10:00:00.000Z');
    const laptop = buy(base, 'cor-aurora', 5, '2026-09-29T11:00:00.000Z');
    const merged = mergeProgress(phone, laptop);
    expect(merged.fragmentLedger?.map((e) => e.id)).toEqual(['buy:cabelo-espetado', 'buy:cor-aurora']);
    expect(fragmentBalance(merged)).toBe(15);
    expect(ownedCosmeticIds(merged)).toEqual(new Set(['cabelo-espetado', 'cor-aurora']));
    // Juntar de novo (qualquer ordem) não muda nada.
    expect(fragmentBalance(mergeProgress(merged, phone))).toBe(15);
    expect(fragmentBalance(mergeProgress(laptop, merged))).toBe(15);
  });

  it('o mesmo item comprado nos dois aparelhos é cobrado uma vez (fica o lançamento mais antigo)', () => {
    const base = withAnomalies('2026-09-26', '2026-09-27');
    const a = buy(base, 'x', 10, '2026-09-29T10:00:00.000Z');
    const b = buy(base, 'x', 10, '2026-09-29T09:00:00.000Z');
    const merged = mergeFragmentLedgers(a.fragmentLedger, b.fragmentLedger);
    expect(merged).toEqual([{ id: 'buy:x', amount: -10, at: '2026-09-29T09:00:00.000Z', itemId: 'x' }]);
    expect(fragmentBalance(mergeProgress(a, b))).toBe(10);
  });

  it('dois aparelhos que gastaram o mesmo saldo: fica com os dois itens e saldo 0, nunca negativo', () => {
    const base = withAnomalies('2026-09-26');
    const merged = mergeProgress(buy(base, 'a', 10, '2026-09-29T10:00:00.000Z'), buy(base, 'b', 10, '2026-09-29T11:00:00.000Z'));
    expect(fragmentBalance(merged)).toBe(0);
    expect(ownedCosmeticIds(merged).size).toBe(2);
  });

  it('cópia sem histórico não apaga o histórico da outra', () => {
    const bought = buy(withAnomalies('2026-09-26'), 'x', 4);
    expect(mergeProgress(createEmptyProgress(), bought).fragmentLedger).toEqual(bought.fragmentLedger);
    expect(mergeProgress(bought, createEmptyProgress()).fragmentLedger).toEqual(bought.fragmentLedger);
    expect('fragmentLedger' in mergeProgress(createEmptyProgress(), createEmptyProgress())).toBe(false);
  });

  it('cosméticos equipados vêm de primary, completando com secondary', () => {
    const a = { ...createEmptyProgress(), equippedCosmetics: { frame: 'm1' } };
    const b = { ...createEmptyProgress(), equippedCosmetics: { hair: 'c1' } };
    expect(mergeProgress(a, b).equippedCosmetics).toEqual({ frame: 'm1' });
    expect(mergeProgress(createEmptyProgress(), b).equippedCosmetics).toEqual({ hair: 'c1' });
  });
});
