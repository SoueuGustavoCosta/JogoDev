import type { WebMission, WebPortfolio } from '@/domain/webEra';

/** O que cada motor pode pedir ao palco (runner). */
export type MissionApi = {
  /** Missão vencida. */
  win: () => void;
  /** Missão perdida (o palco tira um coração). */
  fail: (message: string) => void;
  /** Um toque errado: flash vermelho e vibração curta. */
  err: () => void;
  /** Um acerto: flash verde. */
  ok: () => void;
  /** Mostra a dica da Sintaxe. */
  hint: () => void;
  toast: (message: string) => void;
  /** Guarda no portfólio o que o viajante escreveu (missões de código com `capture`). */
  capture: (patch: Partial<WebPortfolio>) => void;
};

export type EngineProps<M extends WebMission> = { mission: M; api: MissionApi };

/** Embaralha sem mexer no original. */
export function shuffle<T>(items: readonly T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export const reducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
