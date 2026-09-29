import type { Module } from '@/domain/trail/types';

/** Trilha 4 da Ramificação Quarkus: banco de dados com Panache. */
export const modQuarkusPanache: Module = {
  id: 'quarkus-panache',
  short: 'Banco com Panache',
  title: 'Banco de dados com Panache',
  lead: 'O Panache deixa o Hibernate simples: a entidade já vem com id e com métodos prontos para salvar, listar e buscar.',
  level: 'Intermediário',
  blocks: [
    { t: 'p', x: 'Extensões: <code>hibernate-orm-panache</code> e o driver do banco (por exemplo, <code>jdbc-postgresql</code>).' },
    {
      t: 'note',
      k: 'Dev Services',
      x: 'No modo dev, se você não configurar um banco, o Quarkus sobe um sozinho num container (precisa do Docker ou Podman instalado). Zero configuração para começar.',
    },
    { t: 'h', x: 'A entidade' },
    {
      t: 'code',
      file: 'Pessoa.java',
      lang: 'java',
      nolab: true,
      x: 'package org.acme;\n\nimport io.quarkus.hibernate.orm.panache.PanacheEntity;\nimport jakarta.persistence.Entity;\n\n@Entity\npublic class Pessoa extends PanacheEntity {\n    public String nome;\n    public String cidade;\n}',
    },
    {
      t: 'p',
      x: 'Herdando de <code>PanacheEntity</code>, a classe já ganha o campo <code>id</code>. E os campos podem ser <code>public</code>: o Panache cuida dos getters e setters.',
    },
    { t: 'h', x: 'Usando' },
    {
      t: 'code',
      file: 'PessoaResource.java',
      lang: 'java',
      nolab: true,
      x: '@Path("/pessoas")\npublic class PessoaResource {\n\n    @GET\n    public List<Pessoa> todas() {\n        return Pessoa.listAll();\n    }\n\n    @POST\n    @Transactional\n    public Pessoa criar(Pessoa pessoa) {\n        pessoa.persist();\n        return pessoa;\n    }\n\n    @GET\n    @Path("/cidade/{cidade}")\n    public List<Pessoa> daCidade(@PathParam("cidade") String cidade) {\n        return Pessoa.list("cidade", cidade);\n    }\n}',
    },
    {
      t: 'cards',
      items: [
        { h: 'Pessoa.listAll()', x: 'Todas as linhas da tabela.' },
        { h: 'pessoa.persist()', x: 'Salva. Precisa de uma transação: <code>@Transactional</code>.' },
        { h: 'Pessoa.list("cidade", c)', x: 'Busca pelo campo, sem escrever SQL.' },
      ],
    },
    {
      t: 'note',
      k: '@Transactional',
      x: 'Toda escrita no banco (salvar, alterar, apagar) precisa estar dentro de uma transação. Sem <code>@Transactional</code>, o <code>persist()</code> dá erro.',
      warn: true,
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Quarkus: <a href="https://quarkus.io/guides/hibernate-orm-panache" target="_blank" rel="noopener">Simplified Hibernate ORM with Panache</a> e <a href="https://quarkus.io/guides/databases-dev-services" target="_blank" rel="noopener">Dev Services for Databases</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Herdando de PanacheEntity, o que a entidade ganha de graça?',
      options: ['Uma tela de cadastro', 'O campo id e métodos como persist e listAll', 'Um servidor próprio', 'Nada'],
      answer: 1,
      explain: 'O <code>id</code> e os métodos prontos vêm da classe-mãe.',
    },
    {
      id: 'q2',
      q: 'O que falta para o persist() funcionar num método que salva?',
      options: ['@GET', '@Transactional', '@ApplicationScoped', '@Produces'],
      answer: 1,
      explain: 'Escrita no banco precisa de transação.',
    },
    {
      id: 'q3',
      q: 'Complete para buscar todas as pessoas:',
      fill: true,
      pre: 'return Pessoa.',
      post: '();',
      accept: ['listAll'],
      wrong: ['findAll', 'getAll', 'select'],
      placeholder: '?',
      explain: '<code>Pessoa.listAll()</code> devolve uma lista com todas.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o método que salva uma pessoa.',
      pieces: ['@POST', '@Transactional', 'public Pessoa criar(Pessoa pessoa)', '{ pessoa.persist(); return pessoa; }'],
      distractors: ['@GET', 'pessoa.save();', '@Inject'],
      explain: 'POST + transação + <code>persist()</code>.',
    },
  ],
};
