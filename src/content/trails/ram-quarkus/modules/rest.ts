import type { Module } from '@/domain/trail/types';

/** Trilha 2 da Ramificação Quarkus: primeiro endpoint REST. */
export const modQuarkusRest: Module = {
  id: 'quarkus-rest',
  short: 'Primeiro endpoint',
  title: 'O primeiro endpoint REST',
  lead: 'No Quarkus, um endpoint é uma classe com anotações do padrão Jakarta REST: @Path diz o caminho e @GET diz o método.',
  level: 'Base',
  blocks: [
    {
      t: 'code',
      file: 'SaudacaoResource.java',
      lang: 'java',
      nolab: true,
      x: 'package org.acme;\n\nimport jakarta.ws.rs.GET;\nimport jakarta.ws.rs.Path;\nimport jakarta.ws.rs.PathParam;\nimport jakarta.ws.rs.Produces;\nimport jakarta.ws.rs.core.MediaType;\n\n@Path("/saudacao")\npublic class SaudacaoResource {\n\n    @GET\n    @Produces(MediaType.TEXT_PLAIN)\n    public String ola() {\n        return "Olá, Viajante";\n    }\n\n    @GET\n    @Path("/{nome}")\n    @Produces(MediaType.TEXT_PLAIN)\n    public String olaNome(@PathParam("nome") String nome) {\n        return "Olá, " + nome;\n    }\n}',
    },
    {
      t: 'cards',
      items: [
        { h: '@Path', x: 'Na classe: o caminho base. No método: o pedaço que vem depois.' },
        { h: '@GET', x: 'O método HTTP. Também existem <code>@POST</code>, <code>@PUT</code> e <code>@DELETE</code>.' },
        { h: '@Produces', x: 'O tipo da resposta: texto puro, JSON...' },
        { h: '@PathParam', x: 'Lê o <code>{nome}</code> do caminho.' },
      ],
    },
    { t: 'p', x: '<code>GET /saudacao/Ana</code> responde <code>Olá, Ana</code>. Devolvendo um objeto (com a extensão de JSON, <code>rest-jackson</code>), a resposta vira JSON.' },
    {
      t: 'note',
      k: 'Resource',
      x: 'No Quarkus, as classes de endpoint costumam se chamar <code>...Resource</code>. É só convenção, mas ajuda a achar as coisas.',
    },
    { t: 'say', x: 'Viu que não tem main nem servidor para configurar? O Quarkus acha as classes com @Path sozinho.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Quarkus: <a href="https://quarkus.io/guides/getting-started" target="_blank" rel="noopener">Creating Your First Application</a> e <a href="https://quarkus.io/guides/rest" target="_blank" rel="noopener">Writing REST Services with Quarkus REST</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual anotação define o caminho de um endpoint no Quarkus?',
      options: ['@GetMapping', '@Path', '@Route', '@Url'],
      answer: 1,
      explain: '<code>@Path</code> vem do padrão Jakarta REST, que o Quarkus usa.',
    },
    {
      id: 'q2',
      q: 'Com <code>@Path("/saudacao")</code> na classe e <code>@Path("/{nome}")</code> no método, qual pedido chama o método?',
      options: ['GET /nome', 'GET /saudacao/Ana', 'GET /saudacao?nome=Ana', 'POST /saudacao'],
      answer: 1,
      explain: 'Os caminhos se somam: <code>/saudacao</code> + <code>/{nome}</code>.',
    },
    {
      id: 'q3',
      q: 'Complete para ler o nome do caminho:',
      fill: true,
      pre: 'public String olaNome(@',
      post: '("nome") String nome)',
      accept: ['PathParam'],
      wrong: ['QueryParam', 'RequestParam', 'Path'],
      placeholder: '?',
      explain: '<code>@PathParam("nome")</code> lê o <code>{nome}</code>. <code>@QueryParam</code> é para o que vem depois do ?.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o método que responde GET com texto.',
      pieces: ['@GET', '@Produces(MediaType.TEXT_PLAIN)', 'public String ola()', '{ return "Olá"; }'],
      distractors: ['@GetMapping', '@Post', 'void ola()'],
      explain: '<code>@GET</code> + <code>@Produces</code> + o método que devolve o texto.',
    },
  ],
};
