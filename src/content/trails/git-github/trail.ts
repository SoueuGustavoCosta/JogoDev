import type { Trail } from '@/domain/trail/types';
import { gitGithubModules } from './modules';

export const gitGithubTrail: Trail = {
  id: 'git-github',
  title: 'Git e GitHub',
  tagline: 'Do primeiro commit ao primeiro push: controle de versão de verdade, no seu navegador.',
  symbol: 'git',
  accent: '#ffa36b',
  eyebrow: 'Era 4 · Código Compartilhado',
  intro: [
    'Viajante, chegamos à <b>Era da Bifurcação</b>. Aqui o tempo não anda em linha reta: ele se ramifica.',
    'Cada ideia nova pode virar uma linha do tempo paralela — um <b>branch</b> — que depois volta a se juntar à principal. ' +
      'Mas o Eco esteve por aqui: espalhou cópias divergentes do mesmo projeto e sobrescreveu pedaços do histórico sem avisar ninguém.',
    'Vamos reconstruir essa linha do tempo, <b>commit por commit</b> — do jeito que Linus Torvalds fez em 2005, ' +
      'quando escreveu o Git em poucos dias por pura necessidade. Bora depurar isso juntos?',
  ],
  modules: gitGithubModules,
  lab: 'git',
};
