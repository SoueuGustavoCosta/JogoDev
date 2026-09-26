import type { FragmentEntry, Progress } from './types';

/**
 * Fragmentos Temporais (◆), Etapa 9. O saldo nunca é guardado: é sempre calculado a partir
 * do histórico de lançamentos (ganhos positivos, gastos negativos), cada um com id único.
 *
 * - Ganhos da Anomalia do Dia não são copiados para o histórico: saem direto de
 *   `progress.anomalies` com o id `anomaly:<dia>` (uma fonte só, nada para dessincronizar).
 * - Compra: id `buy:<item>`. Comprar o mesmo item em dois aparelhos cobra uma vez só.
 * - Prêmio de evento: id `grant:<item>`, valor 0 (o item vem de graça, sem mexer no saldo).
 */

export const ANOMALY_ENTRY_PREFIX = 'anomaly:';
export const PURCHASE_ENTRY_PREFIX = 'buy:';
export const GRANT_ENTRY_PREFIX = 'grant:';

/** Histórico completo: os lançamentos guardados mais os ganhos das anomalias, sem repetir id. */
export function fragmentHistory(progress: Progress): FragmentEntry[] {
  const byId = new Map<string, FragmentEntry>();
  for (const [day, r] of Object.entries(progress.anomalies ?? {})) {
    if (!r || !r.fragments) continue;
    const id = `${ANOMALY_ENTRY_PREFIX}${day}`;
    byId.set(id, { id, amount: r.fragments, at: r.solvedAt });
  }
  for (const e of progress.fragmentLedger ?? []) {
    if (e && !byId.has(e.id)) byId.set(e.id, e);
  }
  return [...byId.values()].sort(compareEntries);
}

function compareEntries(a: FragmentEntry, b: FragmentEntry): number {
  if (a.at !== b.at) return a.at < b.at ? -1 : 1;
  // No mesmo instante, ganhos antes de gastos; depois pelo id (ordem sempre a mesma).
  if (a.amount !== b.amount) return b.amount - a.amount;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Saldo de ◆, percorrendo o histórico em ordem de data. Nunca fica negativo: se dois
 * aparelhos gastaram o mesmo saldo antes de sincronizar, o gasto que passar do que havia
 * naquele momento é perdoado (o viajante fica com o item e com saldo 0), em vez de virar
 * dívida que comeria os próximos ganhos.
 */
export function fragmentBalance(progress: Progress): number {
  let balance = 0;
  for (const e of fragmentHistory(progress)) balance = Math.max(0, balance + e.amount);
  return balance;
}

/** Total já ganho (só os lançamentos positivos). */
export function fragmentsEarned(progress: Progress): number {
  return fragmentHistory(progress).reduce((sum, e) => sum + Math.max(0, e.amount), 0);
}

/** Itens do viajante: comprados ou ganhos em evento. */
export function ownedCosmeticIds(progress: Progress): Set<string> {
  const owned = new Set<string>();
  for (const e of progress.fragmentLedger ?? []) {
    if (e?.itemId && (e.id.startsWith(PURCHASE_ENTRY_PREFIX) || e.id.startsWith(GRANT_ENTRY_PREFIX))) owned.add(e.itemId);
  }
  return owned;
}

export type SpendResult =
  | { ok: true; progress: Progress }
  | { ok: false; reason: 'insufficient' | 'owned' | 'invalid' };

/** Compra um item: lança o gasto `buy:<item>` se houver saldo e o item ainda não for do viajante. */
export function purchaseItem(progress: Progress, params: { itemId: string; price: number; at: string }): SpendResult {
  const { itemId, price, at } = params;
  if (!itemId || !Number.isInteger(price) || price < 0) return { ok: false, reason: 'invalid' };
  if (ownedCosmeticIds(progress).has(itemId)) return { ok: false, reason: 'owned' };
  if (fragmentBalance(progress) < price) return { ok: false, reason: 'insufficient' };
  // Gasto logo depois do último lançamento, se o relógio do aparelho estiver atrasado:
  // assim ele nunca é contado antes dos ganhos que o pagaram.
  const last = fragmentHistory(progress).at(-1)?.at ?? '';
  const entry: FragmentEntry = { id: `${PURCHASE_ENTRY_PREFIX}${itemId}`, amount: -price, at: at > last ? at : last, itemId };
  return { ok: true, progress: { ...progress, fragmentLedger: [...(progress.fragmentLedger ?? []), entry] } };
}

/** Dá um item de evento (sem custo). Idempotente. */
export function grantItem(progress: Progress, params: { itemId: string; at: string }): Progress {
  if (ownedCosmeticIds(progress).has(params.itemId)) return progress;
  const entry: FragmentEntry = { id: `${GRANT_ENTRY_PREFIX}${params.itemId}`, amount: 0, at: params.at, itemId: params.itemId };
  return { ...progress, fragmentLedger: [...(progress.fragmentLedger ?? []), entry] };
}

/** Ganho de ◆ fora da anomalia (ex.: eventos). Idempotente pelo id. */
export function earnFragments(progress: Progress, entry: { id: string; amount: number; at: string }): Progress {
  if (entry.amount <= 0 || (progress.fragmentLedger ?? []).some((e) => e.id === entry.id)) return progress;
  return { ...progress, fragmentLedger: [...(progress.fragmentLedger ?? []), { id: entry.id, amount: entry.amount, at: entry.at }] };
}

/**
 * Merge entre aparelhos (decisão do autor): união dos lançamentos por id, para não perder
 * nem duplicar ◆. Se o mesmo id aparecer dos dois lados, fica o mais antigo.
 */
export function mergeFragmentLedgers(
  a: FragmentEntry[] | undefined,
  b: FragmentEntry[] | undefined,
): FragmentEntry[] | undefined {
  if (!a || !b) return a ?? b;
  const byId = new Map<string, FragmentEntry>();
  for (const e of [...a, ...b]) {
    if (!e) continue;
    const seen = byId.get(e.id);
    if (!seen || e.at < seen.at) byId.set(e.id, e);
  }
  return [...byId.values()].sort(compareEntries);
}
