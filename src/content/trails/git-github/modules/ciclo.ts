import type { Module } from '@/domain/trail/types';

/**
 * Migrado de ilha_git_github.html (módulo "ciclo" — "O ciclo básico").
 */
export const modCiclo: Module = {
  id: 'ciclo',
  short: 'O ciclo básico',
  title: 'O ciclo básico: init, status, add e commit',
  lead: 'O fluxo que você vai repetir dezenas de vezes por dia, em qualquer projeto.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'Os quatro passos do dia a dia' },
    { t: 'flow', items: ['git init', 'git status', 'git add', 'git commit'] },
    {
      t: 'code',
      file: 'terminal — primeiro repositório',
      x: 'git init\ngit status\ngit add index.html\ngit commit -m "primeiro commit: estrutura inicial"\ngit log',
    },
    {
      t: 'table',
      mac: false,
      cols: ['Comando', 'O que faz'],
      rows: [
        ['<code>git init</code>', 'Transforma a pasta atual em um repositório Git (cria a pasta .git).'],
        ['<code>git status</code>', 'Mostra o que mudou: o que está preparado, modificado ou ainda não rastreado.'],
        ['<code>git add</code>', 'Move um arquivo (ou <code>.</code> para todos) para a staging area.'],
        ['<code>git commit -m "..."</code>', 'Grava um novo ponto permanente no histórico, com uma mensagem.'],
        ['<code>git log</code>', 'Mostra o histórico de commits, do mais recente para o mais antigo.'],
      ],
    },
    {
      t: 'note',
      k: 'Boas mensagens de commit',
      x: 'Escreva no imperativo e de forma curta: <code>adiciona validação de e-mail</code>, e não <code>adicionei</code> ou apenas <code>mudanças</code>. Uma boa mensagem economiza tempo de todo mundo, inclusive o seu, seis meses depois.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Complete: qual comando mostra o que mudou antes de decidir o que fazer?',
      fill: true,
      pre: '',
      post: '',
      accept: ['git status'],
      wrong: ['git log', 'git push', 'git init'],
      placeholder: 'git ...',
      explain: 'git status é sempre o primeiro passo do ciclo.',
    },
    {
      id: 'q2',
      q: 'O que git add realmente faz?',
      options: [
        'Apaga o arquivo do projeto',
        'Move o arquivo para a staging area, preparando-o para o commit',
        'Envia o arquivo direto para o GitHub',
        'Cria um novo repositório',
      ],
      answer: 1,
      explain: 'git add não salva nada de permanente ainda — só prepara.',
    },
    {
      id: 'q3',
      q: 'Depois de um git commit, onde essa mudança fica gravada?',
      options: [
        'Só na memória RAM, e some ao fechar o terminal',
        'No histórico do repositório local (a pasta .git)',
        'Automaticamente também no GitHub',
        'Em um arquivo temporário que se apaga sozinho',
      ],
      answer: 1,
      explain: 'O commit é local até você explicitamente enviá-lo com git push.',
    },
  ],
};
