import type { Module } from '@/domain/trail/types';

/** Farol 4 da Lua de Java: for, while, do-while e o for-each. */
export const modLoops: Module = {
  id: 'loops-java',
  short: 'Repetir com controle',
  title: 'Laços: for, while, do-while e for-each',
  lead: 'Java tem um laço a mais que Python: o do-while, que garante rodar pelo menos uma vez.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'for clássico: início, condição, incremento' },
    {
      t: 'code',
      file: 'ForClassico.java',
      lang: 'java',
      nolab: true,
      x: 'for (int i = 0; i < 3; i++) {\n    System.out.println(i);\n}',
    },
    {
      t: 'out',
      file: 'ForClassico.out',
      x: '0\n1\n2',
    },
    { t: 'h', x: 'for-each: percorrendo uma coleção direto' },
    {
      t: 'code',
      file: 'ForEach.java',
      lang: 'java',
      nolab: true,
      x: 'String[] frutas = {"maçã", "banana", "uva"};\n\nfor (String fruta : frutas) {\n    System.out.println(fruta);\n}',
    },
    {
      t: 'note',
      k: 'Lê-se "para cada"',
      x: 'for (String fruta : frutas) lê-se "para cada fruta em frutas". É o mais parecido com o for de Python, mas ainda exige o tipo (String) declarado.',
    },
    { t: 'h', x: 'while: repete enquanto for verdadeiro' },
    {
      t: 'code',
      file: 'While.java',
      lang: 'java',
      nolab: true,
      x: 'int n = 0;\nwhile (n < 3) {\n    System.out.println(n);\n    n++;\n}',
    },
    { t: 'h', x: 'do-while: roda pelo menos uma vez' },
    {
      t: 'p',
      x: 'A diferença do <code>do-while</code>: a condição só é testada <b>depois</b> do bloco rodar. Mesmo que a condição já comece falsa, o bloco roda uma vez.',
    },
    {
      t: 'code',
      file: 'DoWhile.java',
      lang: 'java',
      nolab: true,
      x: 'int tentativas = 0;\ndo {\n    System.out.println("Tentativa " + tentativas);\n    tentativas++;\n} while (tentativas < 3);',
    },
    { t: 'h', x: 'Comparando os três' },
    {
      t: 'table',
      cols: ['Laço', 'Quando testa a condição', 'Roda pelo menos uma vez?'],
      rows: [
        ['for / while', 'antes do bloco', 'não, se a condição já começar falsa'],
        ['do-while', 'depois do bloco', 'sim, sempre'],
      ],
    },
    { t: 'h', x: 'break e continue' },
    {
      t: 'code',
      file: 'BreakContinue.java',
      lang: 'java',
      nolab: true,
      x: 'for (int numero = 0; numero < 10; numero++) {\n    if (numero == 5) {\n        break;\n    }\n    if (numero % 2 == 0) {\n        continue;\n    }\n    System.out.println(numero);\n}',
    },
  ],
  quiz: [
    {
      q: 'Qual laço em Java garante rodar o bloco pelo menos uma vez, mesmo que a condição já comece falsa?',
      options: ['for', 'while', 'do-while', 'for-each'],
      answer: 2,
      explain: 'No do-while, a condição só é testada depois do bloco rodar, então ele sempre executa pelo menos uma vez.',
    },
    {
      q: 'O que for (String fruta : frutas) representa?',
      options: [
        'Um erro de sintaxe',
        'Um for-each: "para cada fruta em frutas"',
        'Um for clássico com 3 partes',
        'Um switch disfarçado',
      ],
      answer: 1,
      explain: 'É a sintaxe do for-each de Java, percorrendo cada item da coleção diretamente, sem índice.',
    },
    {
      q: 'No for (int i = 0; i < 3; i++), quantas vezes o bloco roda?',
      options: ['2', '3', '4', 'infinitas'],
      answer: 1,
      explain: 'i começa em 0 e roda enquanto i < 3: 0, 1, 2 — três voltas.',
    },
    {
      q: 'Qual comando interrompe o laço imediatamente, sem terminar a volta atual?',
      options: ['continue', 'break', 'return', 'stop'],
      answer: 1,
      explain: 'break interrompe o laço na hora. continue pula só o resto da volta atual.',
    },
    {
      q: 'Complete: no do-while, a condição é testada ___ o bloco rodar, ao contrário do while.',
      fill: true,
      pre: 'No do-while, a condição é testada',
      post: 'o bloco rodar, ao contrário do while.',
      accept: ['depois de', 'depois', 'apos', 'após'],
      placeholder: 'antes ou depois',
      explain: 'do-while testa a condição só depois de executar o bloco uma vez, garantindo pelo menos uma execução.',
    },
  ],
};
