import type { Module } from '@/domain/trail/types';

/** Farol 7 da Lua de Java: classes, construtores e encapsulamento. */
export const modClasses: Module = {
  id: 'classes-objetos-java',
  short: 'Modelar com classes',
  title: 'Classes, objetos e encapsulamento',
  lead: 'Java nasceu orientado a objetos desde a primeira linha. Aqui você aprende a modelar dados protegidos, do jeito certo.',
  level: 'Avançado',
  blocks: [
    { t: 'h', x: 'Uma classe com construtor' },
    {
      t: 'p',
      x: 'O <b>construtor</b> é um método especial, com o mesmo nome da classe e sem tipo de retorno, chamado automaticamente com <code>new</code>.',
    },
    {
      t: 'code',
      file: 'Viajante.java',
      lang: 'java',
      nolab: true,
      x: 'class Viajante {\n    private String nome;\n    private int xp;\n\n    Viajante(String nome) {\n        this.nome = nome;\n        this.xp = 0;\n    }\n\n    void ganharXp(int quantidade) {\n        this.xp += quantidade;\n    }\n\n    String getNome() {\n        return nome;\n    }\n\n    int getXp() {\n        return xp;\n    }\n}',
    },
    {
      t: 'code',
      file: 'Uso.java',
      lang: 'java',
      nolab: true,
      x: 'Viajante ana = new Viajante("Ana");\nana.ganharXp(150);\nSystem.out.println(ana.getNome() + " tem " + ana.getXp() + " XP");',
    },
    {
      t: 'note',
      k: 'this',
      x: 'this.nome se refere ao atributo do objeto atual, para diferenciar do parâmetro nome recebido pelo construtor, que tem o mesmo nome de propósito.',
    },
    { t: 'h', x: 'Encapsulamento: private, e métodos de acesso' },
    {
      t: 'p',
      x: 'Os atributos são <code>private</code>: só a própria classe acessa diretamente. Para o mundo de fora ler ou mudar o valor com controle, existem métodos públicos — os <b>getters</b> (para ler) e <b>setters</b> (para escrever), como <code>getNome()</code> acima.',
    },
    {
      t: 'table',
      cols: ['Modificador', 'Quem acessa'],
      rows: [
        ['private', 'só a própria classe'],
        ['public', 'qualquer código que enxergue a classe'],
        ['protected', 'a própria classe, subclasses e o mesmo pacote'],
      ],
    },
    {
      t: 'note',
      k: 'Por que esconder os atributos?',
      x: 'Com private + getters/setters, a classe controla suas próprias regras. Por exemplo, um setXp(int novoXp) pode recusar valores negativos — impossível se o atributo fosse público e qualquer código pudesse trocá-lo direto.',
      warn: true,
    },
    { t: 'h', x: 'O construtor padrão' },
    {
      t: 'p',
      x: 'Se você não escrever nenhum construtor, Java cria um construtor padrão vazio, sem parâmetros. Assim que você escreve qualquer construtor, esse padrão desaparece — se ainda quiser um construtor sem parâmetros, precisa escrevê-lo também.',
    },
  ],
  quiz: [
    {
      q: 'O que é o construtor de uma classe Java?',
      options: [
        'Um método qualquer, com qualquer nome',
        'Um método especial, com o mesmo nome da classe, chamado com new',
        'Um comentário no topo da classe',
        'O primeiro atributo declarado',
      ],
      answer: 1,
      explain: 'O construtor tem o mesmo nome da classe, não declara tipo de retorno, e roda automaticamente ao usar new.',
    },
    {
      q: 'Por que declarar atributos como private, com getters e setters em vez de deixá-los public?',
      options: [
        'Não faz diferença nenhuma',
        'Para a classe poder controlar suas próprias regras sobre os dados',
        'private é mais rápido de digitar',
        'public não é permitido em Java',
      ],
      answer: 1,
      explain: 'Encapsulamento protege os dados: a classe pode validar ou restringir como os atributos são lidos e alterados.',
    },
    {
      q: 'O que this.nome = nome; faz dentro de um construtor?',
      options: [
        'Cria uma variável nova chamada nome',
        'Atribui o valor do parâmetro nome ao atributo nome do objeto atual',
        'Apaga o atributo nome',
        'Gera um erro de compilação',
      ],
      answer: 1,
      explain: 'this se refere ao próprio objeto, diferenciando o atributo da classe do parâmetro recebido, que têm o mesmo nome.',
    },
    {
      q: 'O que acontece com o construtor padrão (sem parâmetros) se você escrever qualquer outro construtor na classe?',
      options: [
        'Ele continua existindo junto com o novo',
        'Ele deixa de existir automaticamente; se quiser um, precisa escrever',
        'Java gera erro de compilação',
        'Ele vira private automaticamente',
      ],
      answer: 1,
      explain: 'Assim que você escreve um construtor, Java para de gerar o construtor padrão vazio.',
      hint: 'Pense no que acontece quando você já "assume o controle" de como o objeto nasce.',
    },
    {
      q: 'Complete: um método público que devolve o valor de um atributo privado é chamado de ___.',
      fill: true,
      pre: 'Um método público que devolve o valor de um atributo privado é chamado de',
      post: '.',
      accept: ['getter', 'get'],
      placeholder: 'nome do método de acesso',
      explain: 'Getters (como getNome()) expõem, de forma controlada, o valor de atributos privados.',
    },
  ],
};
