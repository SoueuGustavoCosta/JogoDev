import type { Module } from '@/domain/trail/types';

/** Farol 4 da Lua de PHP: for, while, do-while e foreach (com chave => valor). */
export const modLoops: Module = {
  id: 'loops-php',
  short: 'Repetir com propósito',
  title: 'Laços: for, while, do-while e foreach',
  lead: 'PHP tem os mesmos quatro laços de Java, mas o foreach ganha um poder a mais: percorrer chave e valor ao mesmo tempo.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'for clássico' },
    {
      t: 'code',
      file: 'for.php',
      lang: 'php',
      nolab: true,
      x: 'for ($i = 0; $i < 3; $i++) {\n    echo $i;\n}',
    },
    {
      t: 'out',
      file: 'for.out',
      x: '012',
    },
    { t: 'h', x: 'while e do-while' },
    {
      t: 'code',
      file: 'while.php',
      lang: 'php',
      nolab: true,
      x: '$n = 0;\nwhile ($n < 3) {\n    echo $n;\n    $n++;\n}',
    },
    {
      t: 'code',
      file: 'doWhile.php',
      lang: 'php',
      nolab: true,
      x: '$tentativas = 0;\ndo {\n    echo "Tentativa $tentativas ";\n    $tentativas++;\n} while ($tentativas < 3);',
    },
    { t: 'h', x: 'foreach: percorrendo arrays direto' },
    {
      t: 'p',
      x: 'O <code>foreach</code> percorre um array sem precisar de índice manual. Para arrays associativos, dá para pegar a chave <b>e</b> o valor ao mesmo tempo, com <code>=&gt;</code>.',
    },
    {
      t: 'code',
      file: 'foreach.php',
      lang: 'php',
      nolab: true,
      x: '$frutas = ["maçã", "banana", "uva"];\n\nforeach ($frutas as $fruta) {\n    echo $fruta . "\\n";\n}',
    },
    {
      t: 'code',
      file: 'foreachChaveValor.php',
      lang: 'php',
      nolab: true,
      x: '$viajante = ["nome" => "Ana", "xp" => 150];\n\nforeach ($viajante as $chave => $valor) {\n    echo "$chave: $valor\\n";\n}',
    },
    {
      t: 'out',
      file: 'foreachChaveValor.out',
      x: 'nome: Ana\nxp: 150',
    },
    { t: 'h', x: 'break e continue' },
    {
      t: 'code',
      file: 'breakContinue.php',
      lang: 'php',
      nolab: true,
      x: 'for ($numero = 0; $numero < 10; $numero++) {\n    if ($numero == 5) {\n        break;\n    }\n    if ($numero % 2 == 0) {\n        continue;\n    }\n    echo $numero;\n}',
    },
  ],
  quiz: [
    {
      q: 'O que foreach ($viajante as $chave => $valor) permite fazer?',
      options: [
        'Percorrer um array pegando a chave e o valor ao mesmo tempo',
        'Criar um array novo vazio',
        'Ordenar o array automaticamente',
        'Um erro de sintaxe em PHP',
      ],
      answer: 0,
      explain: 'A sintaxe chave => valor no foreach permite acessar tanto a chave quanto o valor de cada item de um array associativo.',
    },
    {
      q: 'Qual laço garante rodar o bloco pelo menos uma vez, mesmo que a condição já comece falsa?',
      options: ['for', 'while', 'do-while', 'foreach'],
      answer: 2,
      explain: 'No do-while, a condição só é testada depois do bloco rodar, garantindo pelo menos uma execução.',
    },
    {
      q: 'O que for ($i = 0; $i < 3; $i++) { echo $i; } imprime?',
      options: ['0 1 2', '012', '123', '0123'],
      answer: 1,
      explain: 'echo sem separador junta os valores sem espaço: 0, 1, 2 saem colados como "012".',
    },
    {
      q: 'Qual comando pula o resto da volta atual, sem sair do laço inteiro?',
      options: ['break', 'continue', 'return', 'exit'],
      answer: 1,
      explain: 'continue pula direto para a próxima volta; break sai do laço inteiro.',
    },
    {
      q: 'Complete: para percorrer os itens de um array sem controlar um índice manualmente, PHP usa o laço ___.',
      fill: true,
      pre: 'Para percorrer os itens de um array sem controlar um índice manualmente, PHP usa o laço',
      post: '.',
      accept: ['foreach'],
      wrong: ['for', 'while', 'do'],
      placeholder: 'nome do laço',
      explain: 'foreach percorre cada item de um array diretamente, sem precisar de um índice manual como no for clássico.',
    },
  ],
};
