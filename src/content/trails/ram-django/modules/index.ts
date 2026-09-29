import type { Module } from '@/domain/trail/types';
import { modDjangoProjeto } from './projeto';
import { modDjangoViews } from './views';
import { modDjangoTemplates } from './templates';
import { modDjangoModels } from './models';
import { modDjangoForms } from './forms';

export const ramDjangoModules: Module[] = [modDjangoProjeto, modDjangoViews, modDjangoTemplates, modDjangoModels, modDjangoForms];
