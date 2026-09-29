import type { Module } from '@/domain/trail/types';

/** Trilha 3 da Ramificação FastAPI: corpo da requisição com Pydantic. */
export const modFastapiCorpo: Module = {
  id: 'fastapi-corpo',
  short: 'Corpo com Pydantic',
  title: 'Corpo da requisição com Pydantic',
  lead: 'Para criar um item, o cliente manda um JSON. Um model Pydantic diz qual é o formato certo, e o FastAPI confere tudo.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Um model descreve o JSON' },
    {
      t: 'code',
      file: 'main.py',
      lang: 'python',
      nolab: true,
      x: 'from fastapi import FastAPI\nfrom pydantic import BaseModel\n\n\nclass Item(BaseModel):\n    nome: str\n    preco: float\n    descricao: str | None = None\n\n\napp = FastAPI()\n\n\n@app.post("/itens/")\nasync def criar_item(item: Item):\n    return item',
    },
    {
      t: 'cards',
      items: [
        { h: 'Obrigatório', x: '<code>nome</code> e <code>preco</code> não têm padrão: precisam vir no JSON.' },
        { h: 'Opcional', x: '<code>descricao</code> tem padrão <code>None</code>: pode faltar.' },
        { h: 'Validado', x: 'Se <code>preco</code> vier como "caro", a resposta é 422 explicando o campo errado.' },
      ],
    },
    { t: 'p', x: 'Um cliente manda este corpo:' },
    { t: 'code', file: 'pedido.json', lang: 'json', nolab: true, x: '{\n  "nome": "Teclado",\n  "preco": 199.9\n}' },
    { t: 'p', x: 'Dentro da função, <code>item</code> já é um objeto Python: <code>item.nome</code>, <code>item.preco</code>.' },
    { t: 'h', x: 'Rota, consulta e corpo juntos' },
    {
      t: 'code',
      file: 'main.py',
      lang: 'python',
      nolab: true,
      x: '@app.put("/itens/{item_id}")\nasync def atualizar(item_id: int, item: Item, q: str | None = None):\n    return {"item_id": item_id, **item.model_dump(), "q": q}',
    },
    { t: 'p', x: 'O FastAPI separa sozinho: está no caminho? rota. É um model Pydantic? corpo. É um tipo simples? consulta.' },
    { t: 'say', x: 'O Pydantic é o porteiro desta Ramificação. Nada entra no seu código sem estar no formato certo.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do FastAPI: <a href="https://fastapi.tiangolo.com/tutorial/body/" target="_blank" rel="noopener">Request Body</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'No model Item, qual campo pode faltar no JSON sem erro?',
      options: ['nome', 'preco', 'descricao', 'Nenhum'],
      answer: 2,
      explain: '<code>descricao</code> tem padrão <code>None</code>. Os outros são obrigatórios.',
    },
    {
      id: 'q2',
      q: 'Complete a classe para virar um model Pydantic:',
      fill: true,
      pre: 'class Item(',
      post: '):',
      accept: ['BaseModel'],
      wrong: ['FastAPI', 'dict', 'Model'],
      placeholder: '?',
      explain: 'Models do Pydantic herdam de <code>BaseModel</code>.',
    },
    {
      id: 'q3',
      q: 'Em atualizar(item_id: int, item: Item, q: str | None = None) na rota /itens/{item_id}, de onde vem item?',
      options: ['Do caminho', 'Da consulta', 'Do corpo da requisição', 'Do cabeçalho'],
      answer: 2,
      explain: 'Parâmetro com tipo de model Pydantic é lido do corpo (JSON).',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha do campo obrigatório de preço.',
      pieces: ['preco', ':', 'float'],
      distractors: ['= None', 'Field', '=>'],
      explain: '<code>preco: float</code>, sem valor padrão: obrigatório e precisa ser número.',
    },
  ],
};
