import type { Module } from '@/domain/trail/types';
import { modSymfonyProjeto } from './projeto';
import { modSymfonyControllers } from './controllers';
import { modSymfonyTwig } from './twig';
import { modSymfonyDoctrine } from './doctrine';
import { modSymfonyForms } from './forms';

export const ramSymfonyModules: Module[] = [modSymfonyProjeto, modSymfonyControllers, modSymfonyTwig, modSymfonyDoctrine, modSymfonyForms];
