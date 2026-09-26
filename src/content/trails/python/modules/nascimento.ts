import type { Module } from '@/domain/trail/types';

/**
 * Farol 1 da Lua de Python: história real da linguagem (Guido van Rossum, CWI, 1989-1991,
 * o nome vindo de Monty Python, o Zen de Python) — ver a trama completa em `../trail.ts`.
 */
export const modNascimento: Module = {
  id: 'nascimento-python',
  short: 'Uma lua se abre',
  title: 'Nascimento de uma linguagem',
  lead: 'A fresta que o Loopus Infinitus deixou revela uma lua inteira escondida atrás da Era da Lógica. Ela guarda a história real de Python.',
  level: 'Base',
  blocks: [
    {
      t: 'say',
      x: 'Você venceu o Loopus Infinitus, {name}, mas olha o mapa: uma rachadura brilhante se abriu perto da Era da Lógica. Não é um defeito — é uma <b>lua</b> que estava escondida. Vem comigo.',
    },
    { t: 'h', x: 'O Eco não desapareceu: ele se dividiu' },
    {
      t: 'p',
      x: 'Quando o bug que rondava a Era da Lógica foi derrotado, ele não sumiu — <b>se espalhou em três fragmentos</b>, cada um se escondendo dentro da história real de uma linguagem diferente, torcendo os fatos pra ninguém mais aprender direito. O primeiro fragmento se escondeu bem aqui, na história de <b>Python</b>.',
    },
    {
      t: 'note',
      k: 'Onduluk',
      x: 'O nome que este fragmento deu a si mesmo é Onduluk. Ele adora se gabar de ser "a serpente que dá nome à linguagem" — só que isso não é verdade. Você vai descobrir o porquê já já.',
    },
    { t: 'h', x: 'Amsterdã, dezembro de 1989 (fato real)' },
    {
      t: 'timeline',
      items: [
        {
          y: 'dezembro de 1989',
          h: 'Guido van Rossum começa Python no CWI',
          x: 'No Centrum Wiskunde & Informatica (CWI), em Amsterdã, o programador holandês Guido van Rossum passou o recesso de Natal escrevendo o interpretador de uma nova linguagem, por hobby, como sucessora de uma linguagem de ensino chamada ABC — que ele ajudara a construir e cujas limitações conhecia bem.',
        },
        {
          y: 'fevereiro de 1991',
          h: 'Python 0.9.0 é publicado',
          x: 'Guido publicou o código-fonte no grupo de discussão alt.sources da Usenet. Essa versão já tinha funções, tratamento de exceções, classes com herança e os tipos principais que Python usa até hoje: listas, dicionários e strings.',
        },
        {
          y: '2000 → 2008',
          h: 'Python 2.0 e depois Python 3.0',
          x: 'O Python 2.0 (2000) trouxe coleta de lixo automática e list comprehensions. O Python 3.0 (2008) quebrou a compatibilidade de propósito, para corrigir inconsistências antigas (como misturar texto e bytes). A transição foi longa: o Python 2 só se aposentou de vez em 1º de janeiro de 2020.',
        },
        {
          y: '2018',
          h: 'Guido deixa de ser o "ditador benevolente"',
          x: 'Por quase 30 anos, Guido foi chamado de BDFL — Benevolent Dictator For Life ("ditador benevolente vitalício") — o responsável final por toda decisão sobre a linguagem. Em julho de 2018 ele renunciou ao cargo, e hoje um conselho eleito decide o futuro de Python.',
        },
      ],
    },
    { t: 'h', x: 'De onde vem o nome "Python"?' },
    {
      t: 'p',
      x: 'Aqui está o golpe de Onduluk: ele quer que você acredite que Python foi batizada em homenagem à cobra. <b>Não foi.</b> Guido van Rossum era fã do grupo de comédia britânico <b>Monty Python\'s Flying Circus</b>, e escolheu o nome porque queria algo curto, um pouco misterioso e divertido de dizer em reuniões de trabalho. A cobra na logomarca veio muito depois, quando a comunidade abraçou o trocadilho.',
    },
    {
      t: 'note',
      k: 'Por que isso importa',
      x: 'Onduluk se disfarça de "a cobra que deu nome à linguagem" para parecer mais poderoso do que é. Cada vez que você souber um fato real sobre Python, uma parte da disfarce dele cai.',
      warn: true,
    },
    { t: 'h', x: 'O Zen de Python: a filosofia por trás da sintaxe' },
    {
      t: 'p',
      x: 'Em 1999, o programador Tim Peters escreveu 19 frases curtas que resumem como Python prefere resolver as coisas — hoje conhecidas como <b>PEP 20, o Zen de Python</b>. Elas explicam por que a linguagem parece "mais simples" que outras: não é acidente, é filosofia de design.',
    },
    {
      t: 'cards',
      items: [
        { h: 'Bonito é melhor que feio', x: 'Código legível é tratado como qualidade, não luxo.' },
        { h: 'Simples é melhor que complexo', x: 'Se dá pra resolver de um jeito direto, prefira o jeito direto.' },
        { h: 'Deve haver um — de preferência só um — jeito óbvio de fazer', x: 'Python evita oferecer 5 formas diferentes da mesma coisa.' },
        { h: 'Legibilidade conta', x: 'Código é lido muito mais vezes do que é escrito.' },
      ],
    },
    {
      t: 'code',
      file: 'zen.py',
      lang: 'python',
      nolab: true,
      x: 'import this\n# Ao rodar essas duas palavras em qualquer Python instalado,\n# a linguagem imprime as 19 frases do Zen na tela — um easter egg real.',
    },
    { t: 'h', x: 'O que vem agora' },
    {
      t: 'p',
      x: 'Onduluk não luta com força bruta: ele confunde. Nas próximas paradas desta lua você vai aprender a sintaxe, os tipos, as decisões, os laços, as coleções, as funções, os módulos e as classes de Python — tudo que ele tenta embaralhar. No fim, você vai enfrentá-lo com o que aprendeu.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Quem começou a escrever Python, e onde?',
      options: [
        'Guido van Rossum, no CWI, em Amsterdã',
        'Tim Peters, no MIT',
        'Um grupo de fãs de Monty Python, no Reino Unido',
        'James Gosling, na Sun Microsystems',
      ],
      answer: 0,
      explain: 'Guido van Rossum começou Python em dezembro de 1989, como projeto de hobby no CWI (Centrum Wiskunde & Informatica), na Holanda.',
    },
    {
      id: 'q2',
      q: 'De onde vem o nome "Python"?',
      options: [
        'Da cobra píton, escolhida como mascote desde o início',
        'Do grupo de comédia britânico Monty Python\'s Flying Circus',
        'De uma sigla técnica em holandês',
        'De uma aposta entre pesquisadores do CWI',
      ],
      answer: 1,
      explain: 'Guido era fã do programa de comédia Monty Python\'s Flying Circus. A cobra na identidade visual veio depois, por trocadilho da comunidade.',
    },
    {
      id: 'q3',
      q: 'Em que ano a primeira versão pública de Python (0.9.0) foi publicada?',
      options: ['1985', '1991', '1995', '2008'],
      answer: 1,
      explain: 'Guido publicou o código-fonte em fevereiro de 1991, no grupo alt.sources da Usenet.',
    },
    {
      id: 'q4',
      q: 'O que é o "Zen de Python"?',
      options: [
        'Um manual oficial de instalação',
        'Um conjunto de 19 frases (PEP 20) sobre a filosofia de design da linguagem',
        'Uma versão antiga de Python usada só no Japão',
        'O apelido do primeiro interpretador de Python',
      ],
      answer: 1,
      explain: 'Escrito por Tim Peters em 1999, o Zen de Python resume os princípios de design da linguagem em 19 frases curtas, acessíveis com "import this".',
      hint: 'Pense no comando que aparece no bloco de código deste farol.',
    },
    {
      id: 'q5',
      q: 'Complete: Guido van Rossum foi conhecido por quase 30 anos como o ___ de Python, até renunciar ao cargo em 2018.',
      fill: true,
      pre: 'Guido van Rossum foi conhecido por quase 30 anos como o',
      post: 'de Python, até renunciar ao cargo em 2018.',
      accept: ['BDFL', 'bdfl', 'ditador benevolente', 'benevolent dictator for life', 'ditador benevolente vitalício'],
      wrong: ['CEO', 'CTO', 'mascote'],
      placeholder: 'sigla ou nome do cargo',
      explain: 'BDFL: "Benevolent Dictator For Life" — o "ditador benevolente vitalício", responsável final por toda decisão sobre a linguagem, até 2018.',
      hint: 'É uma sigla de quatro letras, em inglês.',
    },
  ],
};
