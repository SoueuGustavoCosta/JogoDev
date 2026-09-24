import type { Module } from '@/domain/trail/types';

/** Farol 8 da Lua de PHP: $_GET, $_POST, $_SESSION e o modelo de requisição-resposta da web. */
export const modWeb: Module = {
  id: 'superglobais-web-php',
  short: 'Conversando com o navegador',
  title: 'Superglobais: $_GET, $_POST e $_SESSION',
  lead: 'O último farol antes de enfrentar Malabari. Aqui está o motivo de PHP existir: conversar com formulários e navegadores.',
  level: 'Avançado',
  blocks: [
    { t: 'h', x: 'O modelo de PHP: uma requisição, uma resposta' },
    {
      t: 'p',
      x: 'Um script PHP roda no <b>servidor</b>, uma vez por requisição: o navegador pede uma página, o PHP processa e devolve HTML pronto. Diferente de um programa Python ou Java que fica rodando continuamente, o script PHP "nasce e morre" a cada requisição.',
    },
    {
      t: 'flow',
      items: ['Navegador pede a página', 'Servidor roda o script PHP', 'PHP gera HTML', 'Servidor devolve o HTML', 'Navegador exibe'],
    },
    { t: 'h', x: '$_GET: dados na própria URL' },
    {
      t: 'p',
      x: 'Quando os dados vêm na URL (depois do <code>?</code>), PHP os disponibiliza automaticamente no array <code>$_GET</code>.',
    },
    {
      t: 'code',
      file: 'get.php',
      lang: 'php',
      nolab: true,
      x: '// URL: pagina.php?busca=python\necho $_GET["busca"];   // python',
    },
    { t: 'h', x: '$_POST: dados enviados por um formulário' },
    {
      t: 'code',
      file: 'formulario.php',
      lang: 'php',
      nolab: true,
      x: '<form method="post" action="salvar.php">\n    <input type="text" name="nome">\n    <button type="submit">Enviar</button>\n</form>\n\n<?php\n// dentro de salvar.php:\n$nome = $_POST["nome"] ?? "";\necho "Olá, $nome!";\n?>',
    },
    {
      t: 'note',
      k: 'Sempre desconfie do que vem de fora',
      x: '$_GET e $_POST vêm direto do visitante — nunca confie neles sem validar. Usar ?? com um valor padrão, como no exemplo, já evita um dos erros mais comuns.',
      warn: true,
    },
    { t: 'h', x: '$_SESSION: lembrando de uma requisição para outra' },
    {
      t: 'p',
      x: 'Como cada requisição é independente, PHP usa <code>$_SESSION</code> (depois de chamar <code>session_start()</code>) para guardar dados entre uma página e a próxima — como "o usuário está logado" ou "o que está no carrinho".',
    },
    {
      t: 'code',
      file: 'sessao.php',
      lang: 'php',
      nolab: true,
      x: 'session_start();\n\n$_SESSION["nome"] = "Ana";\n\n// numa página seguinte, na mesma sessão:\nsession_start();\necho $_SESSION["nome"] ?? "visitante";   // Ana',
    },
    { t: 'h', x: 'As superglobais mais comuns' },
    {
      t: 'table',
      cols: ['Superglobal', 'O que guarda'],
      rows: [
        ['$_GET', 'dados enviados na URL'],
        ['$_POST', 'dados enviados por um formulário'],
        ['$_SESSION', 'dados que persistem entre requisições, para o mesmo visitante'],
        ['$_SERVER', 'informações do servidor e da requisição atual'],
      ],
    },
  ],
  quiz: [
    {
      q: 'Por onde chegam os dados guardados no array $_GET?',
      options: ['No corpo de um formulário POST', 'Na própria URL, depois do ?', 'No banco de dados', 'Numa variável de sessão'],
      answer: 1,
      explain: '$_GET recolhe automaticamente os parâmetros que vêm na URL, como pagina.php?busca=python.',
    },
    {
      q: 'Por que um script PHP precisa de $_SESSION para "lembrar" algo entre duas páginas?',
      options: [
        'Porque PHP não tem variáveis',
        'Porque cada requisição roda o script do zero, sem memória da anterior',
        'Porque $_SESSION é mais rápido que variáveis normais',
        'Não é verdade, PHP lembra automaticamente',
      ],
      answer: 1,
      explain: 'Cada requisição HTTP é independente; o script PHP "nasce e morre" a cada uma. $_SESSION é o jeito de manter dados entre requisições do mesmo visitante.',
    },
    {
      q: 'O que precisa ser chamado antes de usar $_SESSION num script PHP?',
      options: ['session_start()', 'session_init()', 'new Session()', 'Nada, funciona direto'],
      answer: 0,
      explain: 'session_start() precisa ser chamado (geralmente no início do script) para habilitar o uso de $_SESSION.',
    },
    {
      q: 'Qual superglobal guarda os dados enviados por um formulário HTML com method="post"?',
      options: ['$_GET', '$_POST', '$_SESSION', '$_FORM'],
      answer: 1,
      explain: '$_POST recebe os dados enviados no corpo de uma requisição POST, como um formulário submetido.',
    },
    {
      q: 'Complete: nunca se deve confiar direto em dados vindos de $_GET ou $_POST sem antes ___ o que foi recebido.',
      fill: true,
      pre: 'Nunca se deve confiar direto em dados vindos de $_GET ou $_POST sem antes',
      post: 'o que foi recebido.',
      accept: ['validar', 'validar/sanitizar', 'sanitizar'],
      placeholder: 'verbo',
      explain: 'Dados de $_GET e $_POST vêm do visitante e podem ser qualquer coisa — validar (e sanitizar) antes de usar é essencial para segurança.',
    },
  ],
};
