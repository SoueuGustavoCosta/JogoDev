import type { Module } from '@/domain/trail/types';

/** Trilha 2 da Ramificação Javalin: rotas e handlers. */
export const modJavalinRotas: Module = {
  id: 'javalin-rotas',
  short: 'Rotas e handlers',
  title: 'Rotas e handlers',
  lead: 'Cada rota liga um método HTTP e um caminho a um handler. E existem handlers que rodam antes e depois de todos.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'Um handler para cada método' },
    {
      t: 'code',
      file: 'App.java',
      lang: 'java',
      nolab: true,
      x: 'var app = Javalin.create(config -> {\n    config.routes.get("/tarefas", ctx -> ctx.result("lista de tarefas"));\n    config.routes.post("/tarefas", ctx -> ctx.status(201));\n    config.routes.delete("/tarefas/{id}", ctx -> ctx.status(204));\n}).start(7070);',
    },
    { t: 'h', x: 'Parâmetros de caminho' },
    {
      t: 'code',
      file: 'App.java',
      lang: 'java',
      nolab: true,
      x: 'config.routes.get("/ola/{nome}", ctx -> ctx.result("Olá, " + ctx.pathParam("nome")));',
    },
    { t: 'p', x: '<code>/ola/Ana</code> responde <code>Olá, Ana</code>. O nome entre chaves é o mesmo usado em <code>ctx.pathParam("nome")</code>.' },
    { t: 'h', x: 'Antes e depois: before e after' },
    {
      t: 'code',
      file: 'App.java',
      lang: 'java',
      nolab: true,
      x: 'config.routes.before(ctx -> System.out.println("Chegou: " + ctx.path()));\nconfig.routes.after(ctx -> ctx.header("X-Era", "Javalin"));',
    },
    { t: 'p', x: 'Handlers <code>before</code> rodam antes de todas as rotas (bom para logs ou checar login). Os <code>after</code>, depois.' },
    { t: 'h', x: 'Referência de método' },
    {
      t: 'code',
      file: 'TarefaController.java',
      lang: 'java',
      nolab: true,
      x: 'public class TarefaController {\n    public static void listar(Context ctx) {\n        ctx.result("lista de tarefas");\n    }\n}\n\n// no App.java, dentro do create\nconfig.routes.get("/tarefas", TarefaController::listar);',
    },
    { t: 'say', x: 'Quando as lambdas crescem, mova para métodos com nome. TarefaController::listar é uma referência: o Javalin chama o método quando o pedido chegar.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Javalin: <a href="https://javalin.io/documentation#handlers" target="_blank" rel="noopener">Handlers</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Como ler o <code>{nome}</code> da rota <code>/ola/{nome}</code>?',
      options: ['ctx.queryParam("nome")', 'ctx.pathParam("nome")', 'ctx.body()', 'ctx.header("nome")'],
      answer: 1,
      explain: 'Parte do caminho entre chaves chega por <code>pathParam</code>.',
    },
    {
      id: 'q2',
      q: 'Quando roda um handler registrado com <code>config.routes.before(...)</code>?',
      options: ['Só na rota "/"', 'Antes das rotas, a cada pedido', 'Depois da resposta ser enviada', 'Só quando dá erro'],
      answer: 1,
      explain: 'Handlers <code>before</code> rodam antes dos handlers de rota.',
    },
    {
      id: 'q3',
      kind: 'bug',
      q: '<code>/ola/Ana</code> responde "Olá, null". Toque na linha com o bug.',
      lines: ['config.routes.get("/ola/{nome}", ctx -> {', '    String nome = ctx.pathParam("name");', '    ctx.result("Olá, " + nome);', '});'],
      bugLine: 2,
      explain: 'O nome no caminho é <code>{nome}</code>, então a leitura é <code>pathParam("nome")</code>.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a rota que usa o método do controller.',
      pieces: ['config.routes.get(', '"/tarefas"', ',', 'TarefaController::listar', ')'],
      distractors: ['TarefaController.listar()', 'new TarefaController', '->'],
      explain: '<code>TarefaController::listar</code> passa o método sem chamá-lo.',
    },
  ],
};
