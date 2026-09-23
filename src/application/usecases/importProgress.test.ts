import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type { ProgressRepository } from '../ports';
import { exportProgress } from './exportProgress';
import { importProgress } from './importProgress';

class Memory implements ProgressRepository {
  data: Progress | null = null;
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

const done = (trailId: string, moduleId: string) => ({
  trailId,
  trophyAwarded: false,
  missionsCompleted: {},
  modules: { [moduleId]: { moduleId, completed: true, quizResults: {} } },
});

describe('importProgress', () => {
  it('junta o código importado com o que já está no aparelho', () => {
    const source = new Memory();
    source.save({ version: 1, trails: { logica: done('logica', 'origem') } });
    const code = exportProgress({ repository: source });

    const target = new Memory();
    target.save({ version: 1, trails: { 'banco-de-dados': done('banco-de-dados', 'porque') }, travelerUuid: 'daqui' });
    expect(importProgress({ repository: target }, { data: code })).toEqual({ ok: true });

    expect(Object.keys(target.load()!.trails).sort()).toEqual(['banco-de-dados', 'logica']);
    expect(target.load()?.travelerUuid).toBe('daqui');
  });

  it('código inválido não mexe em nada', () => {
    const target = new Memory();
    target.save({ version: 1, trails: { logica: done('logica', 'origem') } });
    const before = target.load();
    expect(importProgress({ repository: target }, { data: 'lixo!!' }).ok).toBe(false);
    expect(target.load()).toBe(before);
  });
});
