import type { Module } from '@/domain/trail/types';

/**
 * Farol 1 da Lua de Java: história real da linguagem (James Gosling, Green Project,
 * Oak → Java, 1991-1995, "escreva uma vez, rode em qualquer lugar") — trama em `../trail.ts`.
 */
export const modNascimento: Module = {
  id: 'nascimento-java',
  short: 'A segunda lua',
  title: 'Nascimento de uma linguagem',
  lead: 'Uma segunda rachadura se abre no mapa. Outro fragmento do Eco se escondeu aqui: na história real de Java.',
  level: 'Base',
  blocks: [
    {
      t: 'say',
      x: 'Onduluk caiu, {name}, mas ele avisou: eram três fragmentos. O segundo se escondeu numa linguagem que nasceu para outro propósito e virou a espinha dorsal da internet corporativa.',
    },
    { t: 'h', x: 'O Eco se disfarça de novo' },
    {
      t: 'p',
      x: 'Este fragmento se chama <b>Nulo</b>. Ele adora se esconder onde ninguém espera: dentro de uma variável que parece existir, mas não guarda nada. Antes de enfrentá-lo, você precisa conhecer a história real desta lua.',
    },
    { t: 'h', x: 'Um projeto para controlar aparelhos, não sites (fato real)' },
    {
      t: 'timeline',
      items: [
        {
          y: '1991',
          h: 'O Green Project começa na Sun Microsystems',
          x: 'James Gosling, junto com Mike Sheridan e Patrick Naughton, começou um projeto interno chamado "Green" na Sun Microsystems. O objetivo não era a internet: era criar uma linguagem para programar aparelhos eletrônicos de consumo, como controles remotos e TVs interativas.',
        },
        {
          y: '1991',
          h: 'A linguagem se chama "Oak"',
          x: 'Gosling batizou a linguagem de Oak (carvalho, em inglês), inspirado numa árvore que ficava em frente à janela do seu escritório. O nome precisou mudar depois: já existia outra linguagem registrada com esse nome.',
        },
        {
          y: '1995',
          h: 'Java é anunciado publicamente',
          x: 'Com o mercado de eletrônicos de consumo não decolando como esperado, a Sun percebeu que a linguagem era perfeita para outra coisa: a internet, que estava explodindo. Em 23 de maio de 1995, no evento SunWorld, a linguagem foi anunciada com o nome Java — inspirado no café, escolhido numa sessão de brainstorm (outros nomes cogitados foram "Silk" e "DNA").',
        },
        {
          y: '1996',
          h: 'Java 1.0 é lançado, com o lema "Write Once, Run Anywhere"',
          x: 'O lema "escreva uma vez, rode em qualquer lugar" resumia a grande promessa: um programa Java compilado rodaria sem alterações em qualquer computador com a Java Virtual Machine (JVM) instalada — Windows, Mac, Unix, não importava.',
        },
      ],
    },
    { t: 'h', x: 'Como Java roda em qualquer lugar' },
    {
      t: 'p',
      x: 'Diferente de C, que compila direto para o código de uma máquina específica, o código Java compila para um formato intermediário chamado <b>bytecode</b>. Quem entende esse bytecode é a <b>JVM (Java Virtual Machine)</b>, instalada em cada sistema operacional. É essa camada extra que permite o mesmo programa rodar em qualquer lugar.',
    },
    {
      t: 'flow',
      items: ['Código-fonte (.java)', 'Compilador (javac)', 'Bytecode (.class)', 'JVM', 'Roda no sistema operacional'],
    },
    {
      t: 'note',
      k: 'O que o Eco quer',
      x: 'Nulo se disfarça de "só um detalhe técnico chato" — o NullPointerException. Mas ele tem uma origem real, e bem documentada, que você vai descobrir só depois de dominar esta lua inteira.',
      warn: true,
    },
    { t: 'h', x: 'Quem cuida de Java hoje' },
    {
      t: 'p',
      x: 'A Sun Microsystems foi comprada pela Oracle em 2010, que hoje é a mantenedora principal da linguagem. Diferente de Python (que teve um "ditador benevolente" por décadas), a evolução de Java é decidida por um processo aberto chamado <b>JCP (Java Community Process)</b>, com participação de várias empresas.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual era o objetivo original do Green Project, que deu origem a Java?',
      options: [
        'Criar sites para a internet',
        'Programar aparelhos eletrônicos de consumo, como controles remotos e TVs',
        'Substituir o Python',
        'Criar um banco de dados',
      ],
      answer: 1,
      explain: 'O Green Project, na Sun Microsystems, mirava eletrônicos de consumo — a linguagem só foi direcionada à internet depois.',
    },
    {
      id: 'q2',
      q: 'Qual era o primeiro nome da linguagem, antes de virar "Java"?',
      options: ['Oak', 'Silk', 'DNA', 'Green'],
      answer: 0,
      explain: 'James Gosling batizou a linguagem de Oak, inspirado numa árvore perto do escritório dele. O nome mudou por já estar registrado por outra linguagem.',
      hint: 'É o nome de uma árvore em inglês.',
    },
    {
      id: 'q3',
      q: 'De onde veio o nome "Java"?',
      options: [
        'De uma sigla técnica da Sun Microsystems',
        'Do café, escolhido numa sessão de brainstorm',
        'Do nome de um satélite da Terra',
        'De um jogo de tabuleiro popular na equipe',
      ],
      answer: 1,
      explain: 'O nome veio do café (Java também é o nome de uma ilha indonésia famosa por sua produção de café), escolhido entre outras opções como "Silk" e "DNA".',
    },
    {
      id: 'q4',
      q: 'O que significa "Write Once, Run Anywhere"?',
      options: [
        'Todo código Java precisa ser reescrito para cada sistema operacional',
        'Um programa Java compilado roda sem alterações em qualquer sistema com a JVM instalada',
        'Java só roda em servidores Sun',
        'É o nome de um editor de código da Sun',
      ],
      answer: 1,
      explain: 'Graças à JVM (Java Virtual Machine), o mesmo bytecode compilado roda em qualquer sistema operacional que tenha a JVM.',
    },
    {
      id: 'q5',
      q: 'Complete: o formato intermediário para o qual o código Java compila, entendido pela JVM, se chama ___.',
      fill: true,
      pre: 'O formato intermediário para o qual o código Java compila se chama',
      post: '.',
      accept: ['bytecode', 'byte code'],
      wrong: ['código de máquina', 'assembly', 'script'],
      placeholder: 'nome do formato',
      explain: 'O compilador javac transforma o código-fonte em bytecode, que a JVM interpreta e executa em qualquer sistema.',
    },
    {
      id: 'q6',
      q: "Complete o comando do terminal que compila o código-fonte em bytecode (gera o Main.class):",
      fill: true,
      pre: "",
      post: "Main.java",
      accept: ["javac"],
      wrong: ["java", "jvm", "run"],
      placeholder: "?",
      explain: "<code>javac</code> é o compilador: transforma o .java em bytecode (.class). Depois, <code>java Main</code> pede à JVM para rodar.",
    },
  ],
};
