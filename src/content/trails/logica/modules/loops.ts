import type { Module } from '@/domain/trail/types';

/**
 * Migrado de Ilha_da_Logica_PHP_1.html (módulo "loops" — "Laços de repetição").
 * O widget "Monte o seu laço for" virou o jogo `laco-for` (ForLoopBuilderWidget).
 */
export const modLoops: Module = {
  id: 'loops',
  short: 'Laços de repetição',
  title: 'Laços de repetição: for, while e amigos',
  lead: 'Fazer o computador repetir por você, sem escrever a mesma linha mil vezes.',
  level: 'Intermediário',
  blocks: [
    {
      t: 'say',
      x: 'Farol 6. Cuidado: este é o território do meu inimigo. O Bug mora dentro de um laço que nunca termina. Se você aprender a anatomia de um laço, saberá exatamente como ele escapa.',
    },
    { t: 'h', x: 'Por que repetir?' },
    {
      t: 'p',
      x: 'A apostila propõe: ler o nome de todos os alunos da faculdade, mais de 200 mil. Pedir e guardar um por um seria impossível. O <b>laço de repetição</b> pega um trecho de código e o repete quantas vezes forem necessárias.',
    },
    {
      t: 'note',
      k: 'Anatomia de todo laço',
      x: 'Todo laço, em qualquer linguagem, tem três coisas: <b>1)</b> uma variável de controle (com valor inicial), <b>2)</b> um teste que decide quando parar e <b>3)</b> algo que modifica a variável a cada volta. Esqueceu qualquer uma? Laço quebrado.',
    },
    { t: 'h', x: 'for: quando você sabe quantas voltas' },
    {
      t: 'code',
      file: 'for.php',
      lang: 'php',
      nolab: true,
      x: '<?php\nfor ($i = 1; $i <= 5; $i++) {\n    // ↑ início    ↑ teste   ↑ modificação\n    echo "Contagem: $i <br>";\n}\n?>',
    },
    { t: 'out', file: 'Saída', x: 'Contagem: 1\nContagem: 2\nContagem: 3\nContagem: 4\nContagem: 5' },
    { t: 'h', x: 'while: enquanto a condição for verdadeira' },
    {
      t: 'p',
      x: 'No <code>while</code>, as três peças ficam separadas: o valor inicial vem <b>antes</b>, o teste vai na "porta" e a modificação vai <b>dentro</b> do corpo.',
    },
    {
      t: 'code',
      file: 'while.php',
      lang: 'php',
      nolab: true,
      x: '<?php\n$contador = 1;                 // início\nwhile ($contador <= 5) {       // teste\n    echo "Repetição número $contador <br>";\n    $contador++;               // modificação (não esqueça!)\n}\n?>',
    },
    { t: 'h', x: 'do...while, foreach, break e continue' },
    {
      t: 'cards',
      items: [
        { h: 'do ... while', x: 'Igual ao while, mas o teste é feito no <b>final</b>. Por isso o corpo executa <b>pelo menos uma vez</b>.' },
        { h: 'foreach', x: 'Percorre todos os elementos de um array, sem precisar de contador.' },
        { h: 'break', x: 'Sai do laço imediatamente.' },
        { h: 'continue', x: 'Pula o resto desta volta e vai para a próxima.' },
      ],
    },
    {
      t: 'code',
      file: 'foreach.php',
      lang: 'php',
      nolab: true,
      x: '<?php\n$cursos = ["Informática", "Sistemas", "Redes"];\nforeach ($cursos as $curso) {\n    echo "Curso: $curso <br>";\n}\n?>',
    },
    { t: 'h', x: 'Laboratório de laços' },
    { t: 'p', x: 'Monte um laço e veja as voltas. Tente inverter o passo (use -1 com fim maior que o início) para ver o que é um laço infinito.' },
    { t: 'gui', widget: 'laco-for' },
    { t: 'h', x: 'Laço dentro de laço: percorrendo o tabuleiro' },
    {
      t: 'p',
      x: 'O tabuleiro do Jogo da Velha é uma matriz 3 por 3. Para visitar as 9 casas, usamos dois laços, um dentro do outro. Este é o código real do arquivo do professor:',
    },
    {
      t: 'code',
      file: 'jogo da velha (trecho)',
      lang: 'php',
      nolab: true,
      x: 'for ($i = 0; $i < LIM; $i++) {          // linhas: 0, 1, 2\n    for ($j = 0; $j < LIM; $j++) {      // colunas: 0, 1, 2\n        echo "casa [$i][$j]<br>";\n    }\n}',
    },
    {
      t: 'table',
      cols: ['Volta', '$i (linha)', '$j (coluna)'],
      rows: [
        ['1', '0', '0'],
        ['2', '0', '1'],
        ['3', '0', '2'],
        ['4', '1', '0'],
        ['5', '1', '1'],
        ['6', '1', '2'],
        ['7', '2', '0'],
        ['8', '2', '1'],
        ['9', '2', '2'],
      ],
    },
    {
      t: 'note',
      k: 'Alerta de loop infinito',
      warn: true,
      x: 'Se a condição <b>nunca</b> ficar falsa, o laço nunca termina e o programa trava. Exemplos: <code>while (true)</code>, esquecer o <code>$contador++</code>, ou usar <code>$i--</code> quando queria <code>$i++</code>. No servidor, o PHP interrompe o script depois de um tempo máximo (por padrão, 30 segundos). Guarde este alerta: ele volta no Jogo da Velha.',
    },
  ],
  quiz: [
    {
      q: 'Quantas vezes executa  for ($i = 1; $i <= 5; $i++) ?',
      fill: true,
      pre: 'Voltas:',
      post: '',
      accept: ['5'],
      placeholder: '?',
      explain: 'De 1 até 5 contando de 1 em 1: 5 voltas.',
    },
    {
      q: 'Complete a modificação do laço para contar de 0 a 2:',
      fill: true,
      pre: 'for ($i = 0; $i < 3;',
      post: ') {',
      accept: ['$i++', '++$i', '$i+=1', '$i=$i+1'],
      placeholder: '?',
      explain: '<code>$i++</code> soma 1 a cada volta, até o teste <code>$i &lt; 3</code> falhar.',
      hint: 'É a terceira peça do laço: o que muda a variável a cada volta. Olhe o for.php lá em cima.',
    },
    {
      q: 'Qual laço garante executar o corpo pelo menos uma vez?',
      options: ['for', 'while', 'do ... while', 'foreach'],
      answer: 2,
      explain: 'O <code>do...while</code> testa no final, então executa antes de perguntar.',
    },
    {
      q: 'Qual destes laços NUNCA termina?',
      options: ['for ($i=1; $i<=10; $i++)', 'for ($i=1; $i<=10; $i--)', 'while ($i < 3) { $i++; }', 'foreach ($lista as $x)'],
      answer: 1,
      explain: '<code>$i--</code> faz o <code>$i</code> descer e o teste <code>$i &lt;= 10</code> nunca fica falso.',
    },
    {
      q: 'O que faz o comando break dentro de um laço?',
      options: ['Pula uma volta', 'Sai do laço', 'Reinicia o laço', 'Apaga a variável'],
      answer: 1,
      explain: '<code>break</code> encerra o laço na hora. Já <code>continue</code> só pula a volta atual.',
    },
    {
      q: 'Um laço externo roda 3 vezes e, dentro dele, um laço interno roda 3 vezes. Quantas vezes o corpo interno executa?',
      fill: true,
      pre: 'Total:',
      post: '',
      accept: ['9'],
      placeholder: '?',
      explain: '3 x 3 = 9, exatamente as casas do tabuleiro.',
    },
  ],
};
