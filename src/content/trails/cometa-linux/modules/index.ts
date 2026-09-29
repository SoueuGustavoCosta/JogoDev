import type { Module } from '@/domain/trail/types';
import { modLinuxTerminal } from './terminal';
import { modLinuxArquivos } from './arquivos';
import { modLinuxPermissoes } from './permissoes';
import { modLinuxProcessos } from './processos';
import { modLinuxScript } from './script';

export const cometaLinuxModules: Module[] = [modLinuxTerminal, modLinuxArquivos, modLinuxPermissoes, modLinuxProcessos, modLinuxScript];
