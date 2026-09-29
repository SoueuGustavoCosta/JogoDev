import type { Module } from '@/domain/trail/types';

/** Trilha 5 da Ramificação Flask: organizando o projeto com Blueprints. */
export const modFlaskBlueprints: Module = {
  id: 'flask-blueprints',
  short: 'Blueprints',
  title: 'Organizando o projeto com Blueprints',
  lead: 'Quando o app cresce, um arquivo só vira uma bagunça. Um Blueprint agrupa rotas de um assunto, e a fábrica de apps junta tudo.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Um Blueprint é um grupo de rotas' },
    {
      t: 'code',
      file: 'meuapp/auth.py',
      lang: 'python',
      nolab: true,
      x: 'from flask import Blueprint, render_template\n\nbp = Blueprint("auth", __name__, url_prefix="/auth")\n\n\n@bp.route("/entrar")\ndef entrar():\n    return render_template("auth/entrar.html")',
    },
    { t: 'p', x: 'Com <code>url_prefix="/auth"</code>, a rota acima vira <code>/auth/entrar</code>.' },
    { t: 'h', x: 'A fábrica de apps' },
    { t: 'p', x: 'Em vez de criar o app no topo do arquivo, a documentação recomenda uma função que cria e configura o app: a <b>application factory</b>.' },
    {
      t: 'code',
      file: 'meuapp/__init__.py',
      lang: 'python',
      nolab: true,
      x: 'from flask import Flask\n\n\ndef create_app():\n    app = Flask(__name__)\n\n    from . import auth\n    app.register_blueprint(auth.bp)\n\n    return app',
    },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'flask --app meuapp run --debug' },
    {
      t: 'cards',
      items: [
        { h: 'Organização', x: 'Cada assunto (login, blog, admin) no seu arquivo.' },
        { h: 'Prefixo', x: 'Todas as rotas do Blueprint ganham o mesmo começo de URL.' },
        { h: 'url_for com ponto', x: 'Dentro do Blueprint, a rota se chama <code>url_for("auth.entrar")</code>.' },
      ],
    },
    { t: 'say', x: 'Última trilha feita. O Borbulha está fervendo tudo num frasco só. Mostre que você sabe separar cada coisa no seu lugar.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Flask: <a href="https://flask.palletsprojects.com/en/stable/blueprints/" target="_blank" rel="noopener">Modular Applications with Blueprints</a> e <a href="https://flask.palletsprojects.com/en/stable/tutorial/factory/" target="_blank" rel="noopener">Application Setup</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Com Blueprint("auth", __name__, url_prefix="/auth") e @bp.route("/entrar"), qual é a URL final?',
      options: ['/entrar', '/auth/entrar', '/auth', '/bp/entrar'],
      answer: 1,
      explain: 'O prefixo entra antes de todas as rotas do Blueprint.',
    },
    {
      id: 'q2',
      kind: 'bug',
      q: 'A rota /auth/entrar dá 404. Toque na linha com o bug da fábrica.',
      lines: ['def create_app():', '    app = Flask(__name__)', '    from . import auth', '    auth.bp', '    return app'],
      bugLine: 4,
      explain: 'O Blueprint só vale depois de <code>app.register_blueprint(auth.bp)</code>.',
    },
    {
      id: 'q3',
      q: 'O que é a application factory?',
      options: [
        'Um serviço que hospeda apps Flask',
        'Uma função que cria, configura e devolve o app',
        'Uma extensão paga do Flask',
        'Um template base',
      ],
      answer: 1,
      explain: '<code>create_app()</code> cria o app sob demanda: facilita testes e várias configurações.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha que registra o Blueprint no app.',
      pieces: ['app.register_blueprint(', 'auth.bp', ')'],
      distractors: ['app.add(', 'Blueprint(', 'auth.bp()'],
      explain: '<code>app.register_blueprint(auth.bp)</code> junta as rotas do Blueprint ao app.',
    },
  ],
};
