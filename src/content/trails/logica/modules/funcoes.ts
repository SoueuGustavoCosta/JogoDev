import type { Module } from '@/domain/trail/types';

/**
 * Migrado de Ilha_da_Logica_PHP_1.html (módulo "funcoes" — "Funções e escopo").
 * O widget "Por valor ou por referência?" virou o jogo `por-referencia` (ByRefWidget).
 */
export const modFuncoes: Module = {
  id: 'funcoes',
  short: 'Funções e escopo',
  title: 'Funções: blocos com nome',
  lead: 'Escrever uma vez, usar sempre. Funções organizam o programa em peças que você chama pelo nome.',
  level: 'Intermediário',
  blocks: [
    {
      t: 'say',
      x: 'Farol 8. O Jogo da Velha é feito de funções: <code>limpeza()</code>, <code>velha()</code>, <code>posicao()</code>... Cada uma cuida de uma tarefa pequena. Quando você entender por quê, o desafio fica muito mais fácil.',
    },
    { t: 'h', x: 'O que é uma função?' },
    {
      t: 'p',
      x: 'Segundo a apostila, funções são <b>blocos de código que possuem um nome</b> e ficam aguardando para serem executados <b>somente quando o nome é chamado</b>. Elas podem receber <b>parâmetros</b> (dados de entrada) e devolver um valor com <code>return</code>.',
    },
    {
      t: 'code',
      file: 'funcao.php',
      lang: 'php',
      nolab: true,
      x: '<?php\nfunction fatorial($n) {             // $n é o parâmetro\n    $resultado = 1;\n    for ($i = 1; $i <= $n; $i++) {\n        $resultado *= $i;\n    }\n    return $resultado;              // devolve o valor a quem chamou\n}\n\necho fatorial(4);                   // 24\n$x = fatorial(5);                   // guarda o retorno: 120\n?>',
    },
    {
      t: 'note',
      k: 'return',
      x: 'O <code>return</code> <b>interrompe</b> a função e devolve o valor a quem a chamou. O que vem depois dele não executa. Funções sem <code>return</code> devolvem <code>NULL</code> (o <code>void</code> de C e Java).',
    },
    { t: 'h', x: 'Variáveis locais e globais' },
    {
      t: 'p',
      x: 'Variáveis criadas <b>dentro</b> de uma função são <b>locais</b>: só existem ali. A apostila diz que variáveis globais são visíveis em qualquer lugar. <b>Em PHP há uma diferença importante</b>: uma variável global <b>não</b> aparece dentro da função automaticamente. Já as <b>constantes</b> aparecem em qualquer lugar (por isso o Jogo da Velha usa <code>LIM</code>).',
    },
    {
      t: 'code',
      file: 'escopo.php',
      lang: 'php',
      nolab: true,
      x: "<?php\ndefine('LIM', 3);\n$total = 100;                 // global\n\nfunction teste() {\n    echo LIM;                 // 3: constantes são visíveis\n    echo $total;              // vazio! aqui $total não existe\n    global $total;            // pede emprestada a global\n    echo $total;              // 100\n}\n?>",
    },
    { t: 'h', x: 'Passagem por valor x por referência' },
    {
      t: 'p',
      x: 'Por padrão a função recebe uma <b>cópia</b> do valor: mudar dentro não muda fora. Com o símbolo <code>&amp;</code>, a função recebe a <b>variável original</b> e altera direto na memória. Rode as duas versões:',
    },
    { t: 'gui', widget: 'por-referencia' },
    { t: 'h', x: 'As funções do Jogo da Velha' },
    {
      t: 'table',
      cols: ['Função', 'Recebe', 'Devolve', 'Faz'],
      rows: [
        ['<code>limpeza()</code>', 'nada', 'nada', 'Zera o tabuleiro e as variáveis de sessão'],
        ['<code>posicao($l, $c)</code>', 'linha e coluna', '1 se ocupada, 0 se livre', 'Pergunta se a casa já foi usada'],
        ['<code>velha($jog)</code>', 'J ou M', '1 se ganhou, 0 se não', 'Procura três marcas em sequência'],
        ['<code>jogadorJoga($l, $col)</code>', 'linha e coluna', 'nada', 'Faz a jogada do usuário'],
        ['<code>maquinaJoga()</code>', 'nada', 'nada', 'Sorteia e marca uma casa livre'],
      ],
    },
    {
      t: 'note',
      k: 'Por que dividir?',
      x: 'Como diz a apostila: ao criar funções você <b>reutiliza</b> algoritmos já criados e testados. Se <code>posicao()</code> funciona, tanto o jogador quanto a máquina podem usá-la, sem copiar código.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual palavra devolve um valor de dentro de uma função?',
      fill: true,
      pre: 'function dobro($n) {',
      post: ' $n * 2; }',
      accept: ['return'],
      wrong: ['echo', 'break', 'print'],
      placeholder: '?',
      explain: '<code>return</code> entrega o resultado a quem chamou.',
    },
    {
      id: 'q2',
      q: 'function f($x) { $x = 10; }  $a = 1; f($a); echo $a;  O que aparece?',
      options: ['1', '10', '0', 'Erro'],
      answer: 0,
      explain: 'Passagem por valor: a função mexeu numa cópia. <code>$a</code> continua 1.',
    },
    {
      id: 'q3',
      q: 'Qual símbolo faz o parâmetro ser passado por referência?',
      fill: true,
      pre: 'function f(',
      post: '$x)',
      accept: ['&'],
      wrong: ['*', '$', '@'],
      placeholder: '?',
      explain: 'Com <code>&amp;$x</code> a função altera a variável original.',
      hint: 'É o mesmo símbolo que apareceu na aba "Por referência" do jogo ali em cima.',
    },
    {
      id: 'q4',
      q: 'Uma variável criada dentro de uma função é...',
      options: ['Global', 'Constante', 'Local', 'Um array'],
      answer: 2,
      explain: 'Local: só existe dentro daquele bloco.',
    },
    {
      id: 'q5',
      q: 'Com  function aumentarPreco(&$valor, $taxa) { $valor += $taxa; }  e  $notebook = 3000; aumentarPreco($notebook, 500);  quanto vale $notebook?',
      fill: true,
      pre: '$notebook =',
      post: '',
      accept: ['3500'],
      wrong: ['3000', '500', '2500'],
      placeholder: '?',
      explain: 'Por referência, a função alterou a variável de fora: 3000 + 500 = 3500.',
      hint: 'O <code>&amp;$valor</code> na função significa que ela mexe direto na variável de fora, não numa cópia.',
    },
    {
      id: 'q6',
      q: 'Em PHP, uma função consegue usar uma constante definida fora dela?',
      options: ['Não, nunca', 'Sim, constantes são visíveis em qualquer lugar', 'Só com a palavra global', 'Só se for passada como parâmetro'],
      answer: 1,
      explain: 'Constantes criadas com <code>define</code> ou <code>const</code> são visíveis em todo o script.',
    },
  ],
};
