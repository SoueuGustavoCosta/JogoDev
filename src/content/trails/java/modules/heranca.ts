import type { Module } from '@/domain/trail/types';

/** Farol 8 da Lua de Java: extends, @Override, polimorfismo e interfaces. */
export const modHeranca: Module = {
  id: 'heranca-interfaces-java',
  short: 'Reaproveitar comportamento',
  title: 'Herança, polimorfismo e interfaces',
  lead: 'O último farol antes de enfrentar Nulo. Aqui você aprende como classes conversam entre si — e onde o vazio gosta de se esconder.',
  level: 'Avançado',
  blocks: [
    { t: 'h', x: 'extends: uma classe que herda de outra' },
    {
      t: 'code',
      file: 'Heranca.java',
      lang: 'java',
      nolab: true,
      x: 'class Viajante {\n    protected String nome;\n\n    Viajante(String nome) {\n        this.nome = nome;\n    }\n\n    String apresentar() {\n        return "Eu sou " + nome;\n    }\n}\n\nclass ViajanteVip extends Viajante {\n    private int insignias;\n\n    ViajanteVip(String nome, int insignias) {\n        super(nome);              // chama o construtor da classe-mãe\n        this.insignias = insignias;\n    }\n\n    @Override\n    String apresentar() {\n        return super.apresentar() + ", com " + insignias + " insígnias";\n    }\n}',
    },
    {
      t: 'note',
      k: '@Override',
      x: 'Essa anotação não é obrigatória, mas é boa prática: ela avisa o compilador "estou sobrescrevendo um método da classe-mãe de propósito". Se você errar o nome ou os parâmetros, o compilador acusa o erro na hora, em vez de criar um método novo por acidente.',
    },
    { t: 'h', x: 'Polimorfismo: o mesmo tipo, comportamentos diferentes' },
    {
      t: 'code',
      file: 'Polimorfismo.java',
      lang: 'java',
      nolab: true,
      x: 'Viajante v = new ViajanteVip("Ana", 8);\nSystem.out.println(v.apresentar());   // usa a versão de ViajanteVip, mesmo v sendo do tipo Viajante',
    },
    {
      t: 'out',
      file: 'Polimorfismo.out',
      x: 'Eu sou Ana, com 8 insígnias',
    },
    {
      t: 'p',
      x: 'Mesmo a variável v sendo declarada como Viajante, o método que roda é o da classe real do objeto (ViajanteVip). Isso é <b>polimorfismo</b>: o mesmo código chama comportamentos diferentes, dependendo do objeto real.',
    },
    { t: 'h', x: 'interface: um contrato, sem implementação' },
    {
      t: 'p',
      x: 'Uma <b>interface</b> declara métodos que uma classe promete implementar, sem dizer como. Uma classe pode <code>implements</code> várias interfaces (diferente de herança de classe, que é uma só por vez).',
    },
    {
      t: 'code',
      file: 'Interface.java',
      lang: 'java',
      nolab: true,
      x: 'interface Combatente {\n    void atacar();\n}\n\nclass ViajanteGuerreiro implements Combatente {\n    public void atacar() {\n        System.out.println("Ataque de viajante!");\n    }\n}',
    },
    { t: 'h', x: 'Onde o vazio se esconde' },
    {
      t: 'p',
      x: 'Um método que retorna um tipo de referência (como <code>Viajante</code> ou <code>String</code>) pode retornar <code>null</code> — "nenhum objeto". Se o código chamar um método <i>nesse</i> null sem checar antes, o programa quebra com <code>NullPointerException</code>.',
    },
    {
      t: 'code',
      file: 'NullPointer.java',
      lang: 'java',
      expectError: true,
      nolab: true,
      x: 'Viajante v = null;\nSystem.out.println(v.apresentar());   // NullPointerException: v não aponta pra nenhum objeto',
    },
    {
      t: 'note',
      k: 'O golpe de Nulo',
      x: 'NullPointerException é, disparado, o erro mais comum em código Java no mundo real. Antes de chamar um método num objeto que pode ser null, sempre confira: if (v != null) { ... }',
      warn: true,
    },
  ],
  quiz: [
    {
      q: 'O que super(nome) faz dentro do construtor de uma classe filha?',
      options: [
        'Cria uma variável chamada super',
        'Chama o construtor da classe-mãe, reaproveitando seu comportamento',
        'Apaga a classe-mãe',
        'Não faz nada em Java',
      ],
      answer: 1,
      explain: 'super(nome) chama o construtor da classe-mãe, passando os argumentos necessários — evita reescrever o que ela já faz.',
    },
    {
      q: 'O que a anotação @Override indica?',
      options: [
        'Que o método é privado',
        'Que o método está sobrescrevendo, de propósito, um método da classe-mãe',
        'Que o método é estático',
        'Que o método nunca deve ser chamado',
      ],
      answer: 1,
      explain: '@Override avisa o compilador que a intenção é sobrescrever um método herdado, ajudando a pegar erros de nome ou parâmetro.',
    },
    {
      q: 'O que é polimorfismo, no exemplo Viajante v = new ViajanteVip(...)?',
      options: [
        'Um erro de tipos',
        'v.apresentar() roda a versão de ViajanteVip, mesmo v sendo declarada como Viajante',
        'v vira automaticamente do tipo ViajanteVip',
        'Isso não compila em Java',
      ],
      answer: 1,
      explain: 'O método chamado depende do tipo real do objeto (ViajanteVip), não do tipo declarado da variável (Viajante) — isso é polimorfismo.',
      hint: 'Pense em "o mesmo comando, comportamento diferente dependendo do objeto real".',
    },
    {
      q: 'O que causa um NullPointerException?',
      options: [
        'Declarar uma variável sem valor inicial',
        'Chamar um método ou acessar um campo de uma referência que é null',
        'Usar o operador ==',
        'Esquecer o ponto e vírgula',
      ],
      answer: 1,
      explain: 'NullPointerException acontece ao tentar usar (chamar método, acessar campo) uma referência que aponta para null.',
    },
    {
      q: 'Complete: diferente de herança de classe (extends, uma só por vez), uma classe pode ___ várias interfaces ao mesmo tempo.',
      fill: true,
      pre: 'Diferente de herança de classe, uma classe pode',
      post: 'várias interfaces ao mesmo tempo.',
      accept: ['implementar', 'implements'],
      wrong: ['estender', 'herdar', 'sobrescrever'],
      placeholder: 'verbo/palavra-chave',
      explain: 'Uma classe usa implements para adotar várias interfaces, cada uma um contrato diferente de métodos.',
    },
  ],
};
