import type { Module } from '@/domain/trail/types';

/**
 * Migrado de Ilha_da_Logica_PHP_1.html (módulo "origem" — "A ilha nasce: algoritmos").
 */
export const modOrigem: Module = {
  id: 'origem',
  short: 'A era nasce: algoritmos',
  title: 'A era nasce: o que é lógica de programação?',
  lead: 'Antes de qualquer linguagem existia uma ideia: resolver problemas em passos. Foi ela que fez esta era emergir do mapa.',
  level: 'Base',
  blocks: [
    {
      t: 'say',
      x: 'Bem-vindo(a) ao Farol 1, {name}. Eu sou a Sintaxe. A era surgiu em três tempestades de ideias. Vou mostrar onde cada uma caiu, porque é justamente essa história que o Bug está tentando apagar.',
    },
    { t: 'h', x: 'Por que esta era existe?' },
    {
      t: 'p',
      x: 'Linguagens vêm e vão: PHP, Python, Java, C... Cada uma tem sua sintaxe, seu jeito de escrever. Mas por baixo de todas existe a mesma coisa: <b>lógica</b>, a capacidade de quebrar um problema em passos claros, na ordem certa. Quem domina a lógica aprende qualquer linguagem depressa. Por isso a era vem antes de todas as outras.',
    },
    { t: 'h', x: 'As três tempestades (fatos reais)' },
    {
      t: 'timeline',
      items: [
        {
          y: 'por volta de 825',
          h: 'al-Khwarizmi dá nome ao algoritmo',
          x: 'O matemático persa al-Khwarizmi escreveu sobre os numerais indo-arábicos e sobre regras de cálculo passo a passo. Quando esses textos foram traduzidos para o latim, no século XII, começavam com "Dixit Algoritmi" ("Assim falou al-Khwarizmi"). Do nome dele veio a palavra <b>algoritmo</b>.',
        },
        {
          y: '1843',
          h: 'Ada Lovelace escreve o primeiro programa publicado',
          x: 'Ada Lovelace publicou a Nota G, junto da tradução de um artigo sobre a Máquina Analítica de Charles Babbage. A nota descreve, passo a passo, como a máquina calcularia os números de Bernoulli, e por isso é considerada o primeiro programa de computador publicado. Ada também intuiu algo maior: uma máquina dessas poderia manipular música e outros símbolos, não só números.',
        },
        {
          y: '1972',
          h: 'Kernighan escreve o "hello, world"',
          x: 'Nos Bell Labs, Brian Kernighan escreveu o tutorial "A Tutorial Introduction to the Language B", que traz o mais antigo "hello, world" documentado. Em 1978, o livro "The C Programming Language" (Kernighan e Ritchie) espalhou o ritual pelo mundo. Você vai conhecê-lo no próximo farol.',
        },
      ],
    },
    {
      t: 'note',
      k: 'O que o Bug quer',
      x: 'Sem al-Khwarizmi, ninguém teria a ideia de "receita de cálculo". Sem Ada, ninguém teria pensado em programar uma máquina. Sem o "hello, world", ninguém teria o primeiro teste. Se as três tempestades sumirem, a era some junto.',
    },
    { t: 'h', x: 'O que é um algoritmo, afinal?' },
    {
      t: 'p',
      x: 'Segundo a apostila, um <b>algoritmo</b> é uma sequência lógica e bem definida de instruções para realizar uma tarefa. Não precisa ser de computador: uma receita de bolo, o manual de um aparelho, o roteiro para chupar uma bala. O que importa é ter <b>início, fim e uma ordem lógica</b>.',
    },
    {
      t: 'p',
      x: 'Repare: para assar o bolo, primeiro você compra os ingredientes, depois mistura, depois leva ao forno. Se inverter a ordem, o bolo não sai. Algoritmos diferentes podem resolver o mesmo problema; alguns gastam menos tempo ou esforço que outros.',
    },
    { t: 'h', x: 'Todo programa tem três partes' },
    {
      t: 'cards',
      items: [
        { h: 'Entrada', x: 'Toda informação que o algoritmo recebe. Ela precisa ser guardada em algum lugar, geralmente em variáveis.' },
        { h: 'Processamento', x: 'O que o algoritmo faz com os dados: cálculos, decisões, repetições.' },
        { h: 'Saída', x: 'O resultado mostrado: na tela, em arquivo ou na impressora.' },
      ],
    },
    { t: 'flow', items: ['Entrada', 'Processamento', 'Saída'] },
    { t: 'h', x: 'Algoritmo x programa' },
    {
      t: 'p',
      x: 'O algoritmo é a ideia. O <b>programa</b> é a ideia traduzida para uma linguagem, seguindo a sintaxe e a semântica dela. Antes de programar, a apostila sugere escrever em <b>Portugol</b>, um português estruturado. Veja o mesmo algoritmo (somar dois números) nos dois formatos:',
    },
    {
      t: 'code',
      file: 'soma.portugol',
      lang: 'pt',
      nolab: true,
      x: 'Variáveis\n    numero1 : inteiro\n    numero2 : inteiro\n    soma : inteiro\nInício\n    Leia numero1\n    Leia numero2\n    soma = numero1 + numero2\n    Escreva soma\nFim',
    },
    {
      t: 'code',
      file: 'soma.php',
      lang: 'php',
      nolab: true,
      x: '<?php\n$numero1 = 10;                 // entrada\n$numero2 = 5;                  // entrada\n$soma = $numero1 + $numero2;   // processamento\necho $soma;                    // saída\n?>',
    },
    { t: 'out', file: 'Saída no navegador', x: '15' },
    {
      t: 'note',
      k: 'Regra prática',
      x: 'Dica da apostila: escreva o algoritmo em português <b>antes</b> de codificar. Quem pensa direito no papel erra menos no teclado.',
    },
    { t: 'h', x: 'Compilador, interpretador e níveis de linguagem' },
    {
      t: 'p',
      x: 'O computador só entende dois estados: ligado e desligado. Para conversarmos com ele, precisamos de um tradutor. O <b>compilador</b> recebe o código fonte e o transforma em um programa executável. Já um <b>interpretador</b> lê e executa o código aos poucos, sem gerar um executável separado.',
    },
    {
      t: 'p',
      x: 'Linguagens com sintaxe próxima do nosso idioma são de <b>alto nível</b>; as mais próximas da máquina (ligado/desligado) são de <b>baixo nível</b>. PHP, Python e Java são de alto nível; C fica no meio do caminho, mais perto da máquina.',
    },
  ],
  quiz: [
    {
      q: 'A palavra "algoritmo" vem do nome de qual matemático?',
      options: ['Ada Lovelace', 'al-Khwarizmi', 'Brian Kernighan', 'Charles Babbage'],
      answer: 1,
      explain: 'Traduções latinas dos textos de al-Khwarizmi começavam com "Dixit Algoritmi". Daí veio "algoritmo".',
    },
    {
      q: 'Qual afirmação define melhor um algoritmo?',
      options: [
        'Um programa escrito em PHP',
        'Uma sequência lógica e bem definida de instruções para resolver um problema',
        'Um tipo de banco de dados',
        'Um erro no computador',
      ],
      answer: 1,
      explain: 'Algoritmo é a ideia (a sequência lógica). O programa é essa ideia traduzida para uma linguagem.',
    },
    {
      q: 'Em "somar dois números e mostrar o resultado", qual parte é "mostrar o resultado"?',
      options: ['Entrada', 'Processamento', 'Saída', 'Variável'],
      answer: 2,
      explain: 'Mostrar o resultado é a saída. Receber os números é a entrada e somar é o processamento.',
    },
    {
      q: 'Ada Lovelace é lembrada em 1843 por ter escrito...',
      options: [
        'O primeiro programa de computador publicado (Nota G)',
        'O primeiro "hello, world"',
        'O compilador da linguagem C',
        'A linguagem PHP',
      ],
      answer: 0,
      explain: 'A Nota G descreve como a Máquina Analítica calcularia números de Bernoulli.',
    },
    {
      q: 'Complete: em PHP, o comando que exibe um texto na tela é...',
      fill: true,
      pre: '',
      post: ' "Olá!";',
      accept: ['echo', 'print'],
      wrong: ['say', 'show', 'write'],
      placeholder: '?',
      explain: '<code>echo</code> envia o texto para a saída. (<code>print</code> também funciona.)',
    },
  ],
};
