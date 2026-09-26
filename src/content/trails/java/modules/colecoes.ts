import type { Module } from '@/domain/trail/types';

/** Farol 5 da Lua de Java: arrays de tamanho fixo, ArrayList e generics básicos. */
export const modColecoes: Module = {
  id: 'arrays-colecoes-java',
  short: 'Guardar muitos valores',
  title: 'Arrays e coleções: tamanho fixo x tamanho flexível',
  lead: 'Java te dá dois jeitos de guardar vários valores: um rígido e rápido (array), outro flexível (ArrayList).',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Array: tamanho fixo, declarado na criação' },
    {
      t: 'p',
      x: 'Um <b>array</b> guarda vários valores do mesmo tipo, em posições numeradas a partir de <b>0</b>. O tamanho é fixo: depois de criado, não dá para adicionar nem remover posições.',
    },
    {
      t: 'code',
      file: 'Array.java',
      lang: 'java',
      nolab: true,
      x: 'int[] numeros = {10, 20, 30, 40};\nSystem.out.println(numeros[0]);    // 10\nSystem.out.println(numeros.length); // 4 (propriedade, sem parênteses)\n\nnumeros[1] = 99;   // pode trocar um valor existente\n// numeros[4] = 50;  // ArrayIndexOutOfBoundsException: não existe posição 4',
    },
    {
      t: 'note',
      k: 'O erro clássico: ArrayIndexOutOfBoundsException',
      x: 'Acessar uma posição que não existe (índice igual ou maior que o tamanho) não devolve null nem erro silencioso: o programa quebra com uma exceção na hora.',
      warn: true,
    },
    { t: 'h', x: 'ArrayList: cresce e encolhe conforme você usa' },
    {
      t: 'p',
      x: 'Quando você não sabe o tamanho de antemão, use <code>ArrayList</code>, da biblioteca padrão. Ela guarda apenas <b>tipos de referência</b> (não int puro, mas o "empacotado" Integer).',
    },
    {
      t: 'code',
      file: 'ArrayListEx.java',
      lang: 'java',
      nolab: true,
      x: 'import java.util.ArrayList;\n\nArrayList<String> frutas = new ArrayList<>();\nfrutas.add("maçã");\nfrutas.add("banana");\nfrutas.remove("maçã");\n\nSystem.out.println(frutas);        // [banana]\nSystem.out.println(frutas.size()); // 1',
    },
    { t: 'h', x: 'Generics: <String> diz o que a lista guarda' },
    {
      t: 'p',
      x: 'O <code>&lt;String&gt;</code> em <code>ArrayList&lt;String&gt;</code> é um <b>generic</b>: define, em tempo de compilação, que essa lista só aceita String. Tentar colocar outro tipo é erro de compilação, pego antes de rodar.',
    },
    { t: 'h', x: 'Array x ArrayList' },
    {
      t: 'table',
      cols: ['Aspecto', 'array', 'ArrayList'],
      rows: [
        ['Tamanho', 'fixo', 'cresce e encolhe'],
        ['Tipos aceitos', 'primitivos e referências', 'só referências (com generics)'],
        ['Tamanho', 'numeros.length (sem parênteses)', 'lista.size() (com parênteses)'],
        ['Adicionar item', 'não é possível depois de criado', 'lista.add(item)'],
      ],
    },
    { t: 'h', x: 'Percorrendo qualquer um dos dois' },
    {
      t: 'code',
      file: 'Percorrer.java',
      lang: 'java',
      nolab: true,
      x: 'for (int numero : numeros) {\n    System.out.println(numero);\n}\n\nfor (String fruta : frutas) {\n    System.out.println(fruta);\n}',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que acontece ao acessar numeros[4] num array int[] numeros = {10, 20, 30, 40}?',
      options: [
        'Retorna null',
        'Retorna 0',
        'ArrayIndexOutOfBoundsException: o programa quebra',
        'Java cria a posição automaticamente',
      ],
      answer: 2,
      explain: 'Arrays em Java têm tamanho fixo; acessar uma posição fora do intervalo lança ArrayIndexOutOfBoundsException.',
    },
    {
      id: 'q2',
      q: 'Qual a principal diferença entre array e ArrayList?',
      options: [
        'Não há diferença',
        'array tem tamanho fixo; ArrayList cresce e encolhe conforme necessário',
        'ArrayList só existe em Python',
        'array só aceita texto',
      ],
      answer: 1,
      explain: 'array precisa de tamanho definido na criação; ArrayList permite adicionar e remover itens livremente.',
    },
    {
      id: 'q3',
      q: 'O que <String> em ArrayList<String> representa?',
      options: [
        'Um comentário',
        'Um generic: define que a lista só aceita String',
        'O tamanho inicial da lista',
        'Um erro de sintaxe'],
      answer: 1,
      explain: 'Generics travam, em tempo de compilação, qual tipo aquela coleção aceita.',
      hint: 'Pense em "que tipo de coisa esta lista guarda".',
    },
    {
      id: 'q4',
      q: 'Como você descobre o tamanho de um array chamado numeros?',
      options: ['numeros.size()', 'numeros.length()', 'numeros.length', 'len(numeros)'],
      answer: 2,
      explain: 'Em array, length é uma propriedade (sem parênteses). Em ArrayList, é size() (um método, com parênteses).',
    },
    {
      id: 'q5',
      q: 'Complete: para adicionar um item numa ArrayList chamada frutas, o método usado é frutas.___(item).',
      fill: true,
      pre: 'Para adicionar um item numa ArrayList chamada frutas, o método usado é frutas.',
      post: '(item).',
      accept: ['add'],
      wrong: ['push', 'append', 'insert'],
      placeholder: 'nome do método',
      explain: 'frutas.add(item) adiciona um novo elemento ao final da ArrayList.',
    },
  ],
};
