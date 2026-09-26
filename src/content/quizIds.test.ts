import { describe, expect, it } from 'vitest';
import { QUIZ_ID_PATTERN } from '@/domain/trail';
import { trailRegistry } from './registry';

/**
 * Ids publicados na Etapa 3.5 (q1..qN, na ordem das perguntas daquele dia). O progresso do
 * quiz é guardado por id, então um id publicado nunca pode sumir nem ser reaproveitado:
 * a pergunta pode mudar de lugar ou de formato, mas leva o id junto. Pergunta nova ganha
 * id novo (q{N+1}, ...). Esta lista só cresce.
 */
const PUBLISHED_QUIZ_COUNT: Record<string, number> = {
  'banco-de-dados/porque': 5,
  'banco-de-dados/tipos': 5,
  'banco-de-dados/arquitetura': 4,
  'banco-de-dados/interface': 3,
  'banco-de-dados/sintaxe': 4,
  'banco-de-dados/tiposdados': 3,
  'banco-de-dados/relacional': 4,
  'banco-de-dados/create': 5,
  'banco-de-dados/insert': 3,
  'banco-de-dados/where': 4,
  'banco-de-dados/update': 3,
  'banco-de-dados/mer': 4,
  'banco-de-dados/join': 4,
  'banco-de-dados/algebra': 4,
  'banco-de-dados/agg': 4,
  'banco-de-dados/subconsultas': 3,
  'banco-de-dados/norm': 5,
  'banco-de-dados/indices': 4,
  'banco-de-dados/transacoes': 4,
  'banco-de-dados/views': 3,
  'banco-de-dados/seguranca': 4,
  'banco-de-dados/projeto': 4,
  'logica/origem': 5,
  'logica/ola': 5,
  'logica/variaveis': 6,
  'logica/operadores': 6,
  'logica/decisoes': 8,
  'logica/loops': 6,
  'logica/arrays': 6,
  'logica/funcoes': 6,
  'logica/web': 5,
  'logica/velha': 4,
  'git-github/origem': 3,
  'git-github/conceitos': 3,
  'git-github/ciclo': 3,
  'git-github/branches': 3,
  'git-github/desfazer': 3,
  'git-github/github': 3,
  'git-github/boaspraticas': 3,
  'python/nascimento-python': 6,
  'python/sintaxe-e-tipos': 5,
  'python/operadores-condicoes': 5,
  'python/loops-python': 5,
  'python/colecoes': 5,
  'python/funcoes-python': 5,
  'python/modulos-e-arquivos': 5,
  'python/poo-python': 5,
  'java/nascimento-java': 6,
  'java/sintaxe-tipos-java': 5,
  'java/operadores-condicoes-java': 5,
  'java/loops-java': 5,
  'java/arrays-colecoes-java': 5,
  'java/metodos-java': 5,
  'java/classes-objetos-java': 5,
  'java/heranca-interfaces-java': 5,
  'php/nascimento-php': 5,
  'php/sintaxe-tipos-php': 5,
  'php/operadores-condicoes-php': 5,
  'php/loops-php': 5,
  'php/arrays-php': 5,
  'php/funcoes-php': 5,
  'php/poo-php': 5,
  'php/superglobais-web-php': 5,
};

describe('ids das perguntas', () => {
  for (const trail of trailRegistry) {
    for (const mod of trail.modules) {
      it(`${trail.id}/${mod.id}`, () => {
        const ids = mod.quiz.map((item) => item.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) expect(id).toMatch(QUIZ_ID_PATTERN);
        const published = PUBLISHED_QUIZ_COUNT[`${trail.id}/${mod.id}`] ?? 0;
        for (let n = 1; n <= published; n++) expect(ids).toContain(`q${n}`);
      });
    }
  }

  it('todo módulo publicado continua existindo', () => {
    const current = new Set(trailRegistry.flatMap((t) => t.modules.map((m) => `${t.id}/${m.id}`)));
    for (const key of Object.keys(PUBLISHED_QUIZ_COUNT)) expect(current.has(key), key).toBe(true);
  });
});
