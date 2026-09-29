import type { Module, QuizItem } from './types';

/** Prefixo das perguntas de um módulo fundido dentro do módulo que o absorveu. */
export function foldQuizIdPrefix(absorbed: Module): string {
  return `${absorbed.id}-`;
}

/**
 * Funde dois módulos num só (Etapa 14A): o módulo fundido fica com o id de `host` e
 * recebe, depois dos blocos dele, um título e os blocos de `absorbed`. Nada se perde:
 * todas as perguntas dos dois vêm junto. As de `absorbed` ganham o prefixo
 * `foldQuizIdPrefix` (os dois módulos tinham `q1`, e ids não se repetem num módulo); a
 * migração do progresso (`ModuleRelocation.fold`) leva os resultados para esses ids.
 */
export function foldModules(
  host: Module,
  absorbed: Module,
  overrides: Partial<Pick<Module, 'short' | 'title' | 'lead'>> = {},
): Module {
  const offset = host.blocks.length + 1;
  const prefix = foldQuizIdPrefix(absorbed);
  return {
    ...host,
    ...overrides,
    blocks: [...host.blocks, { t: 'h', x: absorbed.title }, ...absorbed.blocks],
    quiz: [
      ...host.quiz,
      ...absorbed.quiz.map(
        (item): QuizItem => ({
          ...item,
          id: prefix + item.id,
          ...(item.afterBlock === undefined ? {} : { afterBlock: item.afterBlock + offset }),
        }),
      ),
    ],
  };
}
