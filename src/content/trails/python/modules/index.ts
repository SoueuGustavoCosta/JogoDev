import { modNascimento } from './nascimento';
import { modSintaxe } from './sintaxe';
import { modOperadores } from './operadores';
import { modLoops } from './loops';
import { modColecoes } from './colecoes';
import { modFuncoes } from './funcoes';
import { modModulos } from './modulos';
import { modPoo } from './poo';
import type { Module } from '@/domain/trail/types';

/** Ordem dos 8 faróis da Lua de Python. */
export const pythonModules: Module[] = [
  modNascimento,
  modSintaxe,
  modOperadores,
  modLoops,
  modColecoes,
  modFuncoes,
  modModulos,
  modPoo,
];
