import type { Module } from '@/domain/trail/types';
import { modJavalinServidor } from './servidor';
import { modJavalinRotas } from './rotas';
import { modJavalinJson } from './json';
import { modJavalinErros } from './erros';
import { modJavalinApi } from './api';

export const ramJavalinModules: Module[] = [modJavalinServidor, modJavalinRotas, modJavalinJson, modJavalinErros, modJavalinApi];
