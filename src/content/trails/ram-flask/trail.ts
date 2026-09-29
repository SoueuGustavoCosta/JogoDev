import type { Trail } from '@/domain/trail/types';
import { ramFlaskModules } from './modules';

/**
 * Ramificação Flask (Evento Nexus da Lua de Python). Conteúdo original, com base só na
 * documentação oficial do Flask (links no fim de cada trilha).
 */
export const ramFlaskTrail: Trail = {
  id: 'ram-flask',
  title: 'Ramificação Flask',
  tagline: 'Um microframework: começa com o essencial e cresce do seu jeito.',
  symbol: 'ram-flask',
  accent: '#ff3db8',
  eyebrow: 'Ramificação de Python · Flask',
  intro: [
    'Viajante, a terceira Ramificação de Python é pequena e leve. Com cinco linhas já tem um site no ar.',
    'Mas o <b>Borbulha</b> passou por aqui: um frasco que ferve rotas, templates e formulários tudo junto, até transbordar.',
    'Em 5 trilhas você vai aprender a separar cada coisa no seu lugar. Depois, a gente tampa esse frasco. Bora?',
  ],
  modules: ramFlaskModules,
  lab: null,
  bossFight: {
    bossName: 'o Borbulha',
    tagline: 'O FRASCO QUE FERVE TUDO JUNTO',
    intro: [
      'O Borbulha é um frasco de vidro rachado, borbulhando código. Cada bolha que estoura espalha uma rota no lugar errado.',
      'Ele acha que organizar é perda de tempo. Cada rodada é uma parte do Flask que ele entornou.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'borbulha.py',
    rounds: [
      {
        title: 'Rodada 1 — O frasco vazio',
        description: 'Você precisa criar o app Flask. Qual linha?',
        talk: 'App? Eu sou o app, o frasco e a mesa.',
        hint: 'O app nasce de Flask(__name__), sem aspas.',
        check: ['^app\\s*=\\s*flask\\(\\s*__name__\\s*\\)$'],
        choices: { correct: 'app = Flask(__name__)', wrong: ['app = Flask("__name__")', 'app = Flask()', 'app == Flask(__name__)'] },
      },
      {
        title: 'Rodada 2 — A porta trancada',
        description: 'O login precisa aceitar GET e POST. Qual decorador?',
        talk: 'POST? Aqui só entra GET. 405 para todo mundo!',
        hint: 'Os métodos aceitos vão numa lista em methods.',
        check: ['^@app\\.route\\(\\s*"/login"\\s*,\\s*methods\\s*=\\s*\\[\\s*"get"\\s*,\\s*"post"\\s*\\]\\s*\\)$'],
        choices: {
          correct: '@app.route("/login", methods=["GET", "POST"])',
          wrong: ['@app.route("/login")', '@app.route("/login", method="POST")', '@app.route("/login", methods="GET, POST")'],
        },
      },
      {
        title: 'Rodada 3 — A página derretida',
        description: 'Mostre o template ola.html com a variável pessoa. Qual retorno?',
        talk: 'HTML dentro de string é mais quentinho.',
        hint: 'render_template recebe o arquivo e as variáveis como argumentos nomeados.',
        check: ['^return\\s+render_template\\(\\s*"ola\\.html"\\s*,\\s*pessoa\\s*=\\s*nome\\s*\\)$'],
        choices: {
          correct: 'return render_template("ola.html", pessoa=nome)',
          wrong: ['return render_template(pessoa=nome)', 'return "ola.html"', 'return render_template("ola.html", nome)'],
        },
      },
      {
        title: 'Rodada 4 — O campo que falta',
        description: 'O campo "nome" pode não vir no formulário. Qual leitura não quebra com 400?',
        talk: 'request.form["nome"]. Sempre. Sem medo.',
        hint: '.get() devolve um padrão quando a chave não existe.',
        check: ['^request\\.form\\.get\\(\\s*"nome"\\s*,\\s*""\\s*\\)$'],
        choices: {
          correct: 'request.form.get("nome", "")',
          wrong: ['request.form["nome"]', 'request.args["nome"]', 'request.form.nome'],
        },
      },
      {
        title: 'Rodada 5 — Golpe final: tampar o frasco',
        description: 'Na fábrica create_app(), o que faz as rotas do Blueprint auth funcionarem?',
        talk: 'Importar já basta. Ou não?',
        hint: 'O Blueprint precisa ser registrado no app.',
        check: ['^app\\.register_blueprint\\(\\s*auth\\.bp\\s*\\)$'],
        choices: {
          correct: 'app.register_blueprint(auth.bp)',
          wrong: ['from . import auth', 'app.blueprint(auth)', 'auth.bp.register()'],
        },
      },
    ],
    badgeId: 'ram-flask-borbulha',
    badgeTitle: 'Selador do Borbulha',
    badgeDescription: 'Tampou o Borbulha com rotas, templates, formulários e Blueprints no lugar certo: a coroa da Ramificação Flask.',
  },
};
