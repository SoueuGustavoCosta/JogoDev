import type { Module } from '@/domain/trail/types';

/** Trilha 5 da Ramificação FastAPI: documentação automática e testes. */
export const modFastapiDocs: Module = {
  id: 'fastapi-docs',
  short: 'Docs e testes',
  title: 'Documentação automática e testes',
  lead: 'Como você declarou os tipos, o FastAPI já sabe descrever a API inteira. E com o TestClient você testa sem abrir o navegador.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Documentação que se escreve sozinha' },
    {
      t: 'cards',
      items: [
        { h: '/docs', x: 'Swagger UI: uma página interativa onde você lê cada rota e testa na hora, com o botão "Try it out".' },
        { h: '/redoc', x: 'ReDoc: a mesma documentação, em formato de leitura.' },
        { h: '/openapi.json', x: 'O esquema OpenAPI: a descrição da API num formato que outras ferramentas entendem.' },
      ],
    },
    { t: 'p', x: 'Tudo isso sai dos tipos, dos models Pydantic e dos decoradores que você já escreveu. Nada a mais para manter.' },
    { t: 'h', x: 'Testando com TestClient' },
    { t: 'p', x: 'O <code>TestClient</code> faz pedidos para a sua aplicação direto no código, e o <code>pytest</code> roda os testes:' },
    {
      t: 'code',
      file: 'test_main.py',
      lang: 'python',
      nolab: true,
      x: 'from fastapi.testclient import TestClient\n\nfrom .main import app\n\nclient = TestClient(app)\n\n\ndef test_raiz():\n    resposta = client.get("/")\n    assert resposta.status_code == 200\n    assert resposta.json() == {"mensagem": "Olá, Viajante"}',
    },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'pip install pytest\npytest' },
    {
      t: 'note',
      k: 'Funções de teste',
      x: 'Os testes são funções normais (<code>def</code>, sem <code>async</code>) com nome começando por <code>test_</code>. O pytest encontra e roda todas.',
    },
    { t: 'say', x: 'Última trilha! A Hidra 422 está esperando: a cada tipo errado, ela ganha uma cabeça. Mostre que você não deixa nada torto passar.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do FastAPI: <a href="https://fastapi.tiangolo.com/tutorial/first-steps/" target="_blank" rel="noopener">First Steps (docs interativas)</a> e <a href="https://fastapi.tiangolo.com/tutorial/testing/" target="_blank" rel="noopener">Testing</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Em qual endereço fica a documentação interativa (Swagger UI)?',
      options: ['/admin', '/docs', '/swagger.html', '/help'],
      answer: 1,
      explain: '<code>/docs</code> é a Swagger UI. <code>/redoc</code> é a versão de leitura.',
    },
    {
      id: 'q2',
      q: 'De onde o FastAPI tira as informações para a documentação automática?',
      options: [
        'De um arquivo que você escreve à mão',
        'Dos tipos, models e decoradores do seu código',
        'Dos comentários do código',
        'De um serviço externo pago',
      ],
      answer: 1,
      explain: 'Os tipos que você declarou são a fonte: por isso a documentação nunca fica desatualizada.',
    },
    {
      id: 'q3',
      kind: 'output',
      q: 'O teste chama <code>client.get("/")</code> numa rota que devolve <code>{"ok": True}</code>. O que <code>resposta.status_code</code> vale?',
      lang: 'python',
      code: '@app.get("/")\nasync def raiz():\n    return {"ok": True}\n\nresposta = client.get("/")\nprint(resposta.status_code)',
      options: ['200', '201', 'True', '{"ok": true}'],
      answer: 0,
      explain: 'Sem <code>status_code</code> na rota, GET que deu certo responde 200.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha do teste que confere o status.',
      pieces: ['assert', 'resposta.status_code', '==', '200'],
      distractors: ['=', 'resposta.json()', 'expect'],
      explain: '<code>assert resposta.status_code == 200</code>: se não for 200, o teste falha.',
    },
  ],
};
