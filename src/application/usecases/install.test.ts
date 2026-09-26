import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import { mergeProgress } from '@/domain/progress';
import type { AnalyticsPort, ProgressRepository } from '../ports';
import { markInstallOffered, shouldOfferInstall } from './install';

class Memory implements ProgressRepository {
  constructor(public data: Progress | null) {}
  load() {
    return this.data;
  }
  save(p: Progress) {
    this.data = p;
  }
  clear() {
    this.data = null;
  }
}

const solved = { '2026-09-26': { anomalyId: 'a', tries: 1, solvedAt: 'x', xp: 30, fragments: 10 } };

describe('Adicionar à tela inicial', () => {
  it('aparece uma vez, depois da primeira anomalia, e nunca no app instalado', () => {
    const repository = new Memory({ version: 1, trails: {} });
    expect(shouldOfferInstall({ repository }, { standalone: false })).toBe(false);
    repository.data = { version: 1, trails: {}, anomalies: solved };
    expect(shouldOfferInstall({ repository }, { standalone: true })).toBe(false);
    expect(shouldOfferInstall({ repository }, { standalone: false })).toBe(true);
    const events: string[] = [];
    const analytics: AnalyticsPort = { track: (e) => events.push(e) };
    markInstallOffered({ repository, analytics }, { platform: 'ios', now: new Date('2026-09-26T12:00:00Z') });
    expect(events).toEqual(['install_prompt_shown']);
    expect(shouldOfferInstall({ repository }, { standalone: false })).toBe(false);
    // Outro aparelho que já mostrou: o merge guarda.
    expect(mergeProgress({ version: 1, trails: {} }, repository.data as Progress).installPromptShownAt).toBe('2026-09-26T12:00:00.000Z');
  });
});
