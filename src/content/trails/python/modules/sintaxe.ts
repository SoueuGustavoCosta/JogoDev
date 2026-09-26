import type { Module } from '@/domain/trail/types';

/** Farol 2 da Lua de Python: indentação como sintaxe, variáveis e os tipos básicos. */
export const modSintaxe: Module = {
  id: 'sintaxe-e-tipos',
  short: 'A gramática dos espaços',
  title: 'Sintaxe limpa: indentação, variáveis e tipos',
  lead: 'Onduluk adora bagunçar espaços em branco. Em Python, o espaço não é estética — é gramática.',
  level: 'Base',
  blocks: [
    {
      t: 'say',
      x: 'Repare bem nos espaços deste farol, {name}. Em outras linguagens eles são só estética. Aqui, eles decidem o que pertence a qual bloco.',
    },
    { t: 'h', x: 'Chaves não, indentação sim' },
    {
      t: 'p',
      x: 'PHP e a maioria das linguagens usam <code>{ }</code> para marcar onde um bloco começa e termina. Python não usa chaves: o bloco é definido pelo <b>recuo</b> (a indentação) da linha, geralmente 4 espaços. Errar o recuo não é feio — é um erro de sintaxe de verdade, chamado <code>IndentationError</code>.',
    },
    {
      t: 'code',
      file: 'blocos.py',
      lang: 'python',
      nolab: true,
      x: 'idade = 20\n\nif idade >= 18:\n    print("Pode dirigir")\n    print("Maior de idade")\nprint("Esta linha roda sempre, fora do if")',
    },
    {
      t: 'note',
      k: 'O golpe de Onduluk',
      x: 'Se você misturar espaços e tabs no mesmo bloco, ou recuar errado, o interpretador para tudo com IndentationError. É o truque favorito dele: fazer o código "parecer" certo enquanto embaralha o recuo.',
      warn: true,
    },
    { t: 'h', x: 'Variáveis: só o nome, sem declarar o tipo' },
    {
      t: 'p',
      x: 'Em Python você não escreve <code>int idade = 20</code>. Basta atribuir com <code>=</code>, e a variável já existe com o tipo do valor que ela recebeu — chamado de <b>tipagem dinâmica</b>. O tipo pode até mudar se a variável receber outro valor depois.',
    },
    {
      t: 'code',
      file: 'variaveis.py',
      lang: 'python',
      nolab: true,
      x: 'nome = "Viajante"      # str (texto)\nidade = 27              # int (inteiro)\naltura = 1.78            # float (decimal)\nativo = True            # bool (verdadeiro/falso)\nsem_valor = None         # ausência de valor\n\nprint(type(nome))       # <class \'str\'>',
    },
    { t: 'h', x: 'Os tipos básicos' },
    {
      t: 'table',
      cols: ['Tipo', 'Exemplo', 'Usado para'],
      rows: [
        ['int', '27', 'números inteiros'],
        ['float', '1.78', 'números com casas decimais'],
        ['str', '"Viajante"', 'texto, entre aspas simples ou duplas'],
        ['bool', 'True / False', 'verdadeiro ou falso (sempre com maiúscula)'],
        ['None', 'None', 'ausência de valor — não é 0 nem ""'],
      ],
    },
    {
      t: 'note',
      k: 'None não é zero',
      x: 'Onduluk adora confundir None com 0 ou com string vazia. Eles são coisas diferentes: None significa "não há valor nenhum aqui", nem número, nem texto.',
    },
    { t: 'h', x: 'Texto formatado: f-strings' },
    {
      t: 'p',
      x: 'Para colocar variáveis dentro de um texto, a forma moderna e recomendada é a <b>f-string</b>: um <code>f</code> antes das aspas, com as variáveis entre chaves.',
    },
    {
      t: 'code',
      file: 'fstring.py',
      lang: 'python',
      nolab: true,
      x: 'nome = "Viajante"\nidade = 27\nprint(f"{nome} tem {idade} anos")',
    },
    {
      t: 'out',
      file: 'fstring.out',
      x: 'Viajante tem 27 anos',
    },
    { t: 'h', x: 'Comentários' },
    {
      t: 'p',
      x: 'Tudo depois de <code>#</code> numa linha é comentário — o interpretador ignora. Não existe <code>//</code> nem <code>/* */</code> em Python.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Como Python marca o início e o fim de um bloco de código (dentro de um if, por exemplo)?',
      options: ['Com chaves { }', 'Com a indentação (o recuo da linha)', 'Com ponto e vírgula', 'Com a palavra "begin" e "end"'],
      answer: 1,
      explain: 'Python usa indentação consistente (geralmente 4 espaços) para marcar blocos, no lugar de chaves.',
    },
    {
      id: 'q2',
      q: 'O que acontece se a indentação de um bloco Python estiver errada?',
      options: [
        'Nada, Python ignora espaços',
        'O código roda mais devagar',
        'Um IndentationError interrompe a execução',
        'Só um aviso aparece, sem interromper nada',
      ],
      answer: 2,
      explain: 'Indentação errada é um erro de sintaxe real em Python: IndentationError, e o programa não roda.',
    },
    {
      id: 'q3',
      q: 'Qual é o valor de type(idade) depois de idade = 27?',
      options: ["<class 'str'>", "<class 'int'>", "<class 'float'>", "<class 'bool'>"],
      answer: 1,
      explain: '27 é um número inteiro, então idade recebe o tipo int automaticamente (tipagem dinâmica).',
    },
    {
      id: 'q4',
      q: 'O que representa None em Python?',
      options: ['O número zero', 'Uma string vazia', 'A ausência de valor', 'Sempre um erro'],
      answer: 2,
      explain: 'None é um valor especial que significa "nenhum valor aqui" — diferente de 0 e de "".',
      hint: 'Não é numérico nem texto.',
    },
    {
      id: 'q5',
      q: 'Complete: para inserir o valor de uma variável dentro de um texto, o jeito moderno em Python é usar uma ___-string, escrevendo a letra f antes das aspas.',
      fill: true,
      pre: 'O jeito moderno de inserir uma variável dentro de um texto é usar uma',
      post: '-string, escrevendo a letra f antes das aspas.',
      accept: ['f', 'f-string', 'fstring'],
      wrong: ['r', 'b', 'u'],
      placeholder: 'letra',
      explain: 'A f-string (f"...") permite escrever {variavel} diretamente dentro do texto.',
    },
  ],
};
