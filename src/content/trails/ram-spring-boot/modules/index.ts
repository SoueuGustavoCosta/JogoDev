import type { Module } from '@/domain/trail/types';
import { modSpringProjeto } from './projeto';
import { modSpringController } from './controller';
import { modSpringBeans } from './beans';
import { modSpringDados } from './dados';
import { modSpringConfig } from './config';

export const ramSpringBootModules: Module[] = [modSpringProjeto, modSpringController, modSpringBeans, modSpringDados, modSpringConfig];
