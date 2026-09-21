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
      q: 'O que fica gravado permanentemente na pasta .git (o repositório)?',
      options: [
        'Só os arquivos abertos no editor no momento',
        'O histórico completo de commits do projeto',
        'Uma lista de tarefas pendentes',
        'Nada, é uma pasta vazia',
      ],
      answer: 1,
      explain: 'O repositório é onde o histórico de commits vive de fato.',
    },
    {
      q: 'Qual é a função da Staging Area?',
      options: [
        'Apagar arquivos definitivamente',
        'Escolher e preparar exatamente o que vai entrar no próximo commit',
        'Enviar o código direto para o GitHub',
        'Criar um novo branch automaticamente',
      ],
      answer: 1,
      explain: 'A staging area é o "envelope": você decide o que entra antes de lacrar o commit.',
    },
    {
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
