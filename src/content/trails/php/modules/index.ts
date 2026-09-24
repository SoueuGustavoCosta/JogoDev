import { modNascimento } from './nascimento';
import { modSintaxe } from './sintaxe';
import { modOperadores } from './operadores';
import { modLoops } from './loops';
import { modColecoes } from './colecoes';
import { modFuncoes } from './funcoes';
import { modPoo } from './poo';
import { modWeb } from './web';
import type { Module } from '@/domain/trail/types';

/** Ordem dos 8 faróis da Lua de PHP. */
export const phpModules: Module[] = [
  modNascimento,
  modSintaxe,
  modOperadores,
  modLoops,
  modColecoes,
  modFuncoes,
  modPoo,
  modWeb,
];
