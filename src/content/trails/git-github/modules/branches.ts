import type { Module } from '@/domain/trail/types';

/**
 * Migrado de ilha_git_github.html (módulo "branches" — "Branches e merge").
 */
export const modBranches: Module = {
  id: 'branches',
  short: 'Branches e merge',
  title: 'Branches: linhas do tempo paralelas',
  lead: 'Como testar uma ideia nova sem correr o risco de quebrar a linha principal do projeto.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'O que é um branch, na prática' },
    {
      t: 'p',
      x: 'Um branch é uma ramificação independente do histórico: você pode experimentar, errar e refazer sem afetar a branch principal (geralmente chamada main), até decidir se aquilo vale a pena virar parte definitiva do projeto.',
    },
    {
      t: 'code',
      file: 'terminal — criando e trocando de branch',
      x: 'git branch feature\ngit switch feature\n\n# ou, em um só passo:\ngit checkout -b feature',
    },
    { t: 'h', x: 'Voltando e fundindo linhas do tempo' },
    { t: 'code', file: 'terminal — merge', x: 'git switch main\ngit merge feature' },
    {
      t: 'note',
      k: 'Conflito de merge',
      warn: true,
      x: 'Se o mesmo trecho de um arquivo foi alterado nos dois branches, o Git não decide sozinho: ele marca um <b>conflito</b> dentro do arquivo, e cabe a você escolher (ou combinar) qual versão fica.',
    },
    {
      t: 'table',
      mac: false,
      cols: ['Comando', 'O que faz'],
      rows: [
        ['<code>git branch nome</code>', 'Cria um novo branch (sem trocar para ele).'],
        ['<code>git switch nome</code>', 'Troca o branch ativo (comando mais novo e recomendado).'],
        ['<code>git checkout nome</code>', 'Faz a mesma troca; é o comando clássico, mais antigo.'],
        ['<code>git merge nome</code>', 'Funde o histórico de um branch dentro do branch atual.'],
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: "Complete para criar o branch feature e já entrar nele, num passo só:",
      fill: true,
      pre: "git",
      post: "-b feature",
      accept: ["checkout"],
      wrong: ["merge", "clone", "commit"],
      placeholder: "?",
      explain: "Um branch novo é uma linha do tempo paralela, isolada até ser mesclada de volta. <code>git checkout -b</code> (ou <code>git switch -c</code>) cria e já entra nele.",
    },
    {
      id: 'q2',
      kind: "order",
      q: "Monte os dois comandos que fundem o branch feature dentro da main",
      pieces: ["git switch main", "git merge feature"],
      distractors: ["git clone feature", "git branch main"],
      explain: "Primeiro você vai para o branch que recebe as mudanças (main), depois <code>git merge feature</code> funde a outra linha do tempo nele.",
    },
    {
      id: 'q3',
      q: 'O que é um conflito de merge?',
      options: [
        'Um erro fatal que apaga o projeto inteiro',
        'Quando o mesmo trecho foi alterado nos dois lados e o Git pede para você decidir',
        'Um aviso de que o repositório está cheio',
        'Um recurso que só existe no GitHub',
      ],
      answer: 1,
      explain: 'O Git é bom em juntar mudanças diferentes sozinho; só pede ajuda quando elas realmente colidem.',
    },
  ],
};
