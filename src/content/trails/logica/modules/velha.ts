import type { Module } from '@/domain/trail/types';

/**
 * Migrado de Ilha_da_Logica_PHP_1.html (módulo "velha" — "Desafio: o Jogo da Velha").
 *
 * O minijogo interativo (5 passos de preencher lacunas de código — limpeza, posicao,
 * velha, maquinaJoga e a caça ao bug do tabuleiro cheio — mais o tabuleiro jogável
 * contra a máquina) virou o widget `TicTacToeStudyWidget`, registrado como
 * `{ t: 'gui', widget: 'jogo-da-velha' }` no fim dos blocos abaixo. O motor puro (regras
 * do jogo, jogada da máquina, checagem das lacunas) vive em `domain/ticTacToe`; as
 * lacunas de cada passo, extraídas literalmente dos blocos `code` abaixo, vivem em
 * `content/trails/logica/ticTacToeSteps.ts`.
 *
 * O protótipo não tinha `quiz` neste módulo (o "desafio" substituía a prova). Como o
 * domínio desta app exige pelo menos um item de quiz por módulo, foi acrescentado um
 * quiz curto sobre as regras do Estudo Dirigido e o código das funções, para o farol
 * seguir o mesmo padrão dos outros nove.
 */
export const modVelha: Module = {
  id: 'velha',
  short: 'Desafio: Jogo da Velha',
  title: 'Desafio: o Jogo da Velha (Estudo Dirigido)',
  lead: 'O último farol é uma prova de fogo: completar, função por função, o jogo que o professor deixou "em construção".',
  level: 'Avançado',
  blocks: [
    {
      t: 'say',
      x: 'Farol 10. Este é o Estudo Dirigido de Programação de Computadores I, transformado em missão. O arquivo do professor está com as funções "Em construção". Você vai escrever o miolo de cada uma. Quando terminar, um tabuleiro de verdade aparece para você jogar contra a máquina.',
    },
    { t: 'h', x: 'O jogo e as regras' },
    {
      t: 'p',
      x: 'O <b>Jogo da Velha</b> é uma matriz 3 por 3 onde dois jogadores marcam <b>X</b> ou <b>O</b> para formar três símbolos em sequência (horizontal, vertical ou diagonal). Se ninguém formar a sequência, "deu velha". Na versão do professor, você (<b>J</b>) joga contra a máquina (<b>M</b>), e o tabuleiro é guardado em <code>$_SESSION</code>.',
    },
    {
      t: 'flow',
      items: ['Você clica na casa', '?acao=jogar&l=&c=', 'jogadorJoga()', 'posicao()', 'velha(JOGADOR)', 'maquinaJoga()', 'velha(MAQUINA)'],
    },
    {
      t: 'cards',
      items: [
        { h: "<code>$_SESSION['jv']</code>", x: "A matriz 3x3 do tabuleiro. <code>'0'</code> = casa livre, <code>'J'</code> = jogador, <code>'M'</code> = máquina." },
        { h: "<code>$_SESSION['vitoria']</code>", x: '0 = jogo rolando, 1 = jogador venceu, 2 = máquina venceu.' },
        { h: "<code>$_SESSION['empate']</code> e <code>['turno']</code>", x: 'Controle de empate ("deu velha") e de quem joga.' },
      ],
    },
    {
      t: 'note',
      k: 'Regras do Estudo Dirigido',
      x: '<b>(A)</b> completar todos os trechos que dizem <code>echo "Em construção........";</code>. <b>(B)</b> comentar <b>todo</b> o código explicando cada linha. Manter as partes existentes intactas. Todo arquivo entregue começa com um comentário de bloco: curso, disciplina, professor e aluno. E o algoritmo precisa ser <b>de autoria do aluno</b>.',
    },
    {
      t: 'note',
      k: 'Sobre autoria',
      x: 'O jogo guia você e confere cada lacuna, mas quem digita é você, e é assim que se aprende. Na hora de entregar, escreva o seu arquivo, com os <b>seus</b> comentários, linha por linha. Explicar com as próprias palavras é metade da nota.',
    },
    { t: 'h', x: 'Missão: complete as cinco funções' },
    {
      t: 'p',
      x: 'Digite nas lacunas o que falta em cada função do arquivo do professor. As lacunas abaixo (<code>___</code>) mostram exatamente o que cada passo pede — é o mesmo código do desafio interativo.',
    },
    {
      t: 'code',
      file: 'limpeza.php — passo 1',
      lang: 'php',
      nolab: true,
      x: "function limpeza() {\n    $_SESSION['jv'] = ___;       // array_fill(0, LIM, array_fill(0, LIM, '0'))\n    $_SESSION['vitoria'] = ___;  // 0\n    $_SESSION['empate'] = ___;   // 0\n    $_SESSION['turno'] = JOGADOR;\n}",
    },
    {
      t: 'p',
      x: "O tabuleiro nasce vazio. O arquivo do professor sugere <code>array_fill(0, LIM, array_fill(0, LIM, '0'))</code>. Vitória e empate começam em 0 (ninguém ganhou).",
    },
    {
      t: 'code',
      file: 'posicao.php — passo 2',
      lang: 'php',
      nolab: true,
      x: "function posicao($l, $c) {\n    if ($_SESSION['jv'][$l][$c] ___ '0') {  // !==\n        return ___;    // 1, ocupada\n    }\n    return ___;        // 0, livre\n}",
    },
    {
      t: 'p',
      x: "A pergunta \"essa casa já foi usada?\". Uma casa livre guarda '0'. Se o valor for <b>diferente</b> de '0', alguém já jogou ali.",
    },
    {
      t: 'code',
      file: 'velha.php — passo 3',
      lang: 'php',
      nolab: true,
      x: "function velha($jog) {\n    $t = $_SESSION['jv'];\n    for ($i = 0; $i < LIM; $i++) {\n        if ($t[$i][0] == $jog && $t[$i][1] == $jog && $t[$i][___] == $jog) {  // 2\n            return 1;      // linha completa\n        }\n        if ($t[0][$i] == $jog && $t[___][$i] == $jog && $t[2][$i] == $jog) {  // 1\n            return 1;      // coluna completa\n        }\n    }\n    if ($t[0][0] == $jog && $t[1][1] == $jog && $t[2][2] == $jog) {\n        return 1;          // diagonal principal\n    }\n    if ($t[0][2] == $jog && ___ && $t[2][0] == $jog) {  // $t[1][1] == $jog\n        return 1;          // diagonal secundária\n    }\n    return ___;  // 0\n}",
    },
    {
      t: 'p',
      x: 'O coração do jogo: alguém formou três marcas em sequência? Confira as 3 linhas, as 3 colunas e as 2 diagonais. Um laço, dois testes por volta e duas diagonais: 8 jeitos de ganhar, todos cobertos.',
    },
    {
      t: 'code',
      file: 'maquinaJoga.php — passo 4',
      lang: 'php',
      nolab: true,
      x: "function maquinaJoga() {\n    do {\n        $l = rand(0, ___);   // 2 (ou LIM-1)\n        $c = rand(0, 2);\n    } while (posicao($l, $c) == ___);  // 1\n\n    $_SESSION['jv'][$l][$c] = ___;  // MAQUINA (ou 'M')\n    if (velha(MAQUINA)) {\n        $_SESSION['vitoria'] = ___;  // 2\n    }\n}",
    },
    {
      t: 'p',
      x: 'A máquina joga sorteando casas até achar uma livre, com <code>rand()</code> e um laço <code>do...while</code>, que roda pelo menos uma vez. Funciona! Mas o Bug já está de olho: você reparou que esse laço tem um ponto fraco?',
    },
    {
      t: 'note',
      k: 'Caça ao Bug: tabuleiro cheio',
      warn: true,
      x: "Pense: e se o tabuleiro estiver <b>cheio</b> e ninguém tiver ganhado? O <code>do...while</code> sorteia casas ocupadas para sempre. É o laço infinito do farol 6! Crie a função <code>livres()</code> e proteja a máquina.",
    },
    {
      t: 'code',
      file: 'livres.php — passo 5 (caça ao bug)',
      lang: 'php',
      nolab: true,
      x: "function livres() {\n    $n = 0;\n    for ($i = 0; $i < LIM; $i++) {\n        for ($j = 0; $j < LIM; $j++) {\n            if ($_SESSION['jv'][$i][$j] == ___) {  // '0'\n                ___;  // $n++\n            }\n        }\n    }\n    return $n;\n}\n\nfunction maquinaJoga() {\n    if (livres() == ___) {  // 0\n        $_SESSION['empate'] = 1;   // deu velha\n        return;\n    }\n    // ... resto igual ao passo anterior\n}",
    },
    {
      t: 'p',
      x: 'Conte as casas que ainda guardam \'0\'. Se <code>livres()</code> devolver 0, não há onde jogar: é empate ("deu velha") e a função sai com <code>return</code>. Bug derrotado: a máquina agora sabe quando parar. (Numa entrega real, esse tipo de acréscimo é bom combinar com o professor, pois o enunciado pede para não alterar a estrutura existente.)',
    },
    {
      t: 'note',
      k: 'Para entregar ao professor',
      x: 'Arquivo começa com o comentário de bloco (curso, disciplina, professor e aluno); todas as funções "Em construção" completadas por você; cada linha comentada, com as suas palavras; a estrutura original mantida; testado no navegador: jogar, ganhar, perder, empatar e reiniciar.',
    },
    { t: 'h', x: 'Agora é a sua vez: preencha as lacunas' },
    {
      t: 'p',
      x: 'Complete os 5 passos abaixo com o mesmo código dos blocos acima. Quando o último passo estiver certo, o tabuleiro aparece de verdade — e você joga contra a máquina que acabou de programar.',
    },
    { t: 'gui', widget: 'jogo-da-velha' },
  ],
  quiz: [
    {
      q: 'Na função posicao($l, $c), o que ela devolve quando a casa já está ocupada?',
      options: ['0', '1', "'0'", 'null'],
      answer: 1,
      explain: "posicao() devolve 1 quando $_SESSION['jv'][$l][$c] é diferente de '0' (ocupada) e 0 quando está livre.",
    },
    {
      q: 'Quantas verificações a função velha($jog) faz para saber se alguém ganhou?',
      options: ['Só as 3 linhas', '3 linhas, 3 colunas e 2 diagonais (8 no total)', 'Só as diagonais', 'Uma por casa do tabuleiro (9)'],
      answer: 1,
      explain: 'Um laço cobre as 3 linhas e as 3 colunas (testadas juntas a cada volta) e mais dois testes cobrem as duas diagonais: 8 formas de vencer.',
    },
    {
      q: 'Por que o do...while de maquinaJoga() sozinho é perigoso quando o tabuleiro está cheio?',
      options: [
        'Porque ele nunca executa',
        'Porque sorteia casas ocupadas para sempre e nunca sai: é um laço infinito',
        'Porque só funciona com tabuleiros vazios',
        'Porque troca o jogador pela máquina',
      ],
      answer: 1,
      explain: 'Sem checar se ainda há casas livres (livres() == 0), o laço continua sorteando posições ocupadas indefinidamente.',
    },
    {
      q: 'Complete: a função que conta quantas casas ainda guardam \'0\' se chama...',
      fill: true,
      pre: 'function',
      post: '() { ... }',
      accept: ['livres'],
      placeholder: '?',
      explain: '<code>livres()</code> devolve quantas posições do tabuleiro ainda estão livres, e protege maquinaJoga() do laço infinito.',
    },
  ],
};
