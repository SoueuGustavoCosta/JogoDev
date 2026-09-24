import type { Module } from '@/domain/trail/types';

/** Farol 3 da Lua de Python: operadores e estruturas de decisão. */
export const modOperadores: Module = {
  id: 'operadores-condicoes',
  short: 'Comparar e decidir',
  title: 'Operadores e condições',
  lead: 'Onduluk se disfarça em comparações mal-escritas. Vamos aprender a comparar valores e ramificar o código com segurança.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'Operadores aritméticos' },
    {
      t: 'table',
      cols: ['Operador', 'Significado', 'Exemplo'],
      rows: [
        ['+', 'soma', '3 + 2 → 5'],
        ['-', 'subtração', '3 - 2 → 1'],
        ['*', 'multiplicação', '3 * 2 → 6'],
        ['/', 'divisão (sempre float)', '7 / 2 → 3.5'],
        ['//', 'divisão inteira', '7 // 2 → 3'],
        ['%', 'resto da divisão', '7 % 2 → 1'],
        ['**', 'potência', '2 ** 3 → 8'],
      ],
    },
    {
      t: 'note',
      k: 'A armadilha de Onduluk: / vs //',
      x: 'Em Python, / sempre devolve float, mesmo dividindo números redondos (6 / 2 é 3.0, não 3). Quem quer o resultado inteiro, sem casas decimais, usa //.',
      warn: true,
    },
    { t: 'h', x: 'Operadores de comparação' },
    {
      t: 'p',
      x: 'Comparações devolvem sempre um valor booleano (True ou False): <code>==</code> (igual), <code>!=</code> (diferente), <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>.',
    },
    {
      t: 'code',
      file: 'comparacoes.py',
      lang: 'python',
      nolab: true,
      x: 'idade = 20\nprint(idade == 20)   # True\nprint(idade != 18)   # True\nprint(idade >= 18)   # True',
    },
    { t: 'h', x: 'Um truque que só Python tem: comparação encadeada' },
    {
      t: 'p',
      x: 'Em várias linguagens você precisa escrever <code>idade &gt;= 0 and idade &lt;= 17</code>. Python deixa você escrever isso <b>encadeado</b>, do jeito que se lê em voz alta:',
    },
    {
      t: 'code',
      file: 'encadeada.py',
      lang: 'python',
      nolab: true,
      x: 'idade = 15\nif 0 <= idade <= 17:\n    print("Menor de idade")',
    },
    { t: 'h', x: 'Operadores lógicos: and, or, not' },
    {
      t: 'p',
      x: 'Python escreve os operadores lógicos como palavras, não símbolos: <code>and</code> (e), <code>or</code> (ou), <code>not</code> (negação) — ao contrário de PHP, que usa <code>&&</code>, <code>||</code>, <code>!</code>.',
    },
    { t: 'h', x: 'if / elif / else' },
    {
      t: 'p',
      x: 'A palavra para "senão se" é <code>elif</code> (contração de "else if"), não <code>elseif</code> nem <code>else if</code>.',
    },
    {
      t: 'code',
      file: 'decisao.py',
      lang: 'python',
      nolab: true,
      x: 'nota = 7\n\nif nota >= 9:\n    print("Excelente")\nelif nota >= 6:\n    print("Aprovado")\nelse:\n    print("Precisa estudar mais")',
    },
    {
      t: 'out',
      file: 'decisao.out',
      x: 'Aprovado',
    },
    { t: 'h', x: 'O bug clássico: = não é ==' },
    {
      t: 'note',
      k: 'Cuidado',
      x: 'Um único = é atribuição (guarda um valor). Dois == comparam. Usar = dentro de um if em Python nem compila — o interpretador acusa erro de sintaxe na hora, o que já evita boa parte do problema que existe em outras linguagens.',
    },
    { t: 'h', x: 'Verdadeiro ou falso: o "truthiness"' },
    {
      t: 'p',
      x: 'Dentro de um if, Python trata alguns valores como automaticamente falsos, mesmo sem serem True/False: <code>0</code>, <code>0.0</code>, <code>""</code> (texto vazio), <code>[]</code> (lista vazia), <code>None</code>. Qualquer outro valor conta como verdadeiro.',
    },
    {
      t: 'code',
      file: 'truthy.py',
      lang: 'python',
      nolab: true,
      x: 'carrinho = []\n\nif carrinho:\n    print("Tem item no carrinho")\nelse:\n    print("Carrinho vazio")',
    },
  ],
  quiz: [
    {
      q: 'O que 7 / 2 retorna em Python?',
      options: ['3', '3.5', '3.0', 'erro'],
      answer: 1,
      explain: 'Em Python, / sempre faz divisão de ponto flutuante e retorna float: 7 / 2 é 3.5.',
    },
    {
      q: 'Qual operador retorna só a parte inteira da divisão, sem casas decimais?',
      options: ['/', '//', '%', '**'],
      answer: 1,
      explain: '// é a divisão inteira (floor division): 7 // 2 vale 3.',
    },
    {
      q: 'Qual é a palavra usada em Python para "senão se"?',
      options: ['elseif', 'else if', 'elif', 'otherwise'],
      answer: 2,
      explain: 'Python usa elif, uma contração de "else if", diferente de outras linguagens.',
    },
    {
      q: 'Qual dessas expressões é válida em Python (comparação encadeada)?',
      options: ['0 <= idade <= 17', 'idade in (0 to 17)', '0 -> idade -> 17', '0..17 == idade'],
      answer: 0,
      explain: 'Python permite encadear comparações: 0 <= idade <= 17 equivale a (0 <= idade) and (idade <= 17).',
      hint: 'Pense em como você leria a condição em voz alta.',
    },
    {
      q: 'Complete: em vez de && e ||, Python escreve os operadores lógicos como palavras: ___ e or.',
      fill: true,
      pre: 'Em vez de && e ||, Python escreve os operadores lógicos como palavras:',
      post: 'e or.',
      accept: ['and'],
      placeholder: 'palavra',
      explain: 'Python usa and, or e not por extenso, no lugar de &&, || e !.',
    },
  ],
};
