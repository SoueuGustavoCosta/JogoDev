import type { Module } from '@/domain/trail/types';

/** Trilha 3 do Cometa Git: branches (ligadas às Ramificações e à trama do jogo). */
export const modGitcBranches: Module = {
  id: 'cometa-git-branches',
  short: 'Branches',
  title: 'Branches: a linha do tempo que se divide',
  lead: 'Um branch é uma linha do tempo paralela. Você experimenta nela sem mexer na principal. É exatamente o que acontece num Evento Nexus.',
  level: 'Intermediário',
  blocks: [
    { t: 'say', x: 'Lembra dos portais que se abriram depois dos chefes das luas? Foi isso: a linha do tempo se ramificou. No Git, cada ramo é um branch.' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'git branch               # lista os branches (* = o atual)\ngit branch feature       # cria o branch feature\ngit switch feature       # muda para ele\ngit switch -c outra      # cria e já muda, num comando só' },
    {
      t: 'cards',
      items: [
        { h: 'main', x: 'A linha do tempo principal, a versão "oficial" do projeto.' },
        { h: 'feature', x: 'Um ramo para uma tarefa. Os commits dele não aparecem na main até você juntar.' },
        { h: 'HEAD', x: 'Onde você está agora: o branch atual.' },
      ],
    },
    { t: 'p', x: 'Antes existia o <code>git checkout</code> para trocar de branch. O <code>git switch</code> é mais novo e faz só isso, com menos chance de confusão.' },
    {
      t: 'try',
      engine: 'git',
      file: 'terminal — meu-projeto',
      brief: 'Crie a linha principal com um commit, depois abra um branch chamado feature e mude para ele.',
      starter: 'git init\ngit add .\ngit commit -m "base"\n',
      hint: 'git branch feature e depois git switch feature (ou git switch -c feature).',
      repo: 'projeto',
      mission: 'm3',
      solution: 'git init\ngit add .\ngit commit -m "base"\ngit branch feature\ngit switch feature',
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Pro Git: <a href="https://git-scm.com/book/pt-br/v2/Branches-no-Git-Branches-em-poucas-palavras" target="_blank" rel="noopener">Branches em poucas palavras</a> e <a href="https://git-scm.com/docs/git-switch" target="_blank" rel="noopener">git-switch</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que é um branch?',
      options: ['Uma cópia do projeto em outro computador', 'Uma linha do tempo paralela do projeto', 'Um arquivo de configuração', 'Um commit apagado'],
      answer: 1,
      explain: 'Um ramo da história, onde você trabalha sem mexer na main.',
    },
    {
      id: 'q2',
      q: 'Qual comando cria o branch outra e já muda para ele?',
      options: ['git branch outra', 'git switch -c outra', 'git merge outra', 'git init outra'],
      answer: 1,
      explain: '-c = create.',
    },
    {
      id: 'q3',
      q: 'Os commits feitos no branch feature aparecem na main?',
      options: ['Sim, na hora', 'Não, até você juntar (merge)', 'Só no GitHub', 'Só depois de reiniciar'],
      answer: 1,
      explain: 'Cada ramo segue o seu caminho até o merge.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: crie o branch feature e mude para ele.',
      pieces: ['git branch feature', 'git switch feature'],
      distractors: ['git merge feature', 'git push feature'],
      explain: 'Criar e depois mudar.',
    },
  ],
};
