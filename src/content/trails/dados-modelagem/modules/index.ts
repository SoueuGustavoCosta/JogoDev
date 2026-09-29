import { modTipos } from './tipos';
import { modArquitetura } from './arquitetura';
import { modInterface } from './interface';
import { modMer } from './mer';
import { modAlgebra } from './algebra';
import { modNorm } from './norm';
import { foldModules } from '@/domain/trail/fold';
import type { Module } from '@/domain/trail/types';

/**
 * "Tipos de bancos" com "Arquitetura do SGBD" dentro (Etapa 14A): o módulo fundido fica
 * com o id `tipos`; as perguntas de `arquitetura` viram `arquitetura-q1`... (ver
 * `foldModules` e `content/relocations.ts`, que leva o progresso junto).
 */
export const modTiposEArquitetura: Module = foldModules(modTipos, modArquitetura, {
  short: 'Tipos de bancos e SGBD',
  title: 'Tipos de bancos, PostgreSQL e a arquitetura de um SGBD',
  lead: 'As famílias de bancos de dados, por que o PostgreSQL, e o que existe por dentro do sistema: camadas, servidores e os três níveis de visão.',
});

/** Lua da Modelagem (Etapa 14A): desenhar o banco antes de escrever SQL. Módulos vindos da Era dos Dados. */
export const dadosModelagemModules: Module[] = [modTiposEArquitetura, modInterface, modMer, modAlgebra, modNorm];
