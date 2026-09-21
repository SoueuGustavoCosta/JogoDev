import type { Module } from '@/domain/trail/types';

/**
 * Migrado de Ilha_da_Logica_PHP_1.html (módulo "ola" — "Olá, Mundo! em 4 linguagens").
 * O widget "Olá, Mundo lado a lado" virou o jogo `qual-linguagem` (GuessTheLanguageWidget):
 * o viajante tenta reconhecer cada linguagem pelo código antes de ver a tabela comparativa.
 */
export const modOla: Module = {
  id: 'ola',
  short: 'Olá, Mundo! em 4 linguagens',
  title: 'Olá, Mundo! em quatro idiomas',
  lead: 'O ritual de quem começa: fazer o computador dizer "Olá, Mundo!". Veja a mesma frase em PHP, Python, Java e C.',
  level: 'Base',
  blocks: [
    {
      t: 'say',
      x: 'Farol 2. Ele só acende com uma frase. Mas atenção: a ilha fala quatro idiomas, e eu quero que você perceba o que muda e o que continua igual.',
    },
    { t: 'h', x: 'De onde vem o "Hello, World"?' },
    {
      t: 'say',
      x: 'Em 1972, Brian Kernighan testou um tutorial nos Bell Labs. Antes, o exemplo só dizia "hi!" — ele trocou por "hello, world". Em 1978, o livro que escreveu sobre a linguagem C virou best-seller entre programadores, e a frase pegou de vez. Desde então, é o primeiro programa de praticamente todo mundo.',
    },
    {
      t: 'note',
      k: 'Curiosidade',
      x: 'O "Hello, World" é o menor programa que prova três coisas de uma vez: você escreveu código, a ferramenta entendeu e o resultado apareceu. Se ele falha, o problema é a instalação, não a sua lógica. E "hello, world" já era bordão de um radialista de Nova York nos anos 1950, bem antes da programação existir.',
    },
    { t: 'h', x: 'A mesma frase, quatro linguagens' },
    { t: 'p', x: 'Antes de olhar a tabela: dá para reconhecer cada linguagem só pelo jeito de escrever?' },
    { t: 'gui', widget: 'qual-linguagem' },
    { t: 'h', x: 'Comparando as quatro' },
    {
      t: 'table',
      cols: ['—', 'PHP', 'Python', 'Java', 'C'],
      rows: [
        [
          'Criador e ano',
          'Rasmus Lerdorf (criou em 1993, lançou em 1995)',
          'Guido van Rossum (lançada em 1991)',
          'James Gosling, na Sun (lançada em 1995)',
          'Dennis Ritchie, Bell Labs (1972 a 1973)',
        ],
        ['Linhas do Olá, Mundo', '3 (com as tags)', '1', '5', '5'],
        [
          'Como executa',
          'Interpretador, geralmente no servidor web',
          'Interpretador',
          'Compila para bytecode e roda na JVM',
          'Compilado para código de máquina',
        ],
        ['Tipos', 'Dinâmica (<code>$x = 5;</code>)', 'Dinâmica (<code>x = 5</code>)', 'Estática (<code>int x = 5;</code>)', 'Estática (<code>int x = 5;</code>)'],
        ['Fim de comando', '<code>;</code>', 'quebra de linha', '<code>;</code>', '<code>;</code>'],
        ['Blocos', '<code>{ }</code>', 'indentação', '<code>{ }</code>', '<code>{ }</code>'],
        ['Muito usada em', 'Sites e back-end web', 'Dados, IA, automação', 'Android e sistemas corporativos', 'Sistemas operacionais e embarcados'],
      ],
    },
    {
      t: 'note',
      k: 'Em todo o jogo',
      x: 'A língua oficial da ilha é o <b>PHP</b>: todos os exemplos daqui em diante serão PHP, como na apostila da faculdade. As outras linguagens aparecem quando a comparação ajuda a entender a ideia.',
    },
    { t: 'h', x: 'PHP em duas linhas' },
    {
      t: 'cards',
      items: [
        { h: '<code>&lt;?php ... ?&gt;</code>', x: 'O código PHP fica entre essas tags. Tudo fora delas é HTML comum, entregue como está.' },
        { h: '<code>echo</code>', x: 'Comando que envia texto para a saída. Cada comando termina com <code>;</code>.' },
        { h: 'Roda no servidor', x: 'O navegador nunca vê o PHP: ele recebe só o HTML que o PHP gerou.' },
      ],
    },
    {
      t: 'code',
      file: 'ola.php',
      lang: 'php',
      nolab: true,
      x: '<?php\necho "Olá, Mundo! Iniciando meus estudos em PHP.";\n?>',
    },
    { t: 'out', file: 'Saída no navegador', x: 'Olá, Mundo! Iniciando meus estudos em PHP.' },
  ],
  quiz: [
    {
      q: 'Quem escreveu o mais antigo "hello, world" documentado, em 1972?',
      options: ['Rasmus Lerdorf', 'Guido van Rossum', 'Brian Kernighan', 'James Gosling'],
      answer: 2,
      explain: 'Kernighan, no tutorial da linguagem B, nos Bell Labs.',
    },
    {
      q: 'Qual destas linguagens NÃO usa ponto e vírgula para terminar comandos?',
      options: ['PHP', 'Python', 'Java', 'C'],
      answer: 1,
      explain: 'Em Python, a quebra de linha termina o comando e os blocos são marcados por indentação.',
    },
    {
      q: 'Complete o Olá, Mundo em PHP:',
      fill: true,
      pre: '',
      post: ' "Olá, Mundo!";',
      accept: ['echo', 'print'],
      placeholder: '?',
      explain: '<code>echo</code> exibe o texto. Não esqueça o <code>;</code> no final.',
    },
    {
      q: 'Qual é a principal finalidade do "Hello, World"?',
      options: ['Ensinar variáveis', 'Testar se o ambiente e a ferramenta funcionam', 'Medir a velocidade do computador', 'Criar um site'],
      answer: 1,
      explain: 'É um teste de sanidade: se a frase aparece, o editor, o compilador ou interpretador e o ambiente estão funcionando.',
    },
    {
      q: 'Em Java e em C o "Olá, Mundo" precisa de uma função de partida. Qual é o nome dela?',
      fill: true,
      pre: '',
      post: '()',
      accept: ['main'],
      placeholder: '?',
      explain: '<code>main</code> é o ponto de entrada: é onde o programa começa a executar.',
    },
  ],
};
