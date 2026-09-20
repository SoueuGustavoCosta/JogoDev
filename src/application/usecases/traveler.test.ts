import { describe, expect, it } from 'vitest';
import type { Progress } from '@/domain/progress';
import type { ProgressRepository } from '../ports';
import { completePrologue, getTraveler, markPrologueSkipped } from './traveler';

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

describe('traveler', () => {
  it('defaults to "Viajante" with the prologue unseen', () => {
    expect(getTraveler({ repository: new Memory() })).toEqual({ name: 'Viajante', prologueSeen: false });
  });

  it('saves a trimmed name capped at 20 characters and marks the prologue seen', () => {
    const repository = new Memory();
    const name = completePrologue({ repository }, { name: '  Gustavo Costa Gomes Junior  ' });
    expect(name).toHaveLength(20);
    expect(getTraveler({ repository })).toEqual({ name, prologueSeen: true });
  });

  it('turns an empty name into "Viajante"', () => {
    const repository = new Memory();
    expect(completePrologue({ repository }, { name: '   ' })).toBe('Viajante');
  });

  it('skipping keeps the default name but marks the prologue seen', () => {
    const repository = new Memory();
    markPrologueSkipped({ repository });
    expect(getTraveler({ repository })).toEqual({ name: 'Viajante', prologueSeen: true });
  });
});
