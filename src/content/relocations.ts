import type { ModuleRelocation } from '@/domain/progress/relocate';
import { foldQuizIdPrefix } from '@/domain/trail/fold';
import type { Module } from '@/domain/trail/types';
import { modTiposdados } from './trails/banco-de-dados/modules/tiposdados';
import { modArquitetura } from './trails/dados-modelagem/modules/arquitetura';

function fold(absorbed: Module, toModule: string): NonNullable<ModuleRelocation['fold']> {
  return { toModule, quizIdPrefix: foldQuizIdPrefix(absorbed), legacyQuizOrder: absorbed.quiz.map((q) => q.id) };
}

/**
 * Módulos que mudaram de trilha. O progresso de cada um sai do lugar antigo e vai para o
 * novo, uma vez, em toda leitura e gravação (ver `relocateModules`). Esta lista só cresce:
 * tirar uma linha deixaria preso no lugar antigo o progresso de quem ainda não abriu o app.
 *
 * Etapa 14A: a Era dos Dados tinha 22 módulos e virou ilha principal (10) + Lua da
 * Modelagem (5) + Lua do Guardião (5). `tiposdados` foi fundido em `sintaxe`, e
 * `arquitetura` em `tipos`.
 */
export const moduleRelocations: readonly ModuleRelocation[] = [
  { fromTrail: 'banco-de-dados', toTrail: 'banco-de-dados', moduleId: 'tiposdados', fold: fold(modTiposdados, 'sintaxe') },
  { fromTrail: 'banco-de-dados', toTrail: 'dados-modelagem', moduleId: 'tipos' },
  { fromTrail: 'banco-de-dados', toTrail: 'dados-modelagem', moduleId: 'arquitetura', fold: fold(modArquitetura, 'tipos') },
  { fromTrail: 'banco-de-dados', toTrail: 'dados-modelagem', moduleId: 'interface' },
  { fromTrail: 'banco-de-dados', toTrail: 'dados-modelagem', moduleId: 'mer' },
  { fromTrail: 'banco-de-dados', toTrail: 'dados-modelagem', moduleId: 'algebra' },
  { fromTrail: 'banco-de-dados', toTrail: 'dados-modelagem', moduleId: 'norm' },
  { fromTrail: 'banco-de-dados', toTrail: 'dados-guardiao', moduleId: 'indices' },
  { fromTrail: 'banco-de-dados', toTrail: 'dados-guardiao', moduleId: 'transacoes' },
  { fromTrail: 'banco-de-dados', toTrail: 'dados-guardiao', moduleId: 'views' },
  { fromTrail: 'banco-de-dados', toTrail: 'dados-guardiao', moduleId: 'seguranca' },
  { fromTrail: 'banco-de-dados', toTrail: 'dados-guardiao', moduleId: 'projeto' },
];
