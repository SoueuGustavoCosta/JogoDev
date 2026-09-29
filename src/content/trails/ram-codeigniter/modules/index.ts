import type { Module } from '@/domain/trail/types';
import { modCiInstalacao } from './instalacao';
import { modCiRotas } from './rotas';
import { modCiViews } from './views';
import { modCiModels } from './models';
import { modCiFormularios } from './formularios';

export const ramCodeigniterModules: Module[] = [modCiInstalacao, modCiRotas, modCiViews, modCiModels, modCiFormularios];
