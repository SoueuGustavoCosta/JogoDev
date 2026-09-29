import { describe, expect, it } from 'vitest';
import { trailRegistry } from './registry';

/**
 * O enunciado (`q`) e as alternativas (`options`) aparecem como texto puro na tela (só o
 * `explain` aceita <code>/<b>). Uma tag aqui apareceria escrita para o aluno.
 */
const HTML = /<\/?(code|b|i|em|strong|br)\b[^>]*>|&(lt|gt|amp|quot);/;

describe('enunciados e alternativas são texto puro', () => {
  for (const trail of trailRegistry) {
    it(trail.id, () => {
      for (const mod of trail.modules) {
        for (const item of mod.quiz) {
          expect(item.q, `${mod.id}/${item.id}`).not.toMatch(HTML);
          for (const o of 'options' in item ? item.options : []) expect(o, `${mod.id}/${item.id}`).not.toMatch(HTML);
        }
      }
    });
  }
});
