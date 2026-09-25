import type { Module } from '@/domain/trail/types';

/** Farol 4 da Lua de Python: for, while, range() e break/continue. */
export const modLoops: Module = {
  id: 'loops-python',
  short: 'Repetir com propósito',
  title: 'Laços: for, while e range()',
  lead: 'Onduluk adora laços que nunca terminam ou que erram por um passo. Vamos aprender a controlar exatamente quantas voltas o código dá.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'for: percorrendo uma sequência' },
    {
      t: 'p',
      x: 'O <code>for</code> em Python não conta "de 1 até 10" como em outras linguagens — ele <b>percorre os itens de uma sequência</b> (uma lista, um texto, um intervalo). É outro jeito de pensar, não só outra sintaxe.',
    },
    {
      t: 'code',
      file: 'for_lista.py',
      lang: 'python',
      nolab: true,
      x: 'frutas = ["maçã", "banana", "uva"]\n\nfor fruta in frutas:\n    print(fruta)',
    },
    { t: 'h', x: 'range(): gerando uma sequência de números' },
    {
      t: 'p',
      x: 'Para repetir um número certo de vezes, use <code>range()</code>. O detalhe que mais engana: <code>range(3)</code> gera <b>0, 1, 2</b> — três números, mas parando <i>antes</i> de chegar em 3.',
    },
    {
      t: 'code',
      file: 'range.py',
      lang: 'python',
      nolab: true,
      x: 'for i in range(3):\n    print(i)',
    },
    {
      t: 'out',
      file: 'range.out',
      x: '0\n1\n2',
    },
    {
      t: 'note',
      k: 'A armadilha do range',
      x: 'range(início, fim) também para antes do fim: range(1, 4) gera 1, 2, 3 — nunca o 4. Onduluk conta com essa confusão pra criar erros "de um a menos ou a mais" (off-by-one).',
      warn: true,
    },
    { t: 'h', x: 'while: repete enquanto a condição for verdadeira' },
    {
      t: 'code',
      file: 'while.py',
      lang: 'python',
      nolab: true,
      x: 'n = 0\nwhile n < 3:\n    print(n)\n    n += 1   # sem isso, o laço nunca termina',
    },
    {
      t: 'note',
      k: 'O clássico while(True) esquecido',
      x: 'Se você esquecer de mudar a variável que o while testa, o laço roda pra sempre. É o disfarce favorito de Onduluk desde a Era da Lógica.',
      warn: true,
    },
    { t: 'h', x: 'break e continue' },
    {
      t: 'cards',
      items: [
        { h: 'break', x: 'Interrompe o laço imediatamente, mesmo que a condição ainda seja verdadeira.' },
        { h: 'continue', x: 'Pula o resto desta volta e vai direto para a próxima.' },
      ],
    },
    {
      t: 'code',
      file: 'break_continue.py',
      lang: 'python',
      nolab: true,
      x: 'for numero in range(10):\n    if numero == 5:\n        break        # para tudo ao chegar em 5\n    if numero % 2 == 0:\n        continue      # pula os pares\n    print(numero)',
    },
    { t: 'h', x: 'List comprehension: um for numa linha só' },
    {
      t: 'p',
      x: 'Um recurso bem particular de Python: construir uma lista nova a partir de um laço, em uma única linha. Não é obrigatório usar, mas é comum ver em código real.',
    },
    {
      t: 'code',
      file: 'comprehension.py',
      lang: 'python',
      nolab: true,
      x: 'quadrados = [n * n for n in range(5)]\nprint(quadrados)',
    },
    {
      t: 'out',
      file: 'comprehension.out',
      x: '[0, 1, 4, 9, 16]',
    },
  ],
  quiz: [
    {
      q: 'O que range(3) gera?',
      options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '3, 2, 1'],
      answer: 1,
      explain: 'range(3) gera 3 números começando em 0 e parando antes de 3: 0, 1, 2.',
      hint: 'range sempre para antes de chegar no número final.',
    },
    {
      q: 'O que este código imprime? for fruta in ["maçã", "banana"]: print(fruta)',
      fill: true,
      pre: 'A saída, linha por linha, é:',
      post: '',
      accept: ['maçã\nbanana', 'maça\nbanana', 'maçã banana', 'maça banana'],
      wrong: ['banana\nmaçã', 'maçã, banana', 'fruta\nfruta'],
      placeholder: 'maçã banana',
      explain: 'O for percorre cada item da lista, na ordem: primeiro "maçã", depois "banana".',
    },
    {
      q: 'No exemplo while.py deste farol, o que faria o laço nunca terminar se fosse removido?',
      options: ['A linha print(n)', 'A linha n += 1', 'A linha n = 0', 'A condição n < 3'],
      answer: 1,
      explain: 'Sem uma linha como n += 1 dentro do while, a condição n < 3 nunca muda, e o laço roda para sempre.',
    },
    {
      q: 'Qual comando interrompe o laço imediatamente, sem terminar a volta atual?',
      options: ['continue', 'break', 'pass', 'return'],
      answer: 1,
      explain: 'break sai do laço na hora. continue pula só o resto da volta atual e segue para a próxima.',
    },
    {
      q: 'O que [n * n for n in range(3)] produz?',
      options: ['[0, 1, 4]', '[1, 4, 9]', '[0, 1, 2]', '[0, 2, 4]'],
      answer: 0,
      explain: 'range(3) gera 0, 1, 2; elevando cada um ao quadrado: 0*0=0, 1*1=1, 2*2=4.',
      hint: 'Lembre que range(3) começa em 0.',
    },
  ],
};
