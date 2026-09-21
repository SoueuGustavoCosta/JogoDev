import { modOrigem } from './origem';
import { modOla } from './ola';
import { modVariaveis } from './variaveis';
import { modOperadores } from './operadores';
import { modDecisoes } from './decisoes';
import { modLoops } from './loops';
import { modArrays } from './arrays';
import { modFuncoes } from './funcoes';
import { modWeb } from './web';
import { modVelha } from './velha';
import type { Module } from '@/domain/trail/types';

/**
 * Ordem final dos 10 faróis, migrada de Ilha_da_Logica_PHP_1.html (array `MODS`).
 */
export const logicaModules: Module[] = [
  modOrigem,
  modOla,
  modVariaveis,
  modOperadores,
  modDecisoes,
  modLoops,
  modArrays,
  modFuncoes,
  modWeb,
  modVelha,
];
