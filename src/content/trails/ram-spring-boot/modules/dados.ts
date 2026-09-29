import type { Module } from '@/domain/trail/types';

/** Trilha 4 da Ramificação Spring Boot: acesso a dados com Spring Data JPA. */
export const modSpringDados: Module = {
  id: 'spring-dados',
  short: 'Spring Data JPA',
  title: 'Acesso a dados com Spring Data JPA',
  lead: 'Com o Spring Data JPA, uma classe vira tabela e uma interface vira um repositório completo. Você quase não escreve SQL.',
  level: 'Intermediário',
  blocks: [
    { t: 'p', x: 'No Initializr, acrescente <b>Spring Data JPA</b> e um banco (para testar, o <b>H2</b>, que roda em memória).' },
    { t: 'h', x: 'A entidade' },
    {
      t: 'code',
      file: 'Cliente.java',
      lang: 'java',
      nolab: true,
      x: 'import jakarta.persistence.Entity;\nimport jakarta.persistence.GeneratedValue;\nimport jakarta.persistence.Id;\n\n@Entity\npublic class Cliente {\n\n    @Id\n    @GeneratedValue\n    private Long id;\n    private String nome;\n    private String cidade;\n\n    protected Cliente() {}\n\n    public Cliente(String nome, String cidade) {\n        this.nome = nome;\n        this.cidade = cidade;\n    }\n\n    // getters...\n}',
    },
    {
      t: 'cards',
      items: [
        { h: '@Entity', x: 'Esta classe vira uma tabela.' },
        { h: '@Id + @GeneratedValue', x: 'A chave primária, com valor gerado automaticamente.' },
        { h: 'Construtor vazio', x: 'O JPA precisa de um construtor sem argumentos para montar os objetos.' },
      ],
    },
    { t: 'h', x: 'O repositório: só a interface' },
    {
      t: 'code',
      file: 'ClienteRepository.java',
      lang: 'java',
      nolab: true,
      x: 'import java.util.List;\nimport org.springframework.data.repository.CrudRepository;\n\npublic interface ClienteRepository extends CrudRepository<Cliente, Long> {\n\n    List<Cliente> findByCidade(String cidade);\n}',
    },
    {
      t: 'p',
      x: 'Você não implementa nada. O Spring cria a implementação com <code>save</code>, <code>findById</code>, <code>findAll</code>, <code>deleteById</code>... E o <code>findByCidade</code>? Ele lê o <b>nome do método</b> e monta a consulta sozinho.',
    },
    {
      t: 'code',
      file: 'uso.java',
      lang: 'java',
      nolab: true,
      x: 'repositorio.save(new Cliente("Ana", "Ipatinga"));\nList<Cliente> daqui = repositorio.findByCidade("Ipatinga");',
    },
    { t: 'say', x: 'Lembra da Era dos Dados? findByCidade vira um SELECT ... WHERE cidade = ?. O Spring só escreve o SQL por você.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Spring: <a href="https://spring.io/guides/gs/accessing-data-jpa" target="_blank" rel="noopener">Accessing Data with JPA</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual anotação transforma a classe Cliente numa tabela?',
      options: ['@Table', '@Entity', '@Service', '@Repository'],
      answer: 1,
      explain: '<code>@Entity</code> marca a classe como entidade JPA, ligada a uma tabela.',
    },
    {
      id: 'q2',
      q: 'No repositório, o que o Spring faz com o método findByCidade(String cidade)?',
      options: [
        'Nada, você precisa implementar',
        'Monta a consulta a partir do nome do método',
        'Busca na internet',
        'Dá erro de compilação',
      ],
      answer: 1,
      explain: 'Consultas derivadas: o nome do método vira a consulta (<code>WHERE cidade = ?</code>).',
    },
    {
      id: 'q3',
      q: 'Complete a interface do repositório para Cliente com id Long:',
      fill: true,
      pre: 'public interface ClienteRepository extends',
      post: '<Cliente, Long> {}',
      accept: ['CrudRepository'],
      wrong: ['List', 'Entity', 'Service'],
      placeholder: '?',
      explain: '<code>CrudRepository&lt;Tipo, TipoDoId&gt;</code> traz as operações básicas.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha que salva um cliente novo.',
      pieces: ['repositorio', '.save(', 'new Cliente("Ana", "Ipatinga")', ');'],
      distractors: ['.insert(', 'INSERT INTO', '.persist'],
      explain: '<code>save</code> insere (ou atualiza) a entidade no banco.',
    },
  ],
};
