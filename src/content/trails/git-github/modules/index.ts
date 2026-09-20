import { modOrigem } from './origem';
import { modConceitos } from './conceitos';
import { modCiclo } from './ciclo';
import { modBranches } from './branches';
import { modDesfazer } from './desfazer';
import { modGithub } from './github';
import { modBoaspraticas } from './boaspraticas';
import type { Module } from '@/domain/trail/types';

/**
 * Ordem final dos 7 módulos, migrada de ilha_git_github.html (array `MODS`).
 */
export const gitGithubModules: Module[] = [
  modOrigem,
  modConceitos,
  modCiclo,
  modBranches,
  modDesfazer,
  modGithub,
  modBoaspraticas,
];
