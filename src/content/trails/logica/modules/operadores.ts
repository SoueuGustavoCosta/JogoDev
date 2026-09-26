import type { Module } from '@/domain/trail/types';

/**
 * Migrado de Ilha_da_Logica_PHP_1.html (módulo "operadores").
 * O widget "Tabela-verdade ao vivo" virou o jogo `tabela-verdade` (TruthTableWidget).
 */
export const modOperadores: Module = {
  id: 'operadores',
  short: 'Operadores',
  title: 'Operadores: calcular, comparar e combinar',
  lead: 'As ferramentas para fazer contas, comparar valores e juntar condições.',
  level: 'Base',
  blocks: [
    {
      t: 'say',
      x: 'Farol 4. Aqui mora a pegadinha mais famosa da programação: um sinal de igual a menos. Vamos com calma.',
    },
    { t: 'h', x: 'Operadores aritméticos' },
    {
      t: 'table',
      cols: ['Operador', 'Faz', 'Exemplo', 'Resultado'],
      rows: [
        ['<code>+</code>', 'Soma', '<code>10 + 3</code>', '13'],
        ['<code>-</code>', 'Subtração', '<code>10 - 3</code>', '7'],
        ['<code>*</code>', 'Multiplicação', '<code>10 * 3</code>', '30'],
        ['<code>/</code>', 'Divisão', '<code>10 / 4</code>', '2.5'],
        ['<code>%</code>', 'Resto da divisão', '<code>10 % 3</code>', '1'],
        ['<code>**</code>', 'Potência', '<code>2 ** 3</code>', '8'],
      ],
    },
    {
      t: 'p',
      x: 'Ordem de precedência: parênteses primeiro, depois multiplicação e divisão, e por último soma e subtração. Em <code>2 + 3 * 4</code> o resultado é 14; para forçar a soma antes, use <code>(2 + 3) * 4</code>, que dá 20. (A apostila simplifica dizendo que a divisão vem antes da multiplicação; na prática as duas têm a mesma força e são resolvidas da esquerda para a direita.)',
    },
    {
      t: 'note',
      k: 'Truque do resto',
      x: 'O operador <code>%</code> é muito usado para descobrir se um número é par: <code>$n % 2 == 0</code>. Se o resto da divisão por 2 é zero, o número é par.',
    },
    { t: 'h', x: 'Operadores relacionais (comparação)' },
    {
      t: 'table',
      cols: ['Operador', 'Significa', 'Exemplo'],
      rows: [
        ['<code>==</code>', 'Igual', '<code>10 == 10</code> é verdadeiro'],
        ['<code>!=</code>', 'Diferente', '<code>10 != 5</code> é verdadeiro'],
        ['<code>&lt;</code>  <code>&gt;</code>', 'Menor que, maior que', '<code>5 &lt; 6</code> é verdadeiro'],
        ['<code>&lt;=</code>  <code>&gt;=</code>', 'Menor ou igual, maior ou igual', '<code>$x &lt;= 50</code>'],
        ['<code>===</code>', 'Idêntico (valor <b>e</b> tipo)', '<code>"5" === 5</code> é falso'],
      ],
    },
    {
      t: 'note',
      k: 'A pegadinha',
      warn: true,
      x: '<code>=</code> <b>atribui</b> e <code>==</code> <b>compara</b>. Escrever <code>if ($x = 5)</code> não pergunta se x vale 5: ele <b>coloca</b> 5 em x e a condição sempre dá verdadeiro. É um dos bugs favoritos do Bug.',
    },
    { t: 'h', x: 'Operadores lógicos: juntando condições' },
    {
      t: 'table',
      cols: ['Na apostila', 'Em PHP', 'Função'],
      rows: [
        ['E', '<code>&amp;&amp;</code> (ou <code>and</code>)', 'Verdadeiro só se <b>as duas</b> condições forem verdadeiras'],
        ['OU', '<code>||</code> (ou <code>or</code>)', 'Verdadeiro se <b>pelo menos uma</b> for verdadeira'],
        ['NÃO', '<code>!</code>', 'Inverte: verdadeiro vira falso e vice-versa'],
      ],
    },
    { t: 'gui', widget: 'tabela-verdade' },
    { t: 'h', x: 'Atalhos de atribuição' },
    {
      t: 'code',
      file: 'atalhos.php',
      lang: 'php',
      nolab: true,
      x: '<?php\n$i = 5;\n$i++;          // soma 1: agora $i vale 6\n$i--;          // subtrai 1: volta a 5\n$i += 10;      // o mesmo que $i = $i + 10  (15)\n$i *= 2;       // o mesmo que $i = $i * 2   (30)\n?>',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Quanto vale  2 + 3 * 4 ?',
      options: ['20', '14', '24', '9'],
      answer: 1,
      explain: 'A multiplicação vem antes: 3 * 4 = 12, mais 2 = 14.',
    },
    {
      id: 'q2',
      q: 'Quanto vale o resto de  10 % 3 ?',
      fill: true,
      pre: '10 % 3 =',
      post: '',
      accept: ['1'],
      wrong: ['3', '0', '10'],
      placeholder: '?',
      explain: '10 dividido por 3 dá 3 e sobra 1.',
    },
    {
      id: 'q3',
      q: 'Qual operador compara se dois valores são iguais?',
      fill: true,
      pre: '$x',
      post: '5',
      accept: ['==', '==='],
      wrong: ['=', '!=', '=>'],
      placeholder: 'op',
      explain: '<code>==</code> compara. Um <code>=</code> sozinho atribui.',
    },
    {
      id: 'q4',
      q: 'Quanto vale  true && false ?',
      options: ['true', 'false', 'erro', 'null'],
      answer: 1,
      explain: 'O "E" só é verdadeiro se as duas partes forem verdadeiras.',
    },
    {
      id: 'q5',
      q: 'O que faz  if ($x = 5)  em vez de  if ($x == 5) ?',
      options: ['Compara x com 5', 'Atribui 5 a x e a condição vira verdadeira', 'Dá erro de sintaxe', 'Compara tipos'],
      answer: 1,
      explain: 'É um bug clássico: atribuição no lugar de comparação.',
    },
    {
      id: 'q6',
      q: 'Complete: $i++ equivale a  $i = $i +',
      fill: true,
      pre: '$i = $i +',
      post: ';',
      accept: ['1'],
      wrong: ['0', '2', '$i'],
      placeholder: '?',
      explain: '<code>$i++</code> soma 1 a <code>$i</code>.',
    },
  ],
};
