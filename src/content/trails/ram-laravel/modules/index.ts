import type { Module } from '@/domain/trail/types';
import { modLaravelInstalacao } from './instalacao';
import { modLaravelRotas } from './rotas';
import { modLaravelControllers } from './controllers';
import { modLaravelEloquent } from './eloquent';
import { modLaravelValidacao } from './validacao';

export const ramLaravelModules: Module[] = [modLaravelInstalacao, modLaravelRotas, modLaravelControllers, modLaravelEloquent, modLaravelValidacao];
