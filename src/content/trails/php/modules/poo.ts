import type { Module } from '@/domain/trail/types';

/** Farol 7 da Lua de PHP: classes, __construct, $this, visibilidade e herança básica. */
export const modPoo: Module = {
  id: 'poo-php',
  short: 'Modelar com classes',
  title: 'Orientação a objetos: classes, __construct e herança',
  lead: 'PHP só ganhou orientação a objetos completa na versão 5, em 2004. Hoje é uma parte essencial da linguagem.',
  level: 'Avançado',
  blocks: [
    { t: 'h', x: 'class e __construct' },
    {
      t: 'p',
      x: 'O construtor de uma classe PHP se chama sempre <code>__construct</code>, com dois underscores antes e depois — roda automaticamente ao criar um objeto com <code>new</code>.',
    },
    {
      t: 'code',
      file: 'Viajante.php',
      lang: 'php',
      nolab: true,
      x: 'class Viajante {\n    private string $nome;\n    private int $xp = 0;\n\n    public function __construct(string $nome) {\n        $this->nome = $nome;\n    }\n\n    public function ganharXp(int $quantidade): void {\n        $this->xp += $quantidade;\n    }\n\n    public function getNome(): string {\n        return $this->nome;\n    }\n\n    public function getXp(): int {\n        return $this->xp;\n    }\n}',
    },
    {
      t: 'code',
      file: 'uso.php',
      lang: 'php',
      nolab: true,
      x: '$ana = new Viajante("Ana");\n$ana->ganharXp(150);\necho $ana->getNome() . " tem " . $ana->getXp() . " XP";',
    },
    {
      t: 'note',
      k: '-> em vez de . para acessar membros',
      x: 'Objetos PHP usam a seta -> para acessar propriedades e métodos ($ana->getNome()), diferente do ponto usado para concatenar texto.',
      warn: true,
    },
    { t: 'h', x: 'Visibilidade: private, protected, public' },
    {
      t: 'table',
      cols: ['Modificador', 'Quem acessa'],
      rows: [
        ['private', 'só a própria classe'],
        ['protected', 'a própria classe e suas subclasses'],
        ['public', 'qualquer código'],
      ],
    },
    { t: 'h', x: 'Herança: extends' },
    {
      t: 'code',
      file: 'Heranca.php',
      lang: 'php',
      nolab: true,
      x: 'class ViajanteVip extends Viajante {\n    private int $insignias;\n\n    public function __construct(string $nome, int $insignias) {\n        parent::__construct($nome);   // chama o construtor da classe-mãe\n        $this->insignias = $insignias;\n    }\n\n    public function apresentar(): string {\n        return $this->getNome() . ", com " . $this->insignias . " insígnias";\n    }\n}',
    },
    {
      t: 'note',
      k: 'parent::',
      x: 'parent::__construct(...) chama o construtor da classe-mãe de dentro da classe filha — o equivalente PHP de super() em Java, ou super().__init__() em Python.',
    },
    { t: 'h', x: 'Tipos nos parâmetros e no retorno (PHP moderno)' },
    {
      t: 'p',
      x: 'Desde o PHP 7, você pode declarar o tipo esperado dos parâmetros (<code>string $nome</code>) e do retorno (<code>: void</code>, <code>: int</code>) — o interpretador barra chamadas com o tipo errado.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Como se chama o método construtor de uma classe PHP?',
      options: ['construct()', '__construct()', 'new()', 'init()'],
      answer: 1,
      explain: '__construct(), com dois underscores dos dois lados, é o construtor padrão de classes PHP, chamado automaticamente por new.',
    },
    {
      id: 'q2',
      q: 'Qual símbolo é usado para acessar uma propriedade ou método de um objeto PHP?',
      options: ['.', '->', '::', '=>'],
      answer: 1,
      explain: 'Objetos usam -> (seta), como em $ana->getNome(). O ponto (.) é reservado para concatenar texto.',
    },
    {
      id: 'q3',
      q: 'O que parent::__construct($nome) faz dentro do construtor de uma classe filha?',
      options: [
        'Cria uma nova classe do zero',
        'Chama o construtor da classe-mãe, reaproveitando seu comportamento',
        'Apaga a classe-mãe',
        'Não compila em PHP',
      ],
      answer: 1,
      explain: 'parent:: dá acesso à classe-mãe de dentro da classe filha, permitindo reaproveitar (em vez de reescrever) seu construtor.',
    },
    {
      id: 'q4',
      q: 'Quem pode acessar uma propriedade declarada como protected?',
      options: [
        'Qualquer código, de qualquer lugar',
        'Só a própria classe e suas subclasses',
        'Só funções fora de qualquer classe',
        'Ninguém, nem a própria classe',
      ],
      answer: 1,
      explain: 'protected é mais aberto que private (que só permite a própria classe), mas mais fechado que public.',
      hint: 'Pense nele como "de família": a classe e quem herda dela.',
    },
    {
      id: 'q5',
      q: 'Complete: para declarar como um método PHP não devolve valor nenhum, usa-se o tipo de retorno ___.',
      fill: true,
      pre: 'Para declarar que um método PHP não devolve valor nenhum, usa-se o tipo de retorno',
      post: '.',
      accept: ['void'],
      wrong: ['none', 'empty', 'nothing'],
      placeholder: 'tipo de retorno',
      explain: ': void indica que o método executa uma ação, mas não devolve nenhum valor.',
    },
  ],
};
