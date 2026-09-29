import type { Module } from '@/domain/trail/types';

/** Trilha 1 da Ramificação FastAPI: primeira API e o servidor. */
export const modFastapiPrimeira: Module = {
  id: 'fastapi-primeira',
  short: 'Primeira API',
  title: 'Primeira API e o servidor Uvicorn',
  lead: 'Uma API é um site feito para programas, não para pessoas: em vez de páginas, ela responde com dados, quase sempre em JSON.',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, esta Ramificação é rápida. Aqui cada função Python vira um endereço que responde JSON em milissegundos. Vamos montar a primeira.' },
    { t: 'h', x: 'Instalando' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'pip install "fastapi[standard]"' },
    { t: 'p', x: 'O pacote <code>fastapi[standard]</code> já traz o <b>Uvicorn</b>, o servidor que recebe os pedidos e entrega para a sua aplicação.' },
    { t: 'h', x: 'O menor app possível' },
    {
      t: 'code',
      file: 'main.py',
      lang: 'python',
      nolab: true,
      x: 'from fastapi import FastAPI\n\napp = FastAPI()\n\n\n@app.get("/")\nasync def raiz():\n    return {"mensagem": "Olá, Viajante"}',
    },
    {
      t: 'cards',
      items: [
        { h: 'app = FastAPI()', x: 'Cria a aplicação. É esse objeto que o servidor roda.' },
        { h: '@app.get("/")', x: 'Decorador de rota: pedidos GET no caminho "/" chamam a função logo abaixo.' },
        { h: 'return {...}', x: 'Você devolve um dicionário. O FastAPI transforma em JSON sozinho.' },
      ],
    },
    { t: 'h', x: 'Rodando' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'fastapi dev main.py' },
    { t: 'p', x: 'O comando <code>fastapi dev</code> sobe o Uvicorn com recarga automática. Abra <code>http://127.0.0.1:8000</code>:' },
    { t: 'out', file: 'resposta', x: '{"mensagem":"Olá, Viajante"}' },
    {
      t: 'note',
      k: 'Também funciona',
      x: 'Chamando o Uvicorn direto: <code>uvicorn main:app --reload</code>. O <code>main:app</code> quer dizer "no arquivo main.py, o objeto app".',
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do FastAPI: <a href="https://fastapi.tiangolo.com/tutorial/first-steps/" target="_blank" rel="noopener">First Steps</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que o FastAPI faz com o dicionário que a função devolve?',
      options: ['Mostra como texto Python', 'Converte em JSON na resposta', 'Salva num banco de dados', 'Ignora e devolve vazio'],
      answer: 1,
      explain: 'Dicionários, listas, números e textos viram JSON automaticamente.',
    },
    {
      id: 'q2',
      q: 'No comando uvicorn main:app --reload, o que é app?',
      options: ['O nome da pasta', 'O objeto FastAPI dentro de main.py', 'Um parâmetro de porta', 'O nome do servidor'],
      answer: 1,
      explain: '<code>main:app</code> = arquivo <code>main.py</code>, objeto <code>app</code>.',
    },
    {
      id: 'q3',
      q: 'Complete o decorador para responder pedidos GET na raiz:',
      fill: true,
      pre: '@app.',
      post: '("/")',
      accept: ['get'],
      wrong: ['route', 'post', 'path'],
      placeholder: '?',
      explain: 'Cada método HTTP tem o seu decorador: <code>@app.get</code>, <code>@app.post</code>, <code>@app.put</code>, <code>@app.delete</code>.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha que cria a aplicação.',
      pieces: ['app', '=', 'FastAPI', '()'],
      distractors: ['Flask', 'new', '=='],
      explain: '<code>app = FastAPI()</code>: a aplicação que o Uvicorn vai rodar.',
    },
  ],
};
