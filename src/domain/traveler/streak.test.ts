import { describe, expect, it } from 'vitest';
import { travelerLevel } from './streak';

describe('travelerLevel', () => {
  it('começa no nível 1 com 0 XP', () => {
    expect(travelerLevel(0)).toBe(1);
  });

  it('sobe de nível a cada 500 XP', () => {
    expect(travelerLevel(499)).toBe(1);
    expect(travelerLevel(500)).toBe(2);
    expect(travelerLevel(1200)).toBe(3);
  });
});
