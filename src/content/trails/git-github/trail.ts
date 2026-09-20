import type { Trail } from '@/domain/trail/types';
import { gitGithubModules } from './modules';

export const gitGithubTrail: Trail = {
  id: 'git-github',
  title: 'Git e GitHub',
  tagline: 'Do primeiro commit ao primeiro push: controle de versão de verdade, no seu navegador.',
  symbol: 'git',
  accent: '#ffa36b',
  modules: gitGithubModules,
  lab: 'git',
};
