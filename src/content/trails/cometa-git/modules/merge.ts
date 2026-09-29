import type { Module } from '@/domain/trail/types';

/** Trilha 4 do Cometa Git: merge e conflitos. */
export const modGitcMerge: Module = {
  id: 'cometa-git-merge',
  short: 'merge e conflitos',
  title: 'merge e conflitos: juntando as linhas do tempo',
  lead: 'O merge junta um branch em outro. Quando as duas linhas mudaram a mesma parte do mesmo arquivo, o Git pede a sua ajuda: é um conflito.',
  level: 'Intermediário',
  blocks: [
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'git switch main        # vá para quem vai receber\ngit merge feature      # traga o trabalho do feature' },
    { t: 'h', x: 'Quando dá conflito' },
    {
      t: 'code',
      file: 'index.html',
      lang: 'text',
      nolab: true,
      x: '<<<<<<< HEAD\n<h1>Bem-vindo</h1>\n=======\n<h1>Olá, Viajante</h1>\n>>>>>>> feature',
    },
    {
      t: 'cards',
      items: [
        { h: '<<<<<<< HEAD', x: 'Começa a versão do branch onde você está (main).' },
        { h: '=======', x: 'Separa as duas versões.' },
        { h: '>>>>>>> feature', x: 'Termina a versão que veio do feature.' },
      ],
    },
    { t: 'p', x: 'Para resolver: edite o arquivo deixando só o que deve ficar, apague as três marcas, e grave:' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'git add index.html\ngit commit -m "Resolve conflito no título"' },
    {
      t: 'try',
      engine: 'git',
      file: 'terminal — meu-projeto',
      brief: 'Grave a base, faça um commit num branch feature e depois junte o feature na main.',
      starter: 'git init\ngit add .\ngit commit -m "base"\ngit switch -c feature\n',
      hint: 'Depois do commit no feature: git switch main e git merge feature.',
      repo: 'projeto',
      mission: 'm5',
      solution: 'git init\ngit add .\ngit commit -m "base"\ngit switch -c feature\ngit add .\ngit commit -m "feature"\ngit switch main\ngit merge feature',
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Pro Git: <a href="https://git-scm.com/book/pt-br/v2/Branches-no-Git-O-b%C3%A1sico-de-Ramifica%C3%A7%C3%A3o-Branch-e-Mesclagem-Merge" target="_blank" rel="noopener">O básico de Ramificação e Mesclagem</a> e <a href="https://git-scm.com/docs/git-merge" target="_blank" rel="noopener">git-merge</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Para trazer o trabalho do feature para a main, em qual branch você precisa estar?',
      options: ['No feature', 'Na main', 'Tanto faz', 'Num branch novo'],
      answer: 1,
      explain: 'Você fica em quem recebe (main) e faz git merge feature.',
    },
    {
      id: 'q2',
      q: 'Quando acontece um conflito?',
      options: [
        'Sempre que se faz merge',
        'Quando os dois branches mudaram a mesma parte do mesmo arquivo',
        'Quando o arquivo é muito grande',
        'Quando não há internet',
      ],
      answer: 1,
      explain: 'Se as mudanças são em lugares diferentes, o Git junta sozinho.',
    },
    {
      id: 'q3',
      kind: 'bug',
      q: 'O conflito foi resolvido, mas o arquivo ainda quebra a página. Toque na linha que ficou para trás.',
      lines: ['<h1>Olá, Viajante</h1>', '=======', '<p>Bem-vindo ao projeto.</p>'],
      bugLine: 2,
      explain: 'As marcas de conflito (<<<<<<<, =======, >>>>>>>) precisam sair antes do add e do commit.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: junte o feature na main.',
      pieces: ['git switch main', 'git merge feature'],
      distractors: ['git merge main', 'git branch -d main'],
      explain: 'Vá para a main e traga o feature.',
    },
  ],
};
