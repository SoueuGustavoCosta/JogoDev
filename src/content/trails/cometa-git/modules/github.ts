import type { Module } from '@/domain/trail/types';

/** Trilha 5 do Cometa Git: GitHub, push e pull request. */
export const modGitcGithub: Module = {
  id: 'cometa-git-github',
  short: 'push e pull request',
  title: 'GitHub, push e pull request',
  lead: 'O repositório remoto é uma cópia do seu projeto na internet. Você envia os commits (push), e o time revisa num pull request.',
  level: 'Intermediário',
  blocks: [
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'git remote add origin https://github.com/voce/meu-projeto.git\ngit push -u origin main' },
    {
      t: 'cards',
      items: [
        { h: 'origin', x: 'O nome de costume para o remoto principal.' },
        { h: 'push', x: 'Envia os seus commits para o remoto. O <code>-u</code> lembra a ligação: da próxima vez, só <code>git push</code>.' },
        { h: 'pull', x: 'Traz os commits novos do remoto para o seu computador: <code>git pull</code>.' },
      ],
    },
    { t: 'h', x: 'Pull request' },
    {
      t: 'p',
      x: 'Um <b>pull request</b> (PR) é um pedido: "revise este branch e junte na main". Não é um comando do Git, é uma ferramenta de sites como o GitHub. O time comenta, pede ajustes e, quando está tudo certo, faz o merge.',
    },
    { t: 'flow', items: ['Branch feature', 'git push', 'Abre o PR', 'Revisão', 'Merge na main'] },
    {
      t: 'try',
      engine: 'git',
      file: 'terminal — meu-projeto',
      brief: 'Grave um commit, ligue o repositório remoto origin e envie a main para lá.',
      starter: 'git init\ngit add .\ngit commit -m "primeiro commit"\n',
      hint: 'git remote add origin <url> e depois git push -u origin main.',
      repo: 'projeto',
      mission: 'm6',
      solution: 'git init\ngit add .\ngit commit -m "primeiro commit"\ngit remote add origin https://github.com/voce/meu-projeto.git\ngit push -u origin main',
    },
    { t: 'say', x: 'Última trilha do cometa! O Mestre dos Conflitos embaralhou as linhas do tempo. Mostre que você sabe criar, juntar e enviar cada ramo.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Pro Git: <a href="https://git-scm.com/book/pt-br/v2/Fundamentos-de-Git-Trabalhando-de-Forma-Remota" target="_blank" rel="noopener">Trabalhando de forma remota</a> e <a href="https://git-scm.com/docs/git-push" target="_blank" rel="noopener">git-push</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que faz git push?',
      options: ['Traz commits do remoto', 'Envia seus commits para o remoto', 'Cria um branch', 'Desfaz o último commit'],
      answer: 1,
      explain: 'push envia; pull traz.',
    },
    {
      id: 'q2',
      q: 'Pull request é um comando do Git?',
      options: [
        'Sim: git pull-request',
        'Não: é uma ferramenta de sites como o GitHub para revisar e juntar branches',
        'Sim: é o mesmo que git pull',
        'Não existe',
      ],
      answer: 1,
      explain: 'O PR vive no GitHub (ou parecidos); o Git cuida dos commits e do merge.',
    },
    {
      id: 'q3',
      q: 'Para que serve o -u em git push -u origin main?',
      options: ['Apaga o remoto', 'Lembra a ligação, para depois bastar git push', 'Envia só o último commit', 'Força o envio'],
      answer: 1,
      explain: '-u define o upstream do branch.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: envie a main para o origin e lembre a ligação.',
      pieces: ['git push', '-u', 'origin', 'main'],
      distractors: ['git pull', '--force', 'upstream'],
      explain: 'git push -u origin main.',
    },
  ],
};
