import { modPorque } from './porque';
import { modTipos } from './tipos';
import { modArquitetura } from './arquitetura';
import { modInterface } from './interface';
import { modSintaxe } from './sintaxe';
import { modTiposdados } from './tiposdados';
import { modRelacional } from './relacional';
import { modCreate } from './create';
import { modInsert } from './insert';
import { modWhere } from './where';
import { modUpdate } from './update';
import { modMer } from './mer';
import { modJoin } from './join';
import { modAlgebra } from './algebra';
import { modAgg } from './agg';
import { modSubconsultas } from './subconsultas';
import { modNorm } from './norm';
import { modIndices } from './indices';
import { modTransacoes } from './transacoes';
import { modViews } from './views';
import { modSeguranca } from './seguranca';
import { modProjeto } from './projeto';
import type { Module } from '@/domain/trail/types';

/**
 * Ordem final dos 22 módulos, migrada de legacy/Trilha_PostgreSQL_com_Laboratorio.html
 * (ordem definida pela IIFE "EXPANSÃO UNIVERSITÁRIA" no protótipo original).
 */
export const bancoDeDadosModules: Module[] = [
  modPorque,
  modTipos,
  modArquitetura,
  modInterface,
  modSintaxe,
  modTiposdados,
  modRelacional,
  modCreate,
  modInsert,
  modWhere,
  modUpdate,
  modMer,
  modJoin,
  modAlgebra,
  modAgg,
  modSubconsultas,
  modNorm,
  modIndices,
  modTransacoes,
  modViews,
  modSeguranca,
  modProjeto,
];
