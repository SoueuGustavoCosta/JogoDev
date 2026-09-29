import type { Module } from '@/domain/trail/types';
import { modFastapiPrimeira } from './primeira';
import { modFastapiParametros } from './parametros';
import { modFastapiCorpo } from './corpo';
import { modFastapiRespostas } from './respostas';
import { modFastapiDocs } from './docs';

export const ramFastapiModules: Module[] = [modFastapiPrimeira, modFastapiParametros, modFastapiCorpo, modFastapiRespostas, modFastapiDocs];
