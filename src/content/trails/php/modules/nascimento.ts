import type { Module } from '@/domain/trail/types';

/**
 * Farol 1 da Lua de PHP: história real da linguagem (Rasmus Lerdorf, 1994, "Personal
 * Home Page Tools", Zend Engine, PHP 3) — trama completa em `../trail.ts`.
 */
export const modNascimento: Module = {
  id: 'nascimento-php',
  short: 'A terceira lua',
  title: 'Nascimento de uma linguagem',
  lead: 'A terceira e última rachadura se abre. O último fragmento do Eco escolheu se esconder numa linguagem que você já viu antes, sem saber.',
  level: 'Base',
  blocks: [
    {
      t: 'say',
      x: 'Você não vai acreditar, {name}: o Loopus Infinitus, o próprio chefe da Era da Lógica, foi escrito em PHP. Você já usou esta linguagem sem conhecer a história dela. Hora de conhecer de verdade.',
    },
    { t: 'h', x: 'Malabari, o último fragmento' },
    {
      t: 'p',
      x: 'Este fragmento se chama <b>Malabari</b>. Ele adora fazer valores trocarem de tipo no ar, sem avisar — um "malabarismo" que confunde comparações inteiras. Antes de encará-lo, conheça de onde PHP realmente veio.',
    },
    { t: 'h', x: 'Uma ferramenta pessoal que virou linguagem (fato real)' },
    {
      t: 'timeline',
      items: [
        {
          y: '1994',
          h: 'Rasmus Lerdorf cria as "Personal Home Page Tools"',
          x: 'O programador dinamarquês-canadense Rasmus Lerdorf escreveu um conjunto de scripts em Perl/CGI para saber quantas pessoas visitavam seu currículo on-line ("Personal Home Page"). Ele batizou o conjunto de PHP Tools — sem imaginar que aquilo viraria uma linguagem usada no mundo inteiro.',
        },
        {
          y: '1995 → 1997',
          h: 'PHP/FI (Forms Interpreter) cresce',
          x: 'Lerdorf reescreveu e liberou o código como PHP/FI, já com suporte a formulários HTML e bancos de dados — mas ainda como um projeto pessoal, sem uma equipe por trás.',
        },
        {
          y: '1997',
          h: 'Andi Gutmans e Zeev Suraski reescrevem o motor',
          x: 'Dois estudantes israelenses, Andi Gutmans e Zeev Suraski, reescreveram o interpretador do zero, criando o que hoje se chama <b>Zend Engine</b> (o nome vem da junção de "Zeev" e "Andi"). Essa reescrita virou a base do PHP 3, lançado em 1998 — o ponto em que PHP deixou de ser "ferramenta pessoal" e virou linguagem de verdade.',
        },
        {
          y: '1998 em diante',
          h: 'O acrônimo vira recursivo',
          x: 'A sigla PHP passou a significar "PHP: Hypertext Preprocessor" — um acrônimo recursivo (a sigla contém a própria sigla), no mesmo espírito de nomes como GNU ("GNU\'s Not Unix").',
        },
      ],
    },
    {
      t: 'note',
      k: 'O que o Eco quer',
      x: 'Malabari se disfarça de "só um jeito relaxado de programar" — quer que você esqueça que a flexibilidade de PHP, sem cuidado, vira comparação imprevisível. Isso é exatamente o golpe final que ele vai tentar em você.',
      warn: true,
    },
    { t: 'h', x: 'PHP hoje: menos "página pessoal", mais internet inteira' },
    {
      t: 'p',
      x: 'PHP move uma fatia enorme da web: o WordPress, sistema por trás de uma parcela gigantesca dos sites do mundo, é escrito em PHP. O próprio Facebook nasceu em PHP antes de a empresa criar suas próprias ferramentas para rodá-lo em escala.',
    },
    {
      t: 'cards',
      items: [
        { h: 'PHP 5 (2004)', x: 'Trouxe orientação a objetos completa.' },
        { h: 'PHP 7 (2015)', x: 'Reescrita de performance (Zend Engine 3), até duas vezes mais rápida.' },
        { h: 'PHP 8 (2020)', x: 'Trouxe compilação JIT, tipos union, e correções importantes de comparação — você vai ver uma delas no fim desta lua.' },
      ],
    },
  ],
  quiz: [
    {
      q: 'Qual era o propósito original das "Personal Home Page Tools", criadas por Rasmus Lerdorf?',
      options: [
        'Construir um banco de dados',
        'Contar visitas ao currículo pessoal dele na web',
        'Substituir o Perl completamente',
        'Ensinar programação em universidades',
      ],
      answer: 1,
      explain: 'Lerdorf escreveu os scripts originais em 1994 só para saber quantas pessoas visitavam sua página pessoal (o currículo).',
    },
    {
      q: 'Quem reescreveu o motor de PHP, criando o que hoje se chama Zend Engine?',
      options: ['Rasmus Lerdorf sozinho', 'James Gosling', 'Andi Gutmans e Zeev Suraski', 'Guido van Rossum'],
      answer: 2,
      explain: 'Em 1997, os estudantes Andi Gutmans e Zeev Suraski reescreveram o interpretador, dando origem ao Zend Engine (nome que vem da junção dos dois primeiros nomes).',
    },
    {
      q: 'O que significa a sigla PHP hoje?',
      options: [
        'Personal Home Page (o nome original, sem mudar)',
        'PHP: Hypertext Preprocessor, um acrônimo recursivo',
        'Programming High Performance',
        'Public Hosting Protocol',
      ],
      answer: 1,
      explain: 'Depois da reescrita de 1997-98, a sigla virou recursiva: "PHP: Hypertext Preprocessor", contendo a própria sigla dentro do significado.',
    },
    {
      q: 'Qual grande sistema de gerenciamento de sites é famosamente escrito em PHP?',
      options: ['WordPress', 'Photoshop', 'Windows', 'Excel'],
      answer: 0,
      explain: 'WordPress, usado por uma parcela enorme dos sites do mundo, é escrito em PHP.',
    },
    {
      q: 'Complete: você já tinha visto PHP em ação antes desta lua, sem saber: o chefe Loopus Infinitus, da Era da ___, foi escrito nessa linguagem.',
      fill: true,
      pre: 'O chefe Loopus Infinitus, da Era da',
      post: ', foi escrito em PHP.',
      accept: ['logica', 'lógica'],
      placeholder: 'nome da era',
      explain: 'A Era da Lógica usa PHP como linguagem de base para seu laboratório e para o chefe Loopus Infinitus.',
    },
  ],
};
