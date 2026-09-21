import type { Module } from '@/domain/trail/types';

/**
 * Migrado de Ilha_da_Logica_PHP_1.html (módulo "variaveis" — "Variáveis, tipos e constantes").
 * O widget "Laboratório de tipos" (WID.types) vira um placeholder `gui`.
 */
export const modVariaveis: Module = {
  id: 'variaveis',
  short: 'Variáveis, tipos e constantes',
  title: 'Variáveis, tipos de dados e constantes',
  lead: 'Onde o programa guarda o que precisa lembrar. Cada caixinha tem nome, tipo e conteúdo.',
  level: 'Base',
  blocks: [
    {
      t: 'say',
      x: 'Farol 3. Pense numa estante cheia de caixas etiquetadas. Cada etiqueta é o nome de uma variável; o que está dentro é o valor. E cada caixa só guarda um tipo de coisa.',
    },
    { t: 'h', x: 'O que é uma variável?' },
    {
      t: 'p',
      x: 'Uma <b>variável</b> é um espaço reservado na memória para guardar um valor usado enquanto o programa roda. Ela tem um <b>nome</b> e um <b>tipo</b> (o tipo de informação que suporta). Em PHP, toda variável começa com o símbolo <code>$</code> e o tipo é <b>dinâmico</b>: o PHP descobre sozinho pelo valor.',
    },
    {
      t: 'code',
      file: 'variaveis.php',
      lang: 'php',
      nolab: true,
      x: '<?php\n$idade = 25;          // Integer (inteiro)\n$preco = 19.90;       // Float (decimal)\n$nome  = "Filipe";    // String (texto)\n$ativo = true;        // Boolean (lógico)\n?>',
    },
    {
      t: 'table',
      cols: ['Tipo', 'Guarda', 'Exemplo em PHP'],
      rows: [
        ['Integer', 'Números inteiros, positivos ou negativos', '<code>$idade = 25;</code>'],
        ['Float', 'Números decimais', '<code>$preco = 19.90;</code>'],
        ['String', 'Textos (aspas simples ou duplas)', '<code>$nome = "Filipe";</code>'],
        ['Boolean', 'Verdadeiro ou falso', '<code>$ativo = true;</code>'],
        ['Array', 'Vários valores numa só variável', "<code>$notas = [7, 8.5, 6];</code>"],
        ['NULL', 'Ausência de valor', '<code>$vazio = null;</code>'],
      ],
    },
    {
      t: 'note',
      k: 'E o tipo char?',
      x: 'A apostila cita o tipo <code>char</code> (um único caractere, entre aspas simples). Em C e Java ele existe. Em PHP não: uma letra sozinha é apenas uma string de tamanho 1.',
    },
    { t: 'h', x: 'Teste os tipos você mesmo' },
    { t: 'gui' },
    { t: 'h', x: 'A mesma ideia em quatro linguagens' },
    {
      t: 'table',
      cols: ['Conceito', 'PHP', 'Python', 'Java', 'C'],
      rows: [
        ['Inteiro', '<code>$idade = 25;</code>', '<code>idade = 25</code>', '<code>int idade = 25;</code>', '<code>int idade = 25;</code>'],
        ['Decimal', '<code>$preco = 19.90;</code>', '<code>preco = 19.90</code>', '<code>double preco = 19.90;</code>', '<code>float preco = 19.90;</code>'],
        ['Texto', '<code>$nome = "Filipe";</code>', '<code>nome = "Filipe"</code>', '<code>String nome = "Filipe";</code>', '<code>char nome[] = "Filipe";</code>'],
        ['Caractere', '<code>$letra = "A";</code>', '<code>letra = "A"</code>', "<code>char letra = 'A';</code>", "<code>char letra = 'A';</code>"],
        ['Lógico', '<code>$ativo = true;</code>', '<code>ativo = True</code>', '<code>boolean ativo = true;</code>', '<code>int ativo = 1;</code>'],
      ],
    },
    {
      t: 'p',
      x: 'Repare: em Java e C você <b>declara o tipo</b> antes do nome. Em PHP e Python, não. Por isso PHP e Python são chamadas de linguagens de tipagem dinâmica.',
    },
    { t: 'h', x: 'Regras para nomear variáveis em PHP' },
    {
      t: 'ul',
      items: [
        'Começam com <code>$</code>, seguido de letra ou underline: <code>$nota</code>, <code>$_total</code>.',
        'Não podem ter espaços nem começar com número: <code>$1nota</code> e <code>$minha nota</code> são inválidas.',
        '<b>Maiúsculas importam</b>: <code>$Nome</code> e <code>$nome</code> são variáveis diferentes.',
        'Use nomes que contem a história: <code>$mediaFinal</code> vale mais que <code>$x</code>.',
      ],
    },
    { t: 'h', x: 'O sinal de igual é uma ordem, não uma pergunta' },
    {
      t: 'p',
      x: 'Na apostila, o operador <code>=</code> é o operador de <b>atribuição</b>: pega o valor da direita e guarda na variável da esquerda. Ele "recebe". Dá para ler <code>$x = 10;</code> como "x recebe 10".',
    },
    { t: 'h', x: 'Aspas simples x aspas duplas' },
    {
      t: 'p',
      x: 'A apostila avisa: variáveis <b>sem aspas</b> são variáveis; <b>com aspas</b>, viram texto simples. Em PHP há uma sutileza extra: dentro de aspas <b>duplas</b> o PHP troca a variável pelo valor. Nas aspas <b>simples</b>, não.',
    },
    {
      t: 'code',
      file: 'aspas.php',
      lang: 'php',
      nolab: true,
      x: "<?php\n$nome = \"Ana\";\necho \"Olá, $nome\";     // aspas duplas: troca pelo valor\necho 'Olá, $nome';     // aspas simples: texto literal\necho \"Olá, \" . $nome;  // o ponto (.) junta textos\n?>",
    },
    { t: 'out', file: 'Saída', x: 'Olá, Ana\nOlá, $nome\nOlá, Ana' },
    { t: 'h', x: 'Constantes: valores que não mudam' },
    {
      t: 'p',
      x: 'Uma <b>constante</b> guarda um valor que não pode ser alterado durante a execução. A apostila dá o exemplo do PI. Se alguém tentar mudar, o programa dá erro. Em PHP usamos <code>define()</code> ou <code>const</code>, e <b>sem o $</b>. Você vai encontrar isso no Jogo da Velha:',
    },
    {
      t: 'code',
      file: 'constantes.php',
      lang: 'php',
      nolab: true,
      x: "<?php\ndefine('LIM', 3);          // tamanho do tabuleiro\ndefine('JOGADOR', 'J');    // marca do jogador\ndefine('MAQUINA', 'M');    // marca da máquina\nconst PI = 3.14159;        // outra forma de declarar\necho LIM * LIM;            // 9 casas no tabuleiro\n?>",
    },
    {
      t: 'note',
      k: 'Palavras reservadas',
      x: 'São palavras que a linguagem guarda para si, como <code>echo</code>, <code>if</code>, <code>for</code>, <code>while</code>, <code>function</code> e <code>return</code>. Você não pode usá-las como nome de variável ou constante.',
    },
  ],
  quiz: [
    {
      q: 'Em PHP, qual é o tipo de $idade = 25; ?',
      options: ['String', 'Float', 'Integer', 'Boolean'],
      answer: 2,
      explain: '25 é um número inteiro: Integer.',
    },
    {
      q: 'Qual nome de variável é válido em PHP?',
      options: ['$1nome', '$nome aluno', 'nome', '$nome_aluno'],
      answer: 3,
      explain: 'Precisa começar com $, não pode ter espaço e não pode começar com número.',
    },
    {
      q: "Se $nome = \"Ana\";, o que exibe  echo 'Olá, $nome';  ?",
      options: ['Olá, Ana', 'Olá, $nome', 'Erro', 'Nada'],
      answer: 1,
      explain: 'Aspas simples não substituem a variável: mostram o texto literal.',
    },
    {
      q: 'Complete para criar a constante LIM valendo 3:',
      fill: true,
      pre: '',
      post: "('LIM', 3);",
      accept: ['define'],
      placeholder: '?',
      explain: "<code>define('LIM', 3);</code> cria a constante. Repare que ela não usa o $.",
    },
    {
      q: 'Qual é o tipo de dado de 19.90 em PHP? (uma palavra em inglês)',
      fill: true,
      pre: '',
      post: '',
      accept: ['float', 'double'],
      placeholder: 'tipo',
      explain: 'Números com casas decimais são <code>float</code>.',
    },
    {
      q: 'Em PHP, $Nome e $nome são...',
      options: ['A mesma variável', 'Variáveis diferentes', 'Um erro', 'Constantes'],
      answer: 1,
      explain: 'Variáveis diferenciam maiúsculas de minúsculas.',
    },
  ],
};
