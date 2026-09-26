import type { GitRepoState } from './git';

export type GitMission = {
  id: string;
  title: string;
  brief: string;
  hint: string;
  check: (state: GitRepoState) => boolean;
};

/**
 * As 6 missões do "Laboratório Git", migradas de ilha_git_github.html (array `MISSIONS`),
 * na mesma ordem e com o mesmo enunciado/dica. `verify()` virou `check(state)`, puro.
 */
export const gitMissions: GitMission[] = [
  {
    id: 'm1',
    title: 'O Nascimento do Repositório',
    brief:
      'Você está numa pasta com o código de um novo projeto, mas o Git ainda não sabe que ela existe. Inicialize a linha do tempo.',
    hint: 'git init',
    check: (state) => state.initialized === true,
  },
  {
    id: 'm2',
    title: 'Primeiro Commit',
    brief: 'Adicione os arquivos à staging area e grave o primeiro commit, com uma mensagem.',
    hint: 'git add . / git commit -m "..."',
    check: (state) => Object.keys(state.commits).length >= 1,
  },
  {
    id: 'm3',
    title: 'Branch de Recurso',
    brief: 'Crie um branch chamado feature e mude para ele.',
    hint: 'git branch feature / git switch feature',
    check: (state) => !!state.branches.feature && state.head === 'feature',
  },
  {
    id: 'm4',
    title: 'Commit na Feature',
    brief: 'Uma mudança te espera no branch feature. Adicione e grave um novo commit sem sair dele.',
    hint: 'git add . / git commit -m "..."',
    check: (state) => state.head === 'feature' && Object.keys(state.commits).length >= 2,
  },
  {
    id: 'm5',
    title: 'Fusão sem Conflitos',
    brief: 'Volte para a branch main e funda a branch feature nela.',
    hint: 'git switch main / git merge feature',
    check: (state) => {
      const mainId = state.branches.main;
      const mainCommit = mainId ? state.commits[mainId] : undefined;
      return state.head === 'main' && !!mainCommit && (mainCommit.parents || []).length === 2;
    },
  },
  {
    id: 'm6',
    title: 'Conecte ao GitHub',
    brief: 'Configure um repositório remoto e envie sua linha do tempo para lá.',
    hint: 'git remote add origin <url> / git push',
    check: (state) => !!state.remote && state.remoteHeads[state.head] === state.branches[state.head],
  },
];

export function getGitMissionById(id: string): GitMission | undefined {
  return gitMissions.find((mission) => mission.id === id);
}
