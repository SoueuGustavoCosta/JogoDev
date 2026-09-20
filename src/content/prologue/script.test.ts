import { describe, expect, it } from 'vitest';
import { validateScript } from '@/domain/prologue';
import { prologueScript } from './script';

describe('roteiro do prólogo', () => {
  it('não tem passos órfãos nem becos sem saída', () => {
    expect(validateScript(prologueScript)).toEqual([]);
  });

  it('termina no salto para a Era dos Dados', () => {
    expect(Object.values(prologueScript.steps).some((s) => s.warp)).toBe(true);
  });
});
