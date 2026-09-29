import type { Module } from '@/domain/trail/types';

/** Trilha 5 da Ramificação Javalin: uma API pequena completa. */
export const modJavalinApi: Module = {
  id: 'javalin-api',
  short: 'API completa',
  title: 'Uma API pequena, completa',
  lead: 'Juntando tudo: listar, buscar, criar e apagar tarefas, com JSON, status certos e erros tratados. Tudo em memória, para focar no Javalin.',
  level: 'Intermediário',
  blocks: [
    {
      t: 'code',
      file: 'TarefasApi.java',
      lang: 'java',
      nolab: true,
      x: 'import io.javalin.Javalin;\nimport io.javalin.http.NotFoundResponse;\nimport java.util.Map;\nimport java.util.concurrent.ConcurrentHashMap;\nimport java.util.concurrent.atomic.AtomicInteger;\n\npublic class TarefasApi {\n    record Tarefa(int id, String titulo) {}\n    record NovaTarefa(String titulo) {}\n\n    public static void main(String[] args) {\n        Map<Integer, Tarefa> tarefas = new ConcurrentHashMap<>();\n        AtomicInteger proximoId = new AtomicInteger(1);\n\n        var app = Javalin.create(config -> {\n            config.routes.get("/tarefas", ctx -> ctx.json(tarefas.values()));\n            config.routes.get("/tarefas/{id}", ctx -> {\n                Tarefa t = tarefas.get(Integer.parseInt(ctx.pathParam("id")));\n                if (t == null) throw new NotFoundResponse("Tarefa não encontrada");\n                ctx.json(t);\n            });\n            config.routes.post("/tarefas", ctx -> {\n                NovaTarefa nova = ctx.bodyAsClass(NovaTarefa.class);\n                Tarefa t = new Tarefa(proximoId.getAndIncrement(), nova.titulo());\n                tarefas.put(t.id(), t);\n                ctx.status(201).json(t);\n            });\n            config.routes.delete("/tarefas/{id}", ctx -> {\n                tarefas.remove(Integer.parseInt(ctx.pathParam("id")));\n                ctx.status(204);\n            });\n            config.routes.exception(NumberFormatException.class, (e, ctx) -> ctx.status(400).result("id inválido"));\n        }).start(7070);\n    }\n}',
    },
    {
      t: 'table',
      cols: ['Pedido', 'Resposta'],
      rows: [
        ['GET /tarefas', '200 e a lista'],
        ['POST /tarefas {"titulo":"Estudar"}', '201 e a tarefa criada'],
        ['GET /tarefas/99', '404 Tarefa não encontrada'],
        ['GET /tarefas/abc', '400 id inválido'],
        ['DELETE /tarefas/1', '204, sem corpo'],
      ],
      mac: false,
    },
    {
      t: 'note',
      k: 'Conferido',
      x: 'Este código foi compilado e testado com o Javalin 7: cada linha da tabela acima é a resposta real.',
    },
    {
      t: 'note',
      k: 'Por que ConcurrentHashMap?',
      x: 'O servidor atende vários pedidos ao mesmo tempo. Um <code>HashMap</code> comum pode se corromper assim; o <code>ConcurrentHashMap</code> foi feito para isso.',
    },
    { t: 'say', x: 'Última trilha! O Handler Fantasma está por aí: rotas que somem, erros engolidos, status sempre 200. Hora de pegar ele.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Javalin: <a href="https://javalin.io/documentation" target="_blank" rel="noopener">Documentation</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Na API, o que responde <code>GET /tarefas/abc</code>?',
      options: ['404', '400 id inválido', '500', '200 com lista vazia'],
      answer: 1,
      explain: '<code>Integer.parseInt("abc")</code> lança <code>NumberFormatException</code>, que o mapeamento transforma em 400.',
    },
    {
      id: 'q2',
      q: 'Qual status combina com "apagou e não tem nada para devolver"?',
      options: ['200', '201', '204', '404'],
      answer: 2,
      explain: '204 No Content: deu certo, sem corpo.',
    },
    {
      id: 'q3',
      q: 'Por que usar <code>ConcurrentHashMap</code> em vez de <code>HashMap</code> aqui?',
      options: [
        'É mais bonito',
        'O servidor atende pedidos ao mesmo tempo, e ele é seguro para isso',
        'HashMap não aceita Integer',
        'O Javalin exige',
      ],
      answer: 1,
      explain: 'Vários pedidos simultâneos mexem no mapa: ele precisa ser seguro para concorrência.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a rota que apaga uma tarefa e responde 204.',
      pieces: ['config.routes.delete(', '"/tarefas/{id}"', ', ctx -> {', 'tarefas.remove(...);', 'ctx.status(204);', '});'],
      distractors: ['config.routes.remove(', 'ctx.status(200);', 'config.routes.post('],
      explain: 'DELETE apaga; 204 avisa que deu certo sem corpo.',
    },
  ],
};
