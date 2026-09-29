import type { Module } from '@/domain/trail/types';

/** Trilha 2 da Ramificação Flask: rotas e métodos HTTP. */
export const modFlaskRotas: Module = {
  id: 'flask-rotas',
  short: 'Rotas e métodos',
  title: 'Rotas e métodos HTTP',
  lead: 'Uma rota pode ter pedaços variáveis e aceitar só alguns métodos: GET para ler, POST para enviar.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'Partes variáveis na URL' },
    {
      t: 'code',
      file: 'app.py',
      lang: 'python',
      nolab: true,
      x: '@app.route("/usuario/<nome>")\ndef perfil(nome):\n    return f"Perfil de {nome}"\n\n\n@app.route("/post/<int:post_id>")\ndef mostrar_post(post_id):\n    return f"Post número {post_id}"',
    },
    {
      t: 'table',
      cols: ['Conversor', 'Aceita'],
      rows: [
        ['string (padrão)', 'qualquer texto sem barra'],
        ['int', 'inteiros positivos'],
        ['float', 'números com ponto'],
        ['path', 'texto, inclusive com barras'],
      ],
      mac: false,
    },
    { t: 'h', x: 'Métodos HTTP' },
    { t: 'p', x: 'Por padrão uma rota só responde GET. Para aceitar POST, avise em <code>methods</code>:' },
    {
      t: 'code',
      file: 'app.py',
      lang: 'python',
      nolab: true,
      x: 'from flask import request\n\n\n@app.route("/login", methods=["GET", "POST"])\ndef login():\n    if request.method == "POST":\n        return "Tentando entrar..."\n    return "Mostrando o formulário"',
    },
    { t: 'p', x: 'Também existem atalhos: <code>@app.get("/login")</code> e <code>@app.post("/login")</code>, cada um numa função.' },
    { t: 'h', x: 'url_for: nunca escreva a URL na mão' },
    {
      t: 'code',
      file: 'app.py',
      lang: 'python',
      nolab: true,
      x: 'from flask import url_for\n\nwith app.test_request_context():\n    print(url_for("perfil", nome="Ana"))',
    },
    { t: 'out', file: 'saida', x: '/usuario/Ana' },
    { t: 'say', x: 'O url_for monta o endereço pelo nome da função. Se um dia a rota mudar, os links continuam certos.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Flask: <a href="https://flask.palletsprojects.com/en/stable/quickstart/#routing" target="_blank" rel="noopener">Quickstart, Routing e HTTP Methods</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Com <code>@app.route("/post/&lt;int:post_id&gt;")</code>, o que acontece ao abrir <code>/post/abc</code>?',
      options: ['post_id vale "abc"', 'O Flask responde 404', 'post_id vale 0', 'O servidor trava'],
      answer: 1,
      explain: '"abc" não passa no conversor <code>int</code>, então a rota não casa e a resposta é 404.',
    },
    {
      id: 'q2',
      kind: 'bug',
      q: 'O formulário de login envia por POST e recebe 405 Method Not Allowed. Toque na linha com o bug.',
      lines: ['@app.route("/login")', 'def login():', '    if request.method == "POST":', '        return "Entrando..."', '    return "Formulário"'],
      bugLine: 1,
      explain: 'Sem <code>methods=["GET", "POST"]</code>, a rota só aceita GET.',
    },
    {
      id: 'q3',
      q: 'Qual a vantagem de usar <code>url_for("perfil", nome="Ana")</code> em vez de escrever <code>"/usuario/Ana"</code>?',
      options: [
        'Nenhuma, é só mais longo',
        'Se a rota mudar, os links continuam certos',
        'Deixa o site mais rápido',
        'Esconde a URL do usuário',
      ],
      answer: 1,
      explain: 'O endereço é montado pelo nome da função: mudou a rota, todos os links acompanham.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a rota de login que aceita GET e POST.',
      pieces: ['@app.route(', '"/login"', ',', 'methods=["GET", "POST"]', ')'],
      distractors: ['method="POST"', '@app.get(', 'type=["POST"]'],
      explain: '<code>methods</code> é uma lista com os métodos aceitos.',
    },
  ],
};
