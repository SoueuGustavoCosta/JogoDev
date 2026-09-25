import type { Module } from '@/domain/trail/types';

/** Farol 2 da Lua de PHP: tags <?php ?>, o $ das variáveis e a tipagem dinâmica. */
export const modSintaxe: Module = {
  id: 'sintaxe-tipos-php',
  short: 'Entrando e saindo do PHP',
  title: 'Sintaxe: tags, variáveis com $ e tipos dinâmicos',
  lead: 'PHP nasceu para se misturar com HTML. Por isso ele tem algo que nenhuma outra lua tem: um jeito de "entrar" e "sair" do modo código.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'Entrando e saindo do PHP com <?php e ?>' },
    {
      t: 'p',
      x: 'Um arquivo PHP pode misturar HTML puro com blocos de código. Tudo que está fora de <code>&lt;?php ... ?&gt;</code> é enviado direto para a tela, como texto.',
    },
    {
      t: 'code',
      file: 'misturado.php',
      lang: 'php',
      nolab: true,
      x: '<h1>Bem-vindo</h1>\n\n<?php\n    $nome = "Viajante";\n    echo "<p>Olá, $nome!</p>";\n?>\n\n<p>Isso aqui é HTML puro de novo.</p>',
    },
    {
      t: 'note',
      k: 'Em scripts modernos',
      x: 'Um arquivo PHP usado só como script (sem misturar HTML) costuma abrir com <?php no início e nem fechar com ?> no fim — evita espaços acidentais depois da tag de fechamento.',
    },
    { t: 'h', x: 'Toda variável começa com $' },
    {
      t: 'p',
      x: 'Diferente de Python e Java, toda variável em PHP é escrita com um <code>$</code> na frente, sempre — até quando você só está lendo o valor dela.',
    },
    {
      t: 'code',
      file: 'variaveis.php',
      lang: 'php',
      nolab: true,
      x: '$nome = "Viajante";\n$idade = 27;\n$altura = 1.78;\n$ativo = true;\n\necho $nome;   // o $ aparece sempre, para declarar e para usar',
    },
    { t: 'h', x: 'Tipagem dinâmica, como Python' },
    {
      t: 'p',
      x: 'PHP não exige declarar o tipo da variável — ela assume o tipo do valor atribuído, e pode mudar de tipo depois, igual em Python.',
    },
    {
      t: 'code',
      file: 'tipos.php',
      lang: 'php',
      nolab: true,
      x: '$valor = 10;        // int\n$valor = "dez";     // agora é string, sem erro\nvar_dump($valor);   // string(4) "dez"',
    },
    { t: 'h', x: 'Interpolação de string' },
    {
      t: 'p',
      x: 'Dentro de aspas <b>duplas</b>, uma variável escrita direto é substituída pelo valor dela. Aspas <b>simples</b> não fazem essa substituição — o texto sai exatamente como foi escrito.',
    },
    {
      t: 'code',
      file: 'interpolacao.php',
      lang: 'php',
      nolab: true,
      x: '$nome = "Viajante";\necho "Olá, $nome!";     // Olá, Viajante!\necho \'Olá, $nome!\';     // Olá, $nome! (sem substituir)',
    },
    { t: 'h', x: 'Concatenação com o ponto' },
    {
      t: 'p',
      x: 'Para juntar textos sem interpolação, PHP usa o operador <code>.</code> (ponto) — não o <code>+</code>.',
    },
    {
      t: 'code',
      file: 'concatenar.php',
      lang: 'php',
      nolab: true,
      x: '$nome = "Viajante";\necho "Olá, " . $nome . "!";',
    },
  ],
  quiz: [
    {
      q: 'O que acontece com o texto escrito fora de <?php ... ?> num arquivo PHP?',
      options: [
        'É ignorado completamente',
        'Causa um erro de sintaxe',
        'É enviado direto para a tela, como HTML puro',
        'Vira automaticamente um comentário',
      ],
      answer: 2,
      explain: 'PHP foi criado para se misturar com HTML: tudo fora das tags de PHP é enviado como está, direto para a saída.',
    },
    {
      q: 'O que precede toda variável em PHP, tanto ao declarar quanto ao usar?',
      options: ['@', '$', '#', '&'],
      answer: 1,
      explain: 'PHP usa o $ na frente de toda variável, sempre — diferente de Python e Java, que não usam prefixo.',
    },
    {
      q: 'Qual a diferença entre aspas duplas e aspas simples em PHP?',
      options: [
        'Não há diferença',
        'Aspas duplas fazem interpolação de variáveis; aspas simples não',
        'Aspas simples são mais rápidas de processar sempre',
        'Só aspas simples aceitam acentos',
      ],
      answer: 1,
      explain: '"Olá, $nome!" substitui $nome pelo valor; \'Olá, $nome!\' imprime o texto exatamente como escrito, sem substituir.',
      hint: 'Pense em qual delas "olha para dentro" do texto em busca de variáveis.',
    },
    {
      q: 'Qual operador PHP usa para concatenar (juntar) textos?',
      options: ['+', '&', '.', '++'],
      answer: 2,
      explain: 'PHP usa o ponto (.) para concatenação, diferente de outras linguagens que usam +.',
    },
    {
      q: 'Complete: assim como Python, PHP tem tipagem ___ — a variável assume o tipo do valor atribuído, e pode mudar depois.',
      fill: true,
      pre: 'Assim como Python, PHP tem tipagem',
      post: '— a variável assume o tipo do valor atribuído, e pode mudar depois.',
      accept: ['dinâmica', 'dinamica', 'dinâmica'],
      wrong: ['estática', 'forte', 'fixa'],
      placeholder: 'tipo de tipagem',
      explain: 'PHP não exige declarar o tipo: a variável se adapta ao valor atribuído, podendo trocar de tipo em outra atribuição.',
    },
  ],
};
