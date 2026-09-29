import { modPorque } from './porque';
import { modSintaxe } from './sintaxe';
import { modTiposdados } from './tiposdados';
import { modRelacional } from './relacional';
import { modCreate } from './create';
import { modInsert } from './insert';
import { modWhere } from './where';
import { modUpdate } from './update';
import { modJoin } from './join';
import { modAgg } from './agg';
import { modSubconsultas } from './subconsultas';
import { foldModules } from '@/domain/trail/fold';
import type { Module } from '@/domain/trail/types';

/**
 * "Sintaxe e indentação" com "Tipos de dados" dentro (Etapa 14A): o módulo fundido fica
 * com o id `sintaxe`; as perguntas de `tiposdados` viram `tiposdados-q1`... (ver
 * `foldModules` e `content/relocations.ts`, que leva o progresso junto).
 */
export const modSintaxeETipos: Module = foldModules(modSintaxe, modTiposdados, {
  short: 'Sintaxe e tipos de dados',
  title: 'Sintaxe, indentação e tipos de dados',
  lead: 'O PostgreSQL entende SQL de qualquer jeito. Pessoas, não. Aprenda as regras, as boas maneiras e o tipo certo para cada coluna.',
});

/**
 * Os 10 módulos principais da Era dos Dados (Etapa 14A). Os 22 módulos migrados de
 * legacy/Trilha_PostgreSQL_com_Laboratorio.html continuam todos no jogo: 2 foram fundidos
 * (sintaxe + tiposdados aqui; tipos + arquitetura na Lua da Modelagem) e o resto foi para
 * as luas `dados-modelagem` e `dados-guardiao`, na mesma ordem relativa de antes.
 */
export const bancoDeDadosModules: Module[] = [
  modPorque,
  modRelacional,
  modSintaxeETipos,
  modCreate,
  modInsert,
  modWhere,
  modUpdate,
  modJoin,
  modAgg,
  modSubconsultas,
];
