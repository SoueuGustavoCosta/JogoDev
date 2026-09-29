import type { Module } from '@/domain/trail/types';

/** Trilha 2 da Ramificação FastAPI: parâmetros de rota e de consulta. */
export const modFastapiParametros: Module = {
  id: 'fastapi-parametros',
  short: 'Parâmetros',
  title: 'Parâmetros de rota e de consulta',
  lead: 'A URL carrega informação. O FastAPI lê essa informação, converte para o tipo que você pediu e reclama se não der.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'Parâmetro de rota: um pedaço do caminho' },
    {
      t: 'code',
      file: 'main.py',
      lang: 'python',
      nolab: true,
      x: '@app.get("/itens/{item_id}")\nasync def ler_item(item_id: int):\n    return {"item_id": item_id}',
    },
    { t: 'p', x: 'Com a anotação <code>item_id: int</code>, o FastAPI converte o texto da URL em número. <code>/itens/3</code> devolve:' },
    { t: 'out', file: 'resposta', x: '{"item_id":3}' },
    { t: 'p', x: 'E <code>/itens/abc</code>? Não é número. O FastAPI responde com erro <b>422</b>, explicando o que estava errado, sem você escrever nenhum <code>if</code>.' },
    { t: 'h', x: 'Parâmetro de consulta: depois do ?' },
    { t: 'p', x: 'Parâmetros da função que <b>não</b> estão no caminho viram parâmetros de consulta (query):' },
    {
      t: 'code',
      file: 'main.py',
      lang: 'python',
      nolab: true,
      x: '@app.get("/itens/")\nasync def listar(pular: int = 0, limite: int = 10):\n    return {"pular": pular, "limite": limite}',
    },
    { t: 'p', x: '<code>/itens/?pular=20&amp;limite=5</code> chega como <code>pular=20</code> e <code>limite=5</code>. Sem nada na URL, valem os padrões 0 e 10.' },
    { t: 'h', x: 'Opcional' },
    {
      t: 'code',
      file: 'main.py',
      lang: 'python',
      nolab: true,
      x: '@app.get("/busca/")\nasync def buscar(q: str | None = None):\n    if q:\n        return {"busca": q}\n    return {"busca": "nada informado"}',
    },
    { t: 'say', x: 'Regra de bolso: está entre chaves no caminho? É parâmetro de rota. Não está? Vira parâmetro de consulta.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do FastAPI: <a href="https://fastapi.tiangolo.com/tutorial/path-params/" target="_blank" rel="noopener">Path Parameters</a> e <a href="https://fastapi.tiangolo.com/tutorial/query-params/" target="_blank" rel="noopener">Query Parameters</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Com item_id: int, o que acontece ao pedir /itens/abc?',
      options: ['Devolve item_id "abc"', 'Erro 422 com a explicação', 'Erro 500 no servidor', 'Devolve item_id 0'],
      answer: 1,
      explain: 'O tipo declarado é validado. Texto que não vira número dá 422, com detalhes no JSON.',
    },
    {
      id: 'q2',
      q: 'Na função listar(pular: int = 0, limite: int = 10) da rota /itens/, como chegam pular e limite?',
      options: ['No corpo da requisição', 'Como parâmetros de consulta, depois do ?', 'Como parte do caminho', 'Em cabeçalhos HTTP'],
      answer: 1,
      explain: 'Não estão entre chaves no caminho, então são query: <code>/itens/?pular=0&amp;limite=10</code>.',
    },
    {
      id: 'q3',
      kind: 'bug',
      q: 'A rota nunca recebe o id: dá erro dizendo que falta item_id. Toque na linha com o bug.',
      lines: ['@app.get("/itens/{id}")', 'async def ler_item(item_id: int):', '    return {"item_id": item_id}'],
      bugLine: 1,
      explain: 'O nome entre chaves precisa ser igual ao parâmetro da função: <code>{item_id}</code>.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o parâmetro de consulta opcional q.',
      pieces: ['q:', 'str | None', '=', 'None'],
      distractors: ['{q}', 'Optional', '=='],
      explain: '<code>q: str | None = None</code>: pode vir um texto ou nada.',
    },
  ],
};
