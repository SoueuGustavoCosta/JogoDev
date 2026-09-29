import type { Module } from '@/domain/trail/types';
import { modFlaskPrimeiro } from './primeiro';
import { modFlaskRotas } from './rotas';
import { modFlaskTemplates } from './templates';
import { modFlaskFormularios } from './formularios';
import { modFlaskBlueprints } from './blueprints';

export const ramFlaskModules: Module[] = [modFlaskPrimeiro, modFlaskRotas, modFlaskTemplates, modFlaskFormularios, modFlaskBlueprints];
