import type { Module } from '@/domain/trail/types';

/**
 * Migrado de Ilha_da_Logica_PHP_1.html (módulo "web" — "PHP na web: $_GET e $_SESSION").
 * O widget "Um clique, uma requisição" virou o jogo `requisicao-http` (HttpRequestWidget).
 */
export const modWeb: Module = {
  id: 'web',
  short: 'PHP na web: $_GET e $_SESSION',
  title: 'PHP na web: requisições, $_GET e $_SESSION',
  lead: 'Como um clique no navegador vira código rodando no servidor, e como o servidor lembra do que aconteceu antes.',
  level: 'Avançado',
  blocks: [
    {
      t: 'say',
      x: 'Farol 9, o último antes do desafio. Para o Jogo da Velha funcionar como página, você precisa entender três coisas: quem pede, quem responde e como o servidor lembra do tabuleiro.',
    },
    { t: 'h', x: 'Internet x Web' },
    {
      t: 'p',
      x: 'A <b>Internet</b> é a infraestrutura: cabos, satélites, roteadores. A <b>Web</b> (World Wide Web) é um serviço que roda em cima dela, permitindo acessar documentos ligados por links.',
    },
    { t: 'h', x: 'HTTP: pedido e resposta' },
    {
      t: 'p',
      x: 'Quando você digita um endereço, o navegador envia uma <b>requisição</b> (request). O servidor processa e devolve uma <b>resposta</b> (response). É a regra de conversa entre cliente e servidor: o protocolo <b>HTTP</b>.',
    },
    {
      t: 'cards',
      items: [
        { h: 'Cliente (frontend)', x: 'O navegador (Chrome, Firefox). Interpreta HTML e CSS e desenha a página.' },
        { h: 'Servidor (backend)', x: 'Onde o PHP mora. Processa a lógica e devolve o HTML pronto.' },
        { h: 'HTML x PHP', x: 'HTML é <b>estático</b>: mostra conteúdo fixo. PHP é <b>dinâmico</b>: gera conteúdo diferente conforme a lógica.' },
      ],
    },
    { t: 'p', x: 'Clique em "Próximo passo" para seguir um clique em uma casa do tabuleiro:' },
    { t: 'gui', widget: 'requisicao-http' },
    { t: 'h', x: 'Onde ficam os dados que o navegador envia?' },
    {
      t: 'table',
      cols: ['Superglobal', 'O que é', 'Exemplo'],
      rows: [
        ['<code>$_GET</code>', 'Dados na própria URL, depois do <code>?</code>', '<code>jogo.php?acao=jogar&amp;l=1&amp;c=2</code>'],
        ['<code>$_POST</code>', 'Dados enviados por um formulário', "<code>$_POST['n1']</code>"],
        ['<code>$_SESSION</code>', 'Memória do servidor para aquele visitante, entre uma requisição e outra', "<code>$_SESSION['jv']</code>"],
      ],
    },
    {
      t: 'code',
      file: 'index.html',
      lang: 'php',
      nolab: true,
      x: '<form action="calcular.php" method="post">\n    <label>Número 1:</label>\n    <input type="number" name="n1" required><br>\n    <label>Número 2:</label>\n    <input type="number" name="n2" required><br>\n    <button type="submit">Calcular Agora</button>\n</form>',
    },
    {
      t: 'code',
      file: 'calcular.php',
      lang: 'php',
      nolab: true,
      x: '<?php\n$valor1 = $_POST[\'n1\'];\n$valor2 = $_POST[\'n2\'];\n$resultado = $valor1 + $valor2;\necho "<h3>O resultado da soma é: $resultado</h3>";\n?>',
    },
    { t: 'h', x: 'Por que precisamos do $_SESSION?' },
    {
      t: 'p',
      x: 'O HTTP <b>não tem memória</b>: cada clique é uma requisição nova, e o PHP esquece todas as variáveis quando termina de responder. Se o tabuleiro fosse uma variável comum, sumiria a cada jogada! A solução é guardá-lo em <code>$_SESSION</code>. O Estudo Dirigido diz que isso "reforça o conceito de persistência de dados em aplicações web".',
    },
    {
      t: 'code',
      file: 'session.php',
      lang: 'php',
      nolab: true,
      x: "<?php\nsession_start();                        // liga a sessão (sempre no topo)\n\nif (!isset($_SESSION['jv'])) {          // primeira visita? cria o tabuleiro\n    $_SESSION['jv'] = array_fill(0, 3, array_fill(0, 3, '0'));\n}\n\nif (isset($_GET['acao']) && $_GET['acao'] == 'jogar') {\n    jogadorJoga((int)$_GET['l'], (int)$_GET['c']);\n}\n?>",
    },
    {
      t: 'note',
      k: 'Segurança básica',
      x: "Nunca confie no que vem do navegador. <code>isset()</code> confere se o dado existe e <code>(int)</code> força um número inteiro, impedindo que alguém envie <code>l=abc</code> pela URL. É por isso que o arquivo do professor escreve <code>(int)$_GET['l']</code>.",
    },
    { t: 'h', x: 'Misturando HTML e PHP' },
    {
      t: 'p',
      x: 'O tabuleiro é desenhado com uma sintaxe alternativa: <code>for (...):</code> e <code>endfor;</code> permitem abrir e fechar o PHP no meio do HTML.',
    },
    {
      t: 'code',
      file: 'tabuleiro (trecho)',
      lang: 'php',
      nolab: true,
      x: '<table>\n<?php for ($i = 0; $i < LIM; $i++): ?>\n    <tr>\n    <?php for ($j = 0; $j < LIM; $j++): ?>\n        <td><?php echo $_SESSION[\'jv\'][$i][$j]; ?></td>\n    <?php endfor; ?>\n    </tr>\n<?php endfor; ?>\n</table>',
    },
  ],
  quiz: [
    {
      id: 'q1',
      afterBlock: 5,
      q: 'Onde o código PHP é executado?',
      options: ['No navegador', 'No servidor', 'No celular do usuário', 'Dentro do HTML, sem servidor'],
      answer: 1,
      explain: 'O PHP roda no servidor e devolve HTML pronto ao navegador.',
    },
    {
      id: 'q2',
      afterBlock: 13,
      q: 'O HTTP guarda memória entre uma requisição e outra?',
      options: ['Sim, guarda tudo', 'Não: cada requisição é independente', 'Só nas requisições GET', 'Só nos formulários'],
      answer: 1,
      explain: 'Por isso usamos <code>$_SESSION</code> para lembrar coisas, como o tabuleiro.',
    },
    {
      id: 'q3',
      afterBlock: 14,
      q: 'Complete: qual função liga a sessão no topo do arquivo?',
      fill: true,
      pre: '',
      post: '();',
      accept: ['session_start'],
      wrong: ['session_open', 'start_session', 'session_begin'],
      placeholder: '?',
      explain: '<code>session_start()</code> precisa vir antes de qualquer saída.',
      hint: 'Está comentado como "liga a sessão" no session.php lá em cima.',
    },
    {
      id: 'q4',
      q: 'Na URL  jogo.php?acao=jogar&l=1&c=2  os valores chegam ao PHP em qual superglobal?',
      fill: true,
      pre: '',
      post: "['acao']",
      accept: ['$_GET', '$_get'],
      wrong: ['$_POST', '$_SESSION', '$_COOKIE'],
      placeholder: '?',
      explain: 'Dados na URL chegam em <code>$_GET</code>.',
    },
    {
      id: 'q5',
      afterBlock: 15,
      kind: 'output',
      q: 'Alguém digitou na URL  ?l=2abc . O arquivo do professor usa (int). O que aparece na tela?',
      lang: 'php',
      code: '<?php\n// "2abc" é o que veio em $_GET["l"]\n$l = (int) "2abc";\necho $l;',
      options: ['2', '2abc', '0', 'Erro'],
      answer: 0,
      explain: 'Nunca confie na entrada do usuário: o cast <code>(int)</code> garante um número (aqui, 2) e joga fora o lixo que veio junto.',
    },
  ],
};
