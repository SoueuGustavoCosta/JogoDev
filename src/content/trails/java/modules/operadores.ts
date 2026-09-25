import type { Module } from '@/domain/trail/types';

/** Farol 3 da Lua de Java: operadores, condições e a armadilha == vs .equals(). */
export const modOperadores: Module = {
  id: 'operadores-condicoes-java',
  short: 'Comparar direito',
  title: 'Operadores, condições e a armadilha do ==',
  lead: 'Aqui mora um dos erros mais famosos entre quem começa em Java: comparar texto com o operador errado.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'Operadores aritméticos e de comparação' },
    {
      t: 'table',
      cols: ['Operador', 'Significado'],
      rows: [
        ['+ - * /', 'soma, subtração, multiplicação, divisão'],
        ['%', 'resto da divisão'],
        ['== !=', 'igual, diferente'],
        ['&& || !', 'e, ou, negação (símbolos, diferente de Python)'],
      ],
    },
    { t: 'h', x: 'Divisão entre inteiros trunca, sem avisar' },
    {
      t: 'code',
      file: 'Divisao.java',
      lang: 'java',
      nolab: true,
      x: 'int resultado = 5 / 2;\nSystem.out.println(resultado);   // 2, não 2.5',
    },
    {
      t: 'note',
      k: 'Cuidado',
      x: 'Se pelo menos um dos dois números for double, o resultado tem casas decimais: 5.0 / 2 vale 2.5. Entre dois int, o resultado é sempre truncado para int.',
      warn: true,
    },
    { t: 'h', x: 'if / else if / else' },
    {
      t: 'code',
      file: 'Decisao.java',
      lang: 'java',
      nolab: true,
      x: 'int nota = 7;\n\nif (nota >= 9) {\n    System.out.println("Excelente");\n} else if (nota >= 6) {\n    System.out.println("Aprovado");\n} else {\n    System.out.println("Precisa estudar mais");\n}',
    },
    {
      t: 'out',
      file: 'Decisao.out',
      x: 'Aprovado',
    },
    { t: 'h', x: 'A armadilha clássica: == não compara o conteúdo de objetos' },
    {
      t: 'p',
      x: 'Para tipos primitivos (como int), <code>==</code> compara o valor, e funciona como esperado. Mas <code>String</code> é um tipo de <b>referência</b>: <code>==</code> compara se são <b>o mesmo objeto na memória</b>, não se o texto é igual.',
    },
    {
      t: 'code',
      file: 'ComparaTexto.java',
      lang: 'java',
      expectError: true,
      nolab: true,
      x: 'String a = new String("java");\nString b = new String("java");\n\nSystem.out.println(a == b);          // false! objetos diferentes\nSystem.out.println(a.equals(b));     // true — mesmo conteúdo',
    },
    {
      t: 'note',
      k: 'A regra de ouro',
      x: 'Para comparar o conteúdo de dois textos (ou de qualquer objeto), use sempre .equals(), nunca ==. == é só para tipos primitivos (int, double, boolean, char).',
      warn: true,
    },
    { t: 'h', x: 'switch: outro jeito de ramificar' },
    {
      t: 'code',
      file: 'Switch.java',
      lang: 'java',
      nolab: true,
      x: 'int dia = 3;\nswitch (dia) {\n    case 1:\n        System.out.println("Segunda");\n        break;\n    case 2:\n        System.out.println("Terça");\n        break;\n    default:\n        System.out.println("Outro dia");\n}',
    },
    {
      t: 'note',
      k: 'Não esqueça o break',
      x: 'Sem break, o switch "cai" para o próximo case e continua executando (fall-through) — um comportamento que confunde bastante quem vem de outras linguagens.',
    },
  ],
  quiz: [
    {
      q: 'O que 5 / 2 retorna em Java, se os dois lados são int?',
      options: ['2.5', '2', '3', 'erro de compilação'],
      answer: 1,
      explain: 'Divisão entre dois int trunca o resultado: 5 / 2 vale 2, sem arredondar.',
    },
    {
      q: 'Por que a == b pode retornar false mesmo quando a e b são duas Strings com o mesmo texto?',
      options: [
        'Porque Strings não podem ser comparadas',
        'Porque == compara se são o mesmo objeto na memória, não o conteúdo',
        'Porque Java não tem o operador ==',
        'Isso nunca acontece em Java',
      ],
      answer: 1,
      explain: 'String é um tipo de referência: == compara identidade (mesmo objeto), não o conteúdo do texto.',
      hint: 'Pense na diferença entre "é o mesmo objeto" e "tem o mesmo conteúdo".',
    },
    {
      q: 'Qual é o jeito certo de comparar o conteúdo de duas Strings em Java?',
      options: ['a == b', 'a.equals(b)', 'a === b', 'a.compare(b)'],
      answer: 1,
      explain: '.equals() compara o conteúdo dos objetos; == compara se são o mesmo objeto na memória.',
    },
    {
      q: 'O que acontece se você esquecer o break dentro de um case do switch?',
      options: [
        'Erro de compilação',
        'O switch para automaticamente depois do primeiro case',
        'A execução "cai" para o próximo case (fall-through)',
        'Nada, break é opcional e não muda o comportamento',
      ],
      answer: 2,
      explain: 'Sem break, o switch continua executando os cases seguintes, mesmo que a condição deles não bata — o fall-through.',
    },
    {
      q: 'Complete: os operadores lógicos e, ou e negação em Java são escritos com os símbolos &&, || e ___.',
      fill: true,
      pre: 'Os operadores lógicos e, ou e negação em Java são escritos com os símbolos &&, || e',
      post: '.',
      accept: ['!'],
      wrong: ['~', '?', '^'],
      placeholder: 'símbolo',
      explain: 'Java usa símbolos (&&, ||, !), diferente de Python, que escreve and, or, not por extenso.',
    },
  ],
};
