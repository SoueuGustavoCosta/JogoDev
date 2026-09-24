import type { Module } from '@/domain/trail/types';

/** Farol 2 da Lua de Java: chaves, ponto e vírgula, tipagem estática e o método main. */
export const modSintaxe: Module = {
  id: 'sintaxe-tipos-java',
  short: 'A gramática rígida',
  title: 'Sintaxe: chaves, tipos e o método main',
  lead: 'Se Python é flexível com espaços, Java é rígido com tudo: cada bloco tem chaves, cada linha termina, cada variável declara seu tipo.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'Todo programa Java mora dentro de uma classe' },
    {
      t: 'p',
      x: 'Diferente de Python (que roda um arquivo direto), todo código Java precisa estar dentro de uma <b>classe</b>. E todo programa que roda sozinho precisa de um método especial chamado <code>main</code>, com uma assinatura fixa.',
    },
    {
      t: 'code',
      file: 'OlaMundo.java',
      lang: 'java',
      nolab: true,
      x: 'public class OlaMundo {\n    public static void main(String[] args) {\n        System.out.println("Olá, Viajante!");\n    }\n}',
    },
    {
      t: 'note',
      k: 'A assinatura do main é sagrada',
      x: 'public static void main(String[] args) precisa ser escrito exatamente assim — public (visível de fora), static (não precisa de objeto para rodar), void (não devolve valor), main (o nome fixo), String[] args (argumentos de linha de comando).',
    },
    { t: 'h', x: 'Chaves e ponto e vírgula, sempre' },
    {
      t: 'p',
      x: 'Todo bloco (classe, método, if, laço) fica entre <code>{ }</code>. Toda instrução termina com <code>;</code>. Esquecer qualquer um dos dois é erro de compilação — o programa nem chega a rodar.',
    },
    { t: 'h', x: 'Tipagem estática: você declara o tipo, sempre' },
    {
      t: 'p',
      x: 'Em Python, <code>idade = 20</code> já basta. Em Java, você <b>declara o tipo</b> antes do nome da variável, e ele não muda depois.',
    },
    {
      t: 'code',
      file: 'Variaveis.java',
      lang: 'java',
      nolab: true,
      x: 'int idade = 27;\ndouble altura = 1.78;\nString nome = "Viajante";\nboolean ativo = true;\nchar inicial = \'V\';',
    },
    { t: 'h', x: 'Tipos primitivos x tipos de referência' },
    {
      t: 'table',
      cols: ['Categoria', 'Exemplos', 'O que guarda'],
      rows: [
        ['Primitivos', 'int, double, boolean, char, long', 'o valor em si, direto na memória'],
        ['Referência', 'String, arrays, qualquer classe', 'um endereço que aponta para o objeto'],
      ],
    },
    {
      t: 'note',
      k: 'Por que isso importa',
      x: 'Um tipo de referência pode não apontar para nada — esse "nada" se chama null. Guarde essa palavra: ela é a raiz do que Nulo, o chefe desta lua, representa.',
      warn: true,
    },
    { t: 'h', x: 'Compilar antes de rodar' },
    {
      t: 'p',
      x: 'Java não interpreta o código direto como Python. Primeiro o compilador (<code>javac</code>) verifica os tipos e transforma o código em bytecode; só depois a JVM roda esse bytecode. Um erro de tipo é pego <b>antes</b> do programa rodar, não durante.',
    },
    {
      t: 'code',
      file: 'compilar.sh',
      lang: 'bash',
      nolab: true,
      x: 'javac OlaMundo.java   # gera OlaMundo.class (bytecode)\njava OlaMundo          # roda o bytecode na JVM',
    },
  ],
  quiz: [
    {
      q: 'Onde todo código Java precisa estar, obrigatoriamente?',
      options: ['Dentro de uma função solta', 'Dentro de uma classe', 'Dentro de um comentário', 'Não precisa de nenhuma estrutura'],
      answer: 1,
      explain: 'Diferente de Python, todo código Java vive dentro de uma classe — não existe instrução solta no arquivo.',
    },
    {
      q: 'O que acontece se você esquecer um ponto e vírgula no final de uma instrução Java?',
      options: [
        'Nada, Java ignora',
        'O programa roda mais devagar',
        'Erro de compilação: o programa nem chega a rodar',
        'Só um aviso, sem impedir a execução',
      ],
      answer: 2,
      explain: 'Java exige ponto e vírgula ao final de cada instrução; sem ele, o compilador recusa o código antes mesmo de rodar.',
    },
    {
      q: 'Em int idade = 27;, o que representa "int"?',
      options: ['O nome da variável', 'O valor da variável', 'O tipo da variável, declarado explicitamente', 'Um comentário'],
      answer: 2,
      explain: 'Java usa tipagem estática: você declara o tipo (int, aqui) explicitamente antes do nome da variável.',
    },
    {
      q: 'Qual a diferença entre um tipo primitivo (como int) e um tipo de referência (como String) em Java?',
      options: [
        'Não há diferença nenhuma',
        'O primitivo guarda o valor direto; a referência guarda um endereço que aponta para o objeto',
        'Só tipos de referência podem ser usados em variáveis',
        'Primitivos só existem em Python',
      ],
      answer: 1,
      explain: 'Um tipo primitivo guarda o valor em si; um tipo de referência guarda um endereço, que pode até não apontar para nada (null).',
      hint: 'Pense em "aponta para" versus "é o próprio valor".',
    },
    {
      q: 'Complete: antes de um programa Java rodar na JVM, o compilador ___ transforma o código-fonte em bytecode.',
      fill: true,
      pre: 'Antes de um programa Java rodar na JVM, o compilador',
      post: 'transforma o código-fonte em bytecode.',
      accept: ['javac'],
      placeholder: 'nome do comando',
      explain: 'javac compila o .java em .class (bytecode); o comando java depois roda esse bytecode na JVM.',
    },
  ],
};
