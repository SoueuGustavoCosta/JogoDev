import type { Module } from '@/domain/trail/types';

/** Trilha 3 da Ramificação Javalin: parâmetros e JSON. */
export const modJavalinJson: Module = {
  id: 'javalin-json',
  short: 'Parâmetros e JSON',
  title: 'Parâmetros de consulta, corpo e JSON',
  lead: 'Uma API conversa em JSON. O Javalin lê o JSON do pedido para um objeto Java e transforma objetos em JSON na resposta.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Parâmetros de consulta' },
    {
      t: 'code',
      file: 'App.java',
      lang: 'java',
      nolab: true,
      x: 'config.routes.get("/busca", ctx -> {\n    String termo = ctx.queryParam("q");\n    ctx.result("Você buscou: " + termo);\n});',
    },
    { t: 'p', x: '<code>/busca?q=javalin</code> chega em <code>ctx.queryParam("q")</code>. Se não vier, o valor é <code>null</code>.' },
    { t: 'h', x: 'Respondendo JSON' },
    {
      t: 'code',
      file: 'App.java',
      lang: 'java',
      nolab: true,
      x: 'record Tarefa(int id, String titulo) {}\n\nconfig.routes.get("/tarefas/1", ctx -> ctx.json(new Tarefa(1, "Estudar Javalin")));',
    },
    { t: 'out', file: 'resposta', x: '{"id":1,"titulo":"Estudar Javalin"}' },
    {
      t: 'note',
      k: 'Jackson',
      x: 'Para <code>ctx.json(...)</code> funcionar, o projeto precisa de uma biblioteca de JSON. O padrão do Javalin é o Jackson (<code>jackson-databind</code>).',
    },
    { t: 'h', x: 'Lendo JSON do corpo' },
    {
      t: 'code',
      file: 'App.java',
      lang: 'java',
      nolab: true,
      x: 'config.routes.post("/tarefas", ctx -> {\n    Tarefa nova = ctx.bodyAsClass(Tarefa.class);\n    // ... salvar\n    ctx.status(201).json(nova);\n});',
    },
    {
      t: 'cards',
      items: [
        { h: 'ctx.queryParam', x: 'Depois do ? na URL.' },
        { h: 'ctx.bodyAsClass', x: 'Converte o JSON do corpo num objeto Java.' },
        { h: 'ctx.status(201)', x: 'Muda o código de status da resposta.' },
      ],
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Javalin: <a href="https://javalin.io/documentation#context" target="_blank" rel="noopener">Context</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Como ler o q de /busca?q=javalin?',
      options: ['ctx.pathParam("q")', 'ctx.queryParam("q")', 'ctx.formParam("q")', 'ctx.body()'],
      answer: 1,
      explain: 'O que vem depois do <code>?</code> é parâmetro de consulta: <code>queryParam</code>.',
    },
    {
      id: 'q2',
      q: 'O que ctx.json(new Tarefa(1, "Estudar")) faz?',
      options: ['Salva no banco', 'Responde com o objeto convertido em JSON', 'Lê JSON do pedido', 'Imprime no console'],
      answer: 1,
      explain: 'O objeto vira JSON na resposta (com o Jackson no projeto).',
    },
    {
      id: 'q3',
      q: 'Complete para converter o corpo JSON num objeto Tarefa:',
      fill: true,
      pre: 'Tarefa nova = ctx.',
      post: '(Tarefa.class);',
      accept: ['bodyAsClass'],
      wrong: ['json', 'queryParam', 'result'],
      placeholder: '?',
      explain: '<code>bodyAsClass</code> lê o corpo e converte para a classe pedida.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a resposta de criação com status 201 e JSON.',
      pieces: ['ctx', '.status(201)', '.json(nova)', ';'],
      distractors: ['.result(201)', '.code(201)', 'return'],
      explain: 'Os métodos do contexto se encadeiam: <code>ctx.status(201).json(nova);</code>.',
    },
  ],
};
