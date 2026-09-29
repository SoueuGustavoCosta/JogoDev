import type { Module } from '@/domain/trail/types';

/** Trilha 3 da Ramificação Quarkus: injeção de dependência. */
export const modQuarkusInjecao: Module = {
  id: 'quarkus-injecao',
  short: 'Injeção de dependência',
  title: 'Injeção de dependência com CDI',
  lead: 'O Quarkus usa o padrão CDI: você marca uma classe com um escopo, e ele cria e entrega o objeto onde houver @Inject.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Um serviço com escopo' },
    {
      t: 'code',
      file: 'SaudacaoService.java',
      lang: 'java',
      nolab: true,
      x: 'package org.acme;\n\nimport jakarta.enterprise.context.ApplicationScoped;\n\n@ApplicationScoped\npublic class SaudacaoService {\n\n    public String saudacao(String nome) {\n        return "Olá, " + nome + "!";\n    }\n}',
    },
    { t: 'p', x: '<code>@ApplicationScoped</code>: existe um objeto só desse serviço para a aplicação inteira, criado quando for usado pela primeira vez.' },
    { t: 'h', x: 'Recebendo com @Inject' },
    {
      t: 'code',
      file: 'SaudacaoResource.java',
      lang: 'java',
      nolab: true,
      x: '@Path("/saudacao")\npublic class SaudacaoResource {\n\n    @Inject\n    SaudacaoService servico;\n\n    @GET\n    @Path("/{nome}")\n    @Produces(MediaType.TEXT_PLAIN)\n    public String ola(@PathParam("nome") String nome) {\n        return servico.saudacao(nome);\n    }\n}',
    },
    {
      t: 'note',
      k: 'Campo sem private',
      x: 'A documentação do Quarkus sugere deixar campos injetados sem <code>private</code> (visibilidade de pacote): assim o Quarkus não precisa de reflexão para preenchê-los. Injeção pelo construtor também funciona.',
    },
    {
      t: 'cards',
      items: [
        { h: '@ApplicationScoped', x: 'Um objeto para a aplicação toda.' },
        { h: '@RequestScoped', x: 'Um objeto novo para cada pedido HTTP.' },
        { h: '@Inject', x: 'Pede ao Quarkus o objeto certo para aquele campo ou construtor.' },
      ],
    },
    { t: 'say', x: 'Se você fez a Ramificação Spring Boot, é a mesma ideia com outros nomes: o @Service vira @ApplicationScoped, e o Quarkus entrega com @Inject.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Quarkus: <a href="https://quarkus.io/guides/cdi" target="_blank" rel="noopener">Introduction to Contexts and Dependency Injection (CDI)</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que @ApplicationScoped quer dizer?',
      options: [
        'Um objeto novo a cada pedido',
        'Um objeto só para a aplicação inteira',
        'O objeto nunca é criado',
        'O objeto só existe nos testes',
      ],
      answer: 1,
      explain: 'Escopo de aplicação: uma instância compartilhada.',
    },
    {
      id: 'q2',
      q: 'Complete para receber o serviço no resource:',
      fill: true,
      pre: '@',
      post: ' SaudacaoService servico;',
      accept: ['Inject'],
      wrong: ['Autowired', 'Path', 'Produces'],
      placeholder: '?',
      explain: '<code>@Inject</code> é a anotação do CDI. <code>@Autowired</code> é do Spring.',
    },
    {
      id: 'q3',
      kind: 'bug',
      q: 'O Quarkus não acha um bean para injetar. Toque na linha com o bug.',
      lines: ['package org.acme;', '', 'public class SaudacaoService {', '    public String saudacao(String nome) {', '        return "Olá, " + nome;', '    }', '}'],
      bugLine: 3,
      explain: 'Falta um escopo, como <code>@ApplicationScoped</code>, antes da classe.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a declaração do serviço como bean da aplicação.',
      pieces: ['@ApplicationScoped', 'public class', 'SaudacaoService', '{ }'],
      distractors: ['@Service', '@Inject', 'static'],
      explain: 'O escopo antes da classe transforma o serviço num bean.',
    },
  ],
};
