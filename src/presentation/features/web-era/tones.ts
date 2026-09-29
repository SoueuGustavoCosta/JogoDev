import type { WebTone } from '@/domain/webEra';

/** Cor de apoio (balde, peça) nos tokens da Era da Web (`design-system/tokens.css`). */
export function toneVar(tone: WebTone): string {
  return `var(--web-${tone})`;
}
