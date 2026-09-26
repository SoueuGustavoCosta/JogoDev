import type { Workshop } from '@/domain/workshop';

/**
 * Oficinas do Viajante (Etapa 13): 6 iniciais, nível Base, em PHP e JavaScript.
 * O jogo confere a SAÍDA, não o jeito: qualquer código que passe nos testes está certo.
 * As entradas (`inputs`) chegam prontas como variáveis ($a em PHP, a em JS) antes do código.
 * O teste `src/content/workshops.test.ts` roda todas as soluções de referência em todos os
 * testes (visíveis, surpresa e extra) nos motores de verdade. Para acrescentar uma oficina,
 * é só pôr mais uma aqui (id novo, nunca reaproveitado).
 * TODO(autor): Python entra quando o Pyodide (sob demanda) estiver pronto.
 */
export const workshops: Workshop[] = [
  {
    id: 'mini-calculadora',
    title: 'Mini calculadora',
    story: 'O Eco quebrou a calculadora da nave. Faça uma do seu jeito: eu só confiro se as contas batem.',
    prompt: 'Recebe dois números e uma operação (+, -, * ou /). Mostra o resultado.',
    level: 'Base',
    languages: ['php', 'js'],
    inputs: [
      { name: 'a', description: 'primeiro número' },
      { name: 'b', description: 'segundo número' },
      { name: 'op', description: 'a operação: "+", "-", "*" ou "/"' },
    ],
    tests: [
      { inputs: { a: 2, b: 3, op: '+' }, expected: '5' },
      { inputs: { a: 10, b: 4, op: '-' }, expected: '6' },
      { inputs: { a: 6, b: 7, op: '*' }, expected: '42' },
    ],
    hiddenTests: [
      { inputs: { a: 9, b: 3, op: '/' }, expected: '3' },
      { inputs: { a: 7, b: 10, op: '-' }, expected: '-3' },
    ],
    extra: {
      prompt: 'Faça sua calculadora não travar com 10 ÷ 0: mostre "erro".',
      tests: [{ inputs: { a: 10, b: 0, op: '/' }, expected: 'erro' }],
    },
    solutions: {
      php: [
        {
          title: 'Com if / elseif',
          code: 'if ($op == "+") {\n  echo $a + $b;\n} elseif ($op == "-") {\n  echo $a - $b;\n} elseif ($op == "*") {\n  echo $a * $b;\n} elseif ($b == 0) {\n  echo "erro";\n} else {\n  echo $a / $b;\n}',
        },
        {
          title: 'Com match',
          code: 'echo match ($op) {\n  "+" => $a + $b,\n  "-" => $a - $b,\n  "*" => $a * $b,\n  "/" => $b == 0 ? "erro" : $a / $b,\n};',
        },
      ],
      js: [
        {
          title: 'Com switch',
          code: 'switch (op) {\n  case "+": console.log(a + b); break;\n  case "-": console.log(a - b); break;\n  case "*": console.log(a * b); break;\n  case "/": console.log(b === 0 ? "erro" : a / b); break;\n}',
        },
        {
          title: 'Com um objeto de funções',
          code: 'const contas = {\n  "+": (x, y) => x + y,\n  "-": (x, y) => x - y,\n  "*": (x, y) => x * y,\n  "/": (x, y) => (y === 0 ? "erro" : x / y),\n};\nconsole.log(contas[op](a, b));',
        },
      ],
    },
    hints: [
      'Você precisa escolher o que fazer olhando para a operação: uma decisão para cada sinal.',
      'Compare a operação com "+", depois com "-", e assim por diante (if / else if, ou switch). Em cada caso, mostre a conta.',
      'Em PHP, o primeiro caso fica: if ($op == "+") { echo $a + $b; }. Faça igual para os outros sinais.',
    ],
    after: { trailId: 'logica', moduleId: 'decisoes' },
  },
  {
    id: 'par-ou-impar',
    title: 'Par ou ímpar',
    story: 'O Eco embaralhou as portas da nave: as pares abrem para um lado, as ímpares para o outro. Ajude a separar.',
    prompt: 'Recebe um número inteiro n. Mostra "par" ou "ímpar".',
    level: 'Base',
    languages: ['php', 'js'],
    inputs: [{ name: 'n', description: 'um número inteiro' }],
    tests: [
      { inputs: { n: 4 }, expected: 'par' },
      { inputs: { n: 7 }, expected: 'ímpar' },
      { inputs: { n: 0 }, expected: 'par' },
    ],
    hiddenTests: [
      { inputs: { n: 13 }, expected: 'ímpar' },
      { inputs: { n: -2 }, expected: 'par' },
    ],
    extra: {
      prompt: 'Números negativos ímpares também: -3 precisa dar "ímpar".',
      tests: [{ inputs: { n: -3 }, expected: 'ímpar' }],
    },
    solutions: {
      php: [
        { title: 'Com if / else', code: 'if ($n % 2 == 0) {\n  echo "par";\n} else {\n  echo "ímpar";\n}' },
        { title: 'Com operador ternário', code: 'echo $n % 2 == 0 ? "par" : "ímpar";' },
      ],
      js: [
        { title: 'Com if / else', code: 'if (n % 2 === 0) {\n  console.log("par");\n} else {\n  console.log("ímpar");\n}' },
        { title: 'Com operador ternário', code: 'console.log(n % 2 === 0 ? "par" : "ímpar");' },
      ],
    },
    hints: [
      'Um número é par quando dividir por 2 não deixa sobra.',
      'O operador % dá o resto da divisão. Compare o resto de n por 2 com zero.',
      'Em JS: if (n % 2 === 0) { console.log("par"); } else { ... }',
    ],
    after: { trailId: 'logica', moduleId: 'operadores' },
  },
  {
    id: 'tabuada',
    title: 'Tabuada',
    story: 'O Eco apagou a tabuada do painel de navegação. Sem ela, ninguém calcula a rota.',
    prompt: 'Recebe um número n. Mostra a tabuada de 1 a 10, uma linha por conta, no formato "3 x 1 = 3".',
    level: 'Base',
    languages: ['php', 'js'],
    inputs: [{ name: 'n', description: 'o número da tabuada' }],
    tests: [
      {
        inputs: { n: 3 },
        expected: '3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30',
      },
      {
        inputs: { n: 7 },
        expected: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70',
      },
    ],
    hiddenTests: [
      {
        inputs: { n: 1 },
        expected: '1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10',
      },
      {
        inputs: { n: 12 },
        expected: '12 x 1 = 12\n12 x 2 = 24\n12 x 3 = 36\n12 x 4 = 48\n12 x 5 = 60\n12 x 6 = 72\n12 x 7 = 84\n12 x 8 = 96\n12 x 9 = 108\n12 x 10 = 120',
      },
    ],
    solutions: {
      php: [
        { title: 'Com for', code: 'for ($i = 1; $i <= 10; $i++) {\n  echo "$n x $i = " . ($n * $i) . "\\n";\n}' },
        { title: 'Com while', code: '$i = 1;\nwhile ($i <= 10) {\n  echo $n . " x " . $i . " = " . $n * $i . "\\n";\n  $i++;\n}' },
      ],
      js: [
        { title: 'Com for', code: 'for (let i = 1; i <= 10; i++) {\n  console.log(`${n} x ${i} = ${n * i}`);\n}' },
        { title: 'Com while', code: 'let i = 1;\nwhile (i <= 10) {\n  console.log(n + " x " + i + " = " + n * i);\n  i++;\n}' },
      ],
    },
    hints: [
      'São 10 linhas parecidas: isso pede um laço que conta de 1 até 10.',
      'Dentro do laço, mostre n, o contador e a multiplicação dos dois. Uma linha por volta.',
      'Em PHP: for ($i = 1; $i <= 10; $i++) { echo "$n x $i = " . ($n * $i) . "\\n"; }',
    ],
    after: { trailId: 'logica', moduleId: 'loops' },
  },
  {
    id: 'maior-de-tres',
    title: 'Maior de três',
    story: 'Três sinais chegaram ao radar e o Eco escondeu qual é o mais forte. Descubra.',
    prompt: 'Recebe três números a, b e c. Mostra o maior deles.',
    level: 'Base',
    languages: ['php', 'js'],
    inputs: [
      { name: 'a', description: 'primeiro número' },
      { name: 'b', description: 'segundo número' },
      { name: 'c', description: 'terceiro número' },
    ],
    tests: [
      { inputs: { a: 3, b: 9, c: 5 }, expected: '9' },
      { inputs: { a: 10, b: 2, c: 7 }, expected: '10' },
      { inputs: { a: 1, b: 4, c: 8 }, expected: '8' },
    ],
    hiddenTests: [
      { inputs: { a: 5, b: 5, c: 2 }, expected: '5' },
      { inputs: { a: -1, b: -7, c: -3 }, expected: '-1' },
    ],
    solutions: {
      php: [
        {
          title: 'Guardando o maior até agora',
          code: '$maior = $a;\nif ($b > $maior) {\n  $maior = $b;\n}\nif ($c > $maior) {\n  $maior = $c;\n}\necho $maior;',
        },
        { title: 'Com a função max', code: 'echo max($a, $b, $c);' },
      ],
      js: [
        {
          title: 'Com if / else if',
          code: 'if (a >= b && a >= c) {\n  console.log(a);\n} else if (b >= c) {\n  console.log(b);\n} else {\n  console.log(c);\n}',
        },
        { title: 'Com Math.max', code: 'console.log(Math.max(a, b, c));' },
      ],
    },
    hints: [
      'Comece achando que o primeiro é o maior e vá conferindo os outros.',
      'Guarde o maior numa variável. Se o segundo for maior que ela, troque; depois faça o mesmo com o terceiro.',
      'Em JS: let maior = a; if (b > maior) { maior = b; } ... e no fim console.log(maior).',
    ],
    after: { trailId: 'logica', moduleId: 'decisoes' },
  },
  {
    id: 'contador-de-vogais',
    title: 'Contador de vogais',
    story: 'O Eco roubou as vogais de uma mensagem da turma. Conte quantas sobraram para eu saber o tamanho do estrago.',
    prompt: 'Recebe um texto (sem acentos). Mostra quantas vogais (a, e, i, o, u, maiúsculas ou minúsculas) ele tem.',
    level: 'Base',
    languages: ['php', 'js'],
    inputs: [{ name: 'texto', description: 'o texto a contar' }],
    tests: [
      { inputs: { texto: 'banana' }, expected: '3' },
      { inputs: { texto: 'Oficina' }, expected: '4' },
      { inputs: { texto: 'rpg' }, expected: '0' },
    ],
    hiddenTests: [
      { inputs: { texto: 'AEIOU' }, expected: '5' },
      { inputs: { texto: 'o eco voltou' }, expected: '6' },
    ],
    extra: {
      prompt: 'Conte também as vogais com acento: "ação é útil" tem 6.',
      tests: [{ inputs: { texto: 'ação é útil' }, expected: '6' }],
    },
    solutions: {
      php: [
        {
          title: 'Com expressão regular',
          code: 'echo preg_match_all("/[aeiouáéíóúâêôãõà]/iu", $texto);',
        },
        {
          title: 'Letra por letra',
          code: '$vogais = 0;\n$minusculo = strtolower($texto);\nfor ($i = 0; $i < strlen($minusculo); $i++) {\n  if (str_contains("aeiou", $minusculo[$i])) {\n    $vogais++;\n  }\n}\necho $vogais;',
        },
      ],
      js: [
        {
          title: 'Letra por letra',
          code: 'let vogais = 0;\nfor (const letra of texto.toLowerCase()) {\n  if ("aeiouáéíóúâêôãõà".includes(letra)) {\n    vogais++;\n  }\n}\nconsole.log(vogais);',
        },
        { title: 'Com expressão regular', code: 'console.log((texto.match(/[aeiouáéíóúâêôãõà]/gi) || []).length);' },
      ],
    },
    hints: [
      'Passe pelo texto letra por letra e conte as que são vogais.',
      'Use um contador que começa em 0. Para cada letra (em minúscula), se ela estiver em "aeiou", some 1.',
      'Em JS: for (const letra of texto.toLowerCase()) { if ("aeiou".includes(letra)) { vogais++; } }',
    ],
    after: { trailId: 'logica', moduleId: 'arrays' },
  },
  {
    id: 'conversor-de-temperatura',
    title: 'Conversor de temperatura',
    story: 'O termômetro da nave agora só fala Fahrenheit, e a turma só entende Celsius. O Eco adorou a confusão.',
    prompt: 'Recebe uma temperatura em graus Celsius (c). Mostra quanto ela vale em Fahrenheit: F = C × 9 / 5 + 32.',
    level: 'Base',
    languages: ['php', 'js'],
    inputs: [{ name: 'c', description: 'temperatura em Celsius' }],
    tests: [
      { inputs: { c: 0 }, expected: '32' },
      { inputs: { c: 100 }, expected: '212' },
      { inputs: { c: 37 }, expected: '98.6' },
    ],
    hiddenTests: [
      { inputs: { c: -40 }, expected: '-40' },
      { inputs: { c: 25 }, expected: '77' },
    ],
    solutions: {
      php: [
        { title: 'Direto na fórmula', code: 'echo $c * 9 / 5 + 32;' },
        { title: 'Com uma função', code: 'function paraFahrenheit($celsius) {\n  return $celsius * 9 / 5 + 32;\n}\necho paraFahrenheit($c);' },
      ],
      js: [
        { title: 'Direto na fórmula', code: 'console.log(c * 9 / 5 + 32);' },
        { title: 'Com uma arrow function', code: 'const paraFahrenheit = (celsius) => celsius * 9 / 5 + 32;\nconsole.log(paraFahrenheit(c));' },
      ],
    },
    hints: [
      'É só uma conta: a fórmula já está no enunciado.',
      'Multiplique c por 9, divida por 5 e some 32. Depois mostre o resultado.',
      'Em PHP: echo $c * 9 / 5 + 32;',
    ],
    after: { trailId: 'logica', moduleId: 'funcoes' },
  },
];
