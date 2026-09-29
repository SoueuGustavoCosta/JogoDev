import type { Module } from '@/domain/trail/types';

/** Trilha 1 da Ramificação Flask: o primeiro app. */
export const modFlaskPrimeiro: Module = {
  id: 'flask-primeiro',
  short: 'Primeiro app',
  title: 'O primeiro app Flask',
  lead: 'Flask é um microframework: ele começa pequeno, com o essencial, e você acrescenta só o que precisar.',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, esta Ramificação é leve como um frasco de laboratório. Poucas linhas e já tem um site respondendo. Vamos ver.' },
    { t: 'h', x: 'Instalando' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'pip install Flask' },
    { t: 'h', x: 'Um app inteiro em 5 linhas' },
    {
      t: 'code',
      file: 'ola.py',
      lang: 'python',
      nolab: true,
      x: 'from flask import Flask\n\napp = Flask(__name__)\n\n\n@app.route("/")\ndef ola_mundo():\n    return "<p>Olá, mundo!</p>"',
    },
    {
      t: 'cards',
      items: [
        { h: 'Flask(__name__)', x: 'Cria o app. O <code>__name__</code> ajuda o Flask a achar templates e arquivos estáticos.' },
        { h: '@app.route("/")', x: 'Diz qual URL chama a função logo abaixo.' },
        { h: 'return "..."', x: 'O texto devolvido vai para o navegador. Por padrão, como HTML.' },
      ],
    },
    { t: 'h', x: 'Rodando' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'flask --app ola run' },
    { t: 'out', file: 'saida', x: ' * Serving Flask app \'ola\'\n * Running on http://127.0.0.1:5000' },
    {
      t: 'note',
      k: 'Modo debug',
      x: 'Com <code>flask --app ola run --debug</code> o servidor recarrega sozinho quando você salva e mostra os erros no navegador. Só no seu computador: nunca em produção.',
      warn: true,
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Flask: <a href="https://flask.palletsprojects.com/en/stable/quickstart/" target="_blank" rel="noopener">Quickstart</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Por que o Flask é chamado de microframework?',
      options: [
        'Porque só roda em computadores pequenos',
        'Porque começa com o essencial e você acrescenta o que precisar',
        'Porque só aceita uma rota',
        'Porque não tem documentação',
      ],
      answer: 1,
      explain: 'O núcleo é pequeno e simples. Banco, formulários e login entram por extensões quando você quiser.',
    },
    {
      id: 'q2',
      q: 'Qual comando roda o app que está em ola.py?',
      options: ['python manage.py runserver', 'flask --app ola run', 'uvicorn ola:app', 'flask start ola.py'],
      answer: 1,
      explain: '<code>--app ola</code> aponta para o arquivo <code>ola.py</code>.',
    },
    {
      id: 'q3',
      q: 'Complete o decorador que liga a URL raiz à função:',
      fill: true,
      pre: '@app.',
      post: '("/")',
      accept: ['route'],
      wrong: ['path', 'url', 'link'],
      placeholder: '?',
      explain: '<code>@app.route("/")</code> registra a rota.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha que cria o app.',
      pieces: ['app', '=', 'Flask(', '__name__', ')'],
      distractors: ['FastAPI(', '"__name__"', '=='],
      explain: '<code>app = Flask(__name__)</code>: sem aspas, porque <code>__name__</code> é uma variável do Python.',
    },
  ],
};
