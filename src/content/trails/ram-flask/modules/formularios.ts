import type { Module } from '@/domain/trail/types';

/** Trilha 4 da Ramificação Flask: formulários e requisições. */
export const modFlaskFormularios: Module = {
  id: 'flask-formularios',
  short: 'Formulários',
  title: 'Formulários e o objeto request',
  lead: 'Tudo que o navegador manda fica no objeto request: os campos do formulário, os parâmetros da URL, o método usado.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'request.form e request.args' },
    {
      t: 'cards',
      items: [
        { h: 'request.form', x: 'Campos enviados por um formulário com POST.' },
        { h: 'request.args', x: 'Parâmetros da URL, depois do ?, como em <code>/busca?q=flask</code>.' },
        { h: 'request.method', x: 'Qual método chegou: GET, POST...' },
      ],
    },
    {
      t: 'code',
      file: 'app.py',
      lang: 'python',
      nolab: true,
      x: 'from flask import Flask, redirect, render_template, request, url_for\n\napp = Flask(__name__)\n\n\n@app.route("/contato", methods=["GET", "POST"])\ndef contato():\n    erro = None\n    if request.method == "POST":\n        nome = request.form.get("nome", "").strip()\n        if not nome:\n            erro = "Digite o seu nome."\n        else:\n            return redirect(url_for("obrigado"))\n    return render_template("contato.html", erro=erro)\n\n\n@app.route("/obrigado")\ndef obrigado():\n    return "Mensagem recebida!"',
    },
    {
      t: 'note',
      k: 'form["x"] ou form.get("x")?',
      x: 'Com <code>request.form["nome"]</code>, se o campo não vier, o Flask responde 400 (Bad Request). Com <code>.get("nome", "")</code> você recebe um padrão e decide o que fazer.',
    },
    { t: 'h', x: 'Parâmetros da URL' },
    {
      t: 'code',
      file: 'app.py',
      lang: 'python',
      nolab: true,
      x: '@app.route("/busca")\ndef busca():\n    termo = request.args.get("q", "")\n    return f"Você buscou: {termo}"',
    },
    { t: 'h', x: 'Parar na hora: abort' },
    {
      t: 'code',
      file: 'app.py',
      lang: 'python',
      nolab: true,
      x: 'from flask import abort\n\n\n@app.route("/painel")\ndef painel():\n    abort(401)  # não autorizado: nada abaixo roda',
    },
    { t: 'say', x: 'Redirecionar depois de um POST que deu certo é boa educação: recarregar a página não envia tudo de novo.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Flask: <a href="https://flask.palletsprojects.com/en/stable/quickstart/#the-request-object" target="_blank" rel="noopener">The Request Object</a> e <a href="https://flask.palletsprojects.com/en/stable/quickstart/#redirects-and-errors" target="_blank" rel="noopener">Redirects and Errors</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Onde fica o valor de q na URL /busca?q=flask?',
      options: ['request.form', 'request.args', 'request.method', 'request.json'],
      answer: 1,
      explain: 'Tudo depois do <code>?</code> fica em <code>request.args</code>.',
    },
    {
      id: 'q2',
      q: 'O que acontece com request.form["nome"] se o campo nome não vier no formulário?',
      options: ['Vira None', 'Vira texto vazio', 'O Flask responde 400 Bad Request', 'O servidor desliga'],
      answer: 2,
      explain: 'Chave que falta em <code>request.form[...]</code> gera 400. Use <code>.get()</code> quando o campo puder faltar.',
    },
    {
      id: 'q3',
      q: 'Complete para mandar o usuário para a página de agradecimento:',
      fill: true,
      pre: 'return',
      post: '(url_for("obrigado"))',
      accept: ['redirect'],
      wrong: ['render_template', 'abort', 'request'],
      placeholder: '?',
      explain: '<code>redirect()</code> manda o navegador para outro endereço.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha que lê o campo nome com um padrão vazio.',
      pieces: ['nome', '=', 'request.form.get(', '"nome"', ',', '""', ')'],
      distractors: ['request.args', 'form["nome"]', 'None'],
      explain: 'Com <code>.get("nome", "")</code>, campo ausente vira texto vazio em vez de erro 400.',
    },
  ],
};
