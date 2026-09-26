import type { Module } from '@/domain/trail/types';

/**
 * Migrado de ilha_git_github.html (módulo "conceitos" — "Repositório e conceitos").
 */
export const modConceitos: Module = {
  id: 'conceitos',
  short: 'Repositório e conceitos',
  title: 'Repositório, working directory e staging area',
  lead: 'Três conceitos que sustentam absolutamente tudo que vem depois.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'As três áreas do Git' },
    {
      t: 'cards',
      items: [
        { h: 'Working Directory', x: 'A pasta do projeto onde você edita os arquivos de verdade, no dia a dia.' },
        { h: 'Staging Area (index)', x: 'Uma área de preparação: você escolhe exatamente o que vai entrar no próximo commit.' },
        { h: 'Repositório (.git)', x: 'Onde o histórico permanente fica gravado, dentro de uma pasta oculta chamada .git.' },
      ],
    },
    {
      t: 'note',
      k: 'Analogia',
      x: 'Pense em uma carta: a <b>Working Directory</b> é a mesa onde você escreve o rascunho, a <b>Staging Area</b> é o envelope onde você escolhe as folhas que vão dentro, e o <b>commit</b> é o selo que lacra e registra a carta para sempre no histórico.',
    },
    { t: 'h', x: 'Anatomia de um commit' },
    {
      t: 'ul',
      items: [
        'Cada commit tem um <b>hash</b> único (um código como <code>a1b2c3d</code>) que o identifica.',
        'Guarda uma <b>mensagem</b> descrevendo o que mudou, além de autor e data.',
        'Aponta para o commit <b>anterior</b> (o "pai"), formando uma corrente — é essa corrente que vira o histórico do projeto.',
      ],
    },
    { t: 'code', file: 'terminal — o repositório nasce', x: 'git init\ngit status' },
  ],
  quiz: [
    {
      id: 'q1',
      afterBlock: 5,
      q: "O histórico completo de commits fica gravado na pasta .git (o repositório). Complete o comando que cria essa pasta:",
      fill: true,
      pre: "git",
      post: "",
      accept: ["init"],
      wrong: ["status", "clone", "commit"],
      placeholder: "?",
      explain: "<code>git init</code> cria a pasta .git, onde o Git grava permanentemente o histórico completo de commits do projeto.",
    },
    {
      id: 'q2',
      kind: "order",
      q: "Monte o caminho de uma mudança até virar commit, passando pela Staging Area",
      pieces: ["Diretório de trabalho", "Staging Area", "Repositório (.git)"],
      explain: "A Staging Area fica no meio: é onde você escolhe e prepara exatamente o que vai entrar no próximo commit.",
    },
    {
      id: 'q3',
      q: 'Além da mensagem, o que um commit guarda?',
      options: [
        'Nada além do texto digitado',
        'Um hash único e uma referência ao commit anterior',
        'A senha da sua conta do GitHub',
        'O nome do seu computador',
      ],
      answer: 1,
      explain: 'É essa cadeia de hash + referência ao "pai" que forma o histórico do Git.',
    },
  ],
};
