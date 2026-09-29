import type { Module } from '@/domain/trail/types';
import { modQuarkusProjeto } from './projeto';
import { modQuarkusRest } from './rest';
import { modQuarkusInjecao } from './injecao';
import { modQuarkusPanache } from './panache';
import { modQuarkusConfig } from './config';

export const ramQuarkusModules: Module[] = [modQuarkusProjeto, modQuarkusRest, modQuarkusInjecao, modQuarkusPanache, modQuarkusConfig];
