import type { Module } from '@/domain/trail/types';

/** Trilha 1 da Ramificação Javalin: o primeiro servidor. */
export const modJavalinServidor: Module = {
  id: 'javalin-servidor',
  short: 'Primeiro servidor',
  title: 'O primeiro servidor Javalin',
  lead: 'Javalin é um framework web leve para Java e Kotlin. Sem anotações e sem mágica: você escreve as rotas com funções curtas.',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, depois do gigante Spring, uma Ramificação leve. No Javalin, um servidor inteiro cabe em três linhas. Olha só.' },
    { t: 'h', x: 'A dependência' },
    {
      t: 'p',
      x: 'No Maven (ou Gradle), você acrescenta o <code>io.javalin:javalin</code> e, para ver os logs, uma implementação do SLF4J, como o <code>slf4j-simple</code>.',
    },
    { t: 'h', x: 'O servidor inteiro' },
    {
      t: 'code',
      file: 'App.java',
      lang: 'java',
      nolab: true,
      x: 'import io.javalin.Javalin;\n\npublic class App {\n    public static void main(String[] args) {\n        var app = Javalin.create(config -> {\n            config.routes.get("/", ctx -> ctx.result("Olá, Viajante"));\n        }).start(7070);\n    }\n}',
    },
    {
      t: 'cards',
      items: [
        { h: 'Javalin.create(config -> ...)', x: 'Cria a aplicação. Tudo é configurado dentro dessa função, inclusive as rotas.' },
        { h: 'config.routes.get("/", ctx -> ...)', x: 'Rota GET na raiz. O <code>ctx</code> é o contexto: o pedido e a resposta juntos.' },
        { h: '.start(7070)', x: 'Sobe o servidor embutido na porta 7070.' },
      ],
    },
    { t: 'p', x: 'Rode o <code>main</code> e abra <code>http://localhost:7070</code>:' },
    { t: 'out', file: 'resposta', x: 'Olá, Viajante' },
    {
      t: 'note',
      k: 'ctx -> ...',
      x: 'Essa setinha é uma <b>lambda</b> do Java: uma função curta passada como valor. Cada rota do Javalin é uma lambda (ou uma referência a um método).',
    },
    {
      t: 'note',
      k: 'Tutoriais antigos',
      x: 'Até o Javalin 6, as rotas eram registradas direto no app: <code>app.get(...)</code>. A partir do Javalin 7, elas ficam em <code>config.routes</code>, dentro do <code>create</code>. Se um exemplo antigo não compilar, é isso.',
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Javalin: <a href="https://javalin.io/documentation#getting-started" target="_blank" rel="noopener">Getting started</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'No Javalin, o que é o ctx que cada rota recebe?',
      options: ['Uma conexão com o banco', 'O contexto: dados do pedido e da resposta', 'A configuração do Maven', 'Um contador de pedidos'],
      answer: 1,
      explain: 'O <code>Context</code> junta tudo do pedido (parâmetros, corpo) e da resposta (status, resultado).',
    },
    {
      id: 'q2',
      q: 'Em qual porta o exemplo sobe o servidor?',
      options: ['8080', '7070', '3000', '80'],
      answer: 1,
      explain: '<code>.start(7070)</code> escolhe a porta.',
    },
    {
      id: 'q3',
      q: 'Complete a rota para responder um texto:',
      fill: true,
      pre: 'config.routes.get("/", ctx -> ctx.',
      post: '("Olá"))',
      accept: ['result'],
      wrong: ['print', 'return', 'send'],
      placeholder: '?',
      explain: '<code>ctx.result("...")</code> define o texto da resposta.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a criação do app com uma rota e o start.',
      pieces: ['Javalin.create(config -> {', 'config.routes.get("/", ctx -> ctx.result("Oi"));', '})', '.start(7070);'],
      distractors: ['new Javalin()', 'app.get("/")', '@GetMapping("/")'],
      explain: 'As rotas ficam dentro do <code>create</code>; o <code>start(7070)</code> sobe o servidor.',
    },
  ],
};
