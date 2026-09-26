import { describe, expect, it } from 'vitest';
import { checkPublishable, containsProfanity, MURAL_MAX_CODE } from './mural';

describe('Mural: publicação', () => {
  it('filtro básico de palavrões (com acento, maiúsculas e números no lugar de letras)', () => {
    expect(containsProfanity('echo "PORRA";')).toBe(true);
    expect(containsProfanity('// p0rr4 de calculadora')).toBe(true);
    expect(containsProfanity('$otário = 1;')).toBe(true);
    expect(containsProfanity('console.log("filho da puta")')).toBe(true);
  });

  it('não barra código normal (nem palavras que só contêm pedaços)', () => {
    expect(containsProfanity('if ($op == "+") { echo $a + $b; }')).toBe(false);
    expect(containsProfanity('const computador = "curioso"; // cuidado com o circuito')).toBe(false);
    expect(containsProfanity('echo $resultado;')).toBe(false);
  });

  it('vazio, grande demais ou com palavrão não publica', () => {
    expect(checkPublishable('  ')).toEqual({ ok: false, reason: 'empty' });
    expect(checkPublishable('<?php\n')).toEqual({ ok: false, reason: 'empty' });
    expect(checkPublishable('x'.repeat(MURAL_MAX_CODE + 1))).toEqual({ ok: false, reason: 'too-long' });
    expect(checkPublishable('echo "merda";')).toEqual({ ok: false, reason: 'profanity' });
    expect(checkPublishable('echo $a + $b;')).toEqual({ ok: true });
  });
});
