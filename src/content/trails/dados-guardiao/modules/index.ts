import { modIndices } from './indices';
import { modTransacoes } from './transacoes';
import { modViews } from './views';
import { modSeguranca } from './seguranca';
import { modProjeto } from './projeto';
import type { Module } from '@/domain/trail/types';

/** Lua do Guardião (Etapa 14A): desempenho, transações, visões, segurança e o projeto final. Módulos vindos da Era dos Dados. */
export const dadosGuardiaoModules: Module[] = [modIndices, modTransacoes, modViews, modSeguranca, modProjeto];
