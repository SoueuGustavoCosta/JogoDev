import type { Module } from '@/domain/trail/types';

/** Trilha 4 da Ramificação FastAPI: respostas e códigos de status. */
export const modFastapiRespostas: Module = {
  id: 'fastapi-respostas',
  short: 'Respostas e status',
  title: 'Respostas e códigos de status',
  lead: 'Toda resposta HTTP tem um número que diz como foi: 200 deu certo, 201 criou, 404 não achou. Escolher o número certo é parte da API.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Os códigos que você mais vai ver' },
    {
      t: 'table',
      cols: ['Código', 'Quer dizer'],
      rows: [
        ['200', 'OK: deu certo'],
        ['201', 'Created: algo novo foi criado'],
        ['404', 'Not Found: não existe'],
        ['422', 'Unprocessable Entity: os dados vieram no formato errado'],
      ],
      mac: false,
    },
    { t: 'h', x: 'Escolhendo o status da rota' },
    {
      t: 'code',
      file: 'main.py',
      lang: 'python',
      nolab: true,
      x: '@app.post("/itens/", status_code=201)\nasync def criar_item(item: Item):\n    return item',
    },
    { t: 'p', x: 'Também dá para usar os nomes prontos de <code>fastapi.status</code>, como <code>status.HTTP_201_CREATED</code>, que são mais fáceis de ler.' },
    { t: 'h', x: 'Quando não existe: HTTPException' },
    {
      t: 'code',
      file: 'main.py',
      lang: 'python',
      nolab: true,
      x: 'from fastapi import HTTPException\n\nitens = {"teclado": "Teclado mecânico"}\n\n\n@app.get("/itens/{item_id}")\nasync def ler_item(item_id: str):\n    if item_id not in itens:\n        raise HTTPException(status_code=404, detail="Item não encontrado")\n    return {"item": itens[item_id]}',
    },
    { t: 'out', file: 'GET /itens/mouse', x: '{"detail":"Item não encontrado"}' },
    {
      t: 'note',
      k: 'raise, não return',
      x: 'A <code>HTTPException</code> é lançada com <code>raise</code>. Ela interrompe a função na hora e o FastAPI devolve o erro ao cliente.',
    },
    { t: 'h', x: 'Filtrando a saída com response_model' },
    {
      t: 'p',
      x: 'Com <code>response_model</code>, a resposta passa pelo model antes de sair. Campos que não estão nele (como uma senha) ficam de fora.',
    },
    {
      t: 'code',
      file: 'main.py',
      lang: 'python',
      nolab: true,
      x: 'class UsuarioPublico(BaseModel):\n    nome: str\n\n\n@app.get("/eu", response_model=UsuarioPublico)\nasync def eu():\n    return {"nome": "Ana", "senha": "nunca-sai-daqui"}',
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do FastAPI: <a href="https://fastapi.tiangolo.com/tutorial/response-status-code/" target="_blank" rel="noopener">Response Status Code</a>, <a href="https://fastapi.tiangolo.com/tutorial/handling-errors/" target="_blank" rel="noopener">Handling Errors</a> e <a href="https://fastapi.tiangolo.com/tutorial/response-model/" target="_blank" rel="noopener">Response Model</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Uma rota POST acabou de criar um item. Qual código de status combina?',
      options: ['200', '201', '404', '422'],
      answer: 1,
      explain: '201 Created avisa que algo novo passou a existir.',
    },
    {
      id: 'q2',
      kind: 'bug',
      q: 'Pedindo um item que não existe, a resposta é 200 com o erro dentro. Toque na linha com o bug.',
      lines: [
        '@app.get("/itens/{item_id}")',
        'async def ler_item(item_id: str):',
        '    if item_id not in itens:',
        '        return HTTPException(status_code=404, detail="Não encontrado")',
        '    return {"item": itens[item_id]}',
      ],
      bugLine: 4,
      explain: 'Exceção se lança com <code>raise</code>. Com <code>return</code>, ela vira só um objeto devolvido com 200.',
    },
    {
      id: 'q3',
      q: 'Para que serve <code>response_model</code>?',
      options: [
        'Para validar o corpo que chega',
        'Para filtrar e validar o que a rota devolve',
        'Para escolher a porta do servidor',
        'Para criar a tabela no banco',
      ],
      answer: 1,
      explain: 'Ele passa a resposta pelo model: só saem os campos que o model declara.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha que responde 404 com uma mensagem.',
      pieces: ['raise', 'HTTPException(', 'status_code=404', ',', 'detail="Não encontrado"', ')'],
      distractors: ['return', 'status=404', 'throw'],
      explain: '<code>raise HTTPException(status_code=404, detail="...")</code> interrompe a rota e devolve o erro.',
    },
  ],
};
