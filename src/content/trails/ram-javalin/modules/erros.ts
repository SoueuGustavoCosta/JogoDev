import type { Module } from '@/domain/trail/types';

/** Trilha 4 da Ramificação Javalin: tratamento de erros. */
export const modJavalinErros: Module = {
  id: 'javalin-erros',
  short: 'Tratamento de erros',
  title: 'Tratamento de erros',
  lead: 'Nem todo pedido dá certo. O Javalin tem respostas de erro prontas e deixa você decidir o que mostrar quando algo quebra.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Respostas de erro prontas' },
    {
      t: 'code',
      file: 'App.java',
      lang: 'java',
      nolab: true,
      x: 'import io.javalin.http.NotFoundResponse;\n\nconfig.routes.get("/tarefas/{id}", ctx -> {\n    Tarefa t = tarefas.get(ctx.pathParam("id"));\n    if (t == null) {\n        throw new NotFoundResponse("Tarefa não encontrada");\n    }\n    ctx.json(t);\n});',
    },
    {
      t: 'p',
      x: '<code>NotFoundResponse</code> é uma das exceções prontas (<code>BadRequestResponse</code>, <code>UnauthorizedResponse</code>...). Lançou, e o Javalin responde com o status certo.',
    },
    { t: 'h', x: 'Mapeando exceções' },
    {
      t: 'code',
      file: 'App.java',
      lang: 'java',
      nolab: true,
      x: 'config.routes.exception(NumberFormatException.class, (e, ctx) -> {\n    ctx.status(400).result("O id precisa ser um número");\n});',
    },
    { t: 'p', x: 'Qualquer rota que deixar escapar um <code>NumberFormatException</code> cai aqui, em vez de virar um erro 500 feio.' },
    { t: 'h', x: 'Páginas por status' },
    {
      t: 'code',
      file: 'App.java',
      lang: 'java',
      nolab: true,
      x: 'config.routes.error(404, ctx -> ctx.result("Esse endereço não existe nesta linha do tempo"));',
    },
    {
      t: 'cards',
      items: [
        { h: 'throw ...Response', x: 'Para no meio da rota com um erro HTTP pronto.' },
        { h: 'config.routes.exception', x: 'Trata um tipo de exceção em qualquer rota.' },
        { h: 'config.routes.error', x: 'Muda a resposta de um status (404, 500...).' },
      ],
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Javalin: <a href="https://javalin.io/documentation#exception-mapping" target="_blank" rel="noopener">Exception Mapping</a>, <a href="https://javalin.io/documentation#error-mapping" target="_blank" rel="noopener">Error Mapping</a> e <a href="https://javalin.io/documentation#default-responses" target="_blank" rel="noopener">Default responses</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que acontece ao lançar new NotFoundResponse("...") numa rota?',
      options: ['O servidor desliga', 'O Javalin responde 404 com a mensagem', 'A rota devolve 200', 'Nada, precisa de return'],
      answer: 1,
      explain: 'As respostas prontas do Javalin carregam o status HTTP certo.',
    },
    {
      id: 'q2',
      q: 'Qual a diferença entre config.routes.exception e config.routes.error?',
      options: [
        'São iguais',
        'exception trata um tipo de exceção; error trata um código de status',
        'error trata exceções; exception trata status',
        'exception só funciona em POST',
      ],
      answer: 1,
      explain: '<code>exception(Classe.class, ...)</code> por exceção; <code>error(404, ...)</code> por status.',
    },
    {
      id: 'q3',
      kind: 'bug',
      q: 'A tarefa inexistente responde 200 com o corpo vazio. Toque na linha com o bug.',
      lines: ['Tarefa t = tarefas.get(ctx.pathParam("id"));', 'if (t == null) {', '    new NotFoundResponse("Tarefa não encontrada");', '}', 'ctx.json(t);'],
      bugLine: 3,
      explain: 'Criar a exceção não basta: é preciso lançar com <code>throw</code>.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o mapeamento que troca NumberFormatException por 400.',
      pieces: ['config.routes.exception(', 'NumberFormatException.class', ',', '(e, ctx) -> ctx.status(400)', ')'],
      distractors: ['config.routes.error(', 'catch', '404'],
      explain: '<code>config.routes.exception(Tipo.class, (e, ctx) -> ...)</code>.',
    },
  ],
};
