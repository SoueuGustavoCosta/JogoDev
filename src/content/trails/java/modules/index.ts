import { modNascimento } from './nascimento';
import { modSintaxe } from './sintaxe';
import { modOperadores } from './operadores';
import { modLoops } from './loops';
import { modColecoes } from './colecoes';
import { modMetodos } from './metodos';
import { modClasses } from './classes';
import { modHeranca } from './heranca';
import type { Module } from '@/domain/trail/types';

/** Ordem dos 8 faróis da Lua de Java. */
export const javaModules: Module[] = [
  modNascimento,
  modSintaxe,
  modOperadores,
  modLoops,
  modColecoes,
  modMetodos,
  modClasses,
  modHeranca,
];
