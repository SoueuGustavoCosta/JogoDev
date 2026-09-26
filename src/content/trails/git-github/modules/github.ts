import type { Module } from '@/domain/trail/types';

/**
 * Migrado de ilha_git_github.html (módulo "github" — "GitHub e colaboração").
 */
export const modGithub: Module = {
  id: 'github',
  short: 'GitHub e colaboração',
  title: 'GitHub: hospedagem social para o Git',
  lead: 'De um projeto guardado só no seu computador para um trabalho em equipe, do outro lado do mundo.',
  level: 'Avançado',
  blocks: [
    { t: 'h', x: 'Uma empresa, não uma ferramenta' },
    {
      t: 'p',
      x: 'O GitHub nasceu em outubro de 2007, em beta privado, criado por Tom Preston-Werner, Chris Wanstrath e PJ Hyett (Scott Chacon entrou depois como quarto cofundador). O lançamento público foi em abril de 2008, construído sobre Ruby on Rails.',
    },
    {
      t: 'note',
      k: 'Linha do tempo',
      x: '<b>2005</b>: Git nasce, criado por Linus Torvalds.<br><b>2008</b>: GitHub nasce, para hospedar repositórios Git com fork, pull request e perfis sociais.<br><b>2018</b>: o GitHub é adquirido pela Microsoft.',
    },
    { t: 'h', x: 'Do repositório local para a nuvem' },
    {
      t: 'code',
      file: 'terminal — conectando ao remoto',
      x: 'git remote add origin https://github.com/usuario/projeto.git\ngit push -u origin main',
    },
    { t: 'h', x: 'Trazendo o trabalho de outras pessoas' },
    { t: 'code', file: 'terminal — sincronizando', x: 'git pull\ngit fetch' },
    {
      t: 'cards',
      items: [
        { h: 'Fork', x: 'Copiar o repositório de outra pessoa para a sua própria conta, para poder contribuir.' },
        { h: 'Pull Request', x: 'Um pedido formal para que suas mudanças sejam revisadas e juntadas ao projeto original.' },
        { h: 'Issues', x: 'A lista de tarefas, bugs e discussões de um repositório no GitHub.' },
      ],
    },
    {
      t: 'table',
      mac: false,
      cols: ['Comando', 'O que faz'],
      rows: [
        ['<code>git remote add origin url</code>', 'Conecta o repositório local a um endereço remoto (o GitHub, por exemplo).'],
        ['<code>git clone url</code>', 'Baixa uma cópia completa de um repositório remoto, com todo o histórico.'],
        ['<code>git push</code>', 'Envia seus commits locais para o repositório remoto.'],
        ['<code>git pull</code>', 'Busca e já aplica as mudanças do remoto na sua cópia local.'],
        ['<code>git fetch</code>', 'Busca as mudanças do remoto, mas sem aplicá-las ainda.'],
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Quem fundou o GitHub, e em que ano?',
      options: [
        'Linus Torvalds, sozinho, em 2005',
        'Tom Preston-Werner, Chris Wanstrath e PJ Hyett, em 2008',
        'Bill Gates, em 1998',
        'Mark Zuckerberg, em 2010',
      ],
      answer: 1,
      explain: 'O time original lançou o GitHub publicamente em abril de 2008, após meses de beta privado.',
    },
    {
      id: 'q2',
      q: 'O que é um Pull Request?',
      options: [
        'Um comando que apaga um branch',
        'Um pedido para que suas mudanças sejam revisadas e juntadas ao projeto original',
        'Um tipo de backup automático do GitHub',
        'Um erro de sintaxe do Git',
      ],
      answer: 1,
      explain: 'É o mecanismo central de colaboração e revisão de código no GitHub.',
    },
    {
      id: 'q3',
      q: "Complete o comando que envia seus commits locais para o GitHub:",
      fill: true,
      pre: "git",
      post: "-u origin main",
      accept: ["push"],
      wrong: ["pull", "fetch", "clone"],
      placeholder: "?",
      explain: "<code>push</code> empurra os commits para o remoto. <code>pull</code> e <code>fetch</code> fazem o caminho contrário.",
    },
  ],
};
