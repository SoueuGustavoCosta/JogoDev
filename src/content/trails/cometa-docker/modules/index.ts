import type { Module } from '@/domain/trail/types';
import { modDockerContainers } from './containers';
import { modDockerImagens } from './imagens';
import { modDockerDockerfile } from './dockerfile';
import { modDockerVolumes } from './volumes';
import { modDockerCompose } from './compose';

export const cometaDockerModules: Module[] = [modDockerContainers, modDockerImagens, modDockerDockerfile, modDockerVolumes, modDockerCompose];
