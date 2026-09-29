import type { Module } from '@/domain/trail/types';

/** Trilha 3 da Ramificação Spring Boot: injeção de dependência e beans. */
export const modSpringBeans: Module = {
  id: 'spring-beans',
  short: 'Injeção de dependência',
  title: 'Injeção de dependência e beans',
  lead: 'No Spring, você não cria os objetos principais com new. O Spring cria, guarda e entrega para quem precisa. Esses objetos se chamam beans.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'O problema do new em todo lugar' },
    {
      t: 'p',
      x: 'Se o controller faz <code>new ServicoDePedidos()</code>, ele fica preso àquela classe: difícil de trocar e de testar. Com <b>injeção de dependência</b>, o controller só diz "eu preciso de um serviço de pedidos", e o Spring entrega.',
    },
    { t: 'h', x: 'Marcando um bean' },
    {
      t: 'code',
      file: 'ServicoDePedidos.java',
      lang: 'java',
      nolab: true,
      x: 'import org.springframework.stereotype.Service;\n\n@Service\npublic class ServicoDePedidos {\n\n    public int total() {\n        return 3;\n    }\n}',
    },
    { t: 'p', x: '<code>@Service</code> (assim como <code>@Component</code> e <code>@Repository</code>) avisa o Spring: "crie um objeto desta classe e guarde".' },
    { t: 'h', x: 'Recebendo pelo construtor' },
    {
      t: 'code',
      file: 'PedidoController.java',
      lang: 'java',
      nolab: true,
      x: '@RestController\npublic class PedidoController {\n\n    private final ServicoDePedidos servico;\n\n    public PedidoController(ServicoDePedidos servico) {\n        this.servico = servico;\n    }\n\n    @GetMapping("/pedidos/total")\n    public int total() {\n        return servico.total();\n    }\n}',
    },
    {
      t: 'note',
      k: 'Injeção pelo construtor',
      x: 'Com um construtor só, o Spring injeta sem precisar de <code>@Autowired</code>. É o jeito recomendado: o campo fica <code>final</code> e fica fácil testar passando outro objeto.',
    },
    { t: 'h', x: 'Beans de classes que não são suas: @Bean' },
    {
      t: 'code',
      file: 'Configuracao.java',
      lang: 'java',
      nolab: true,
      x: 'import java.time.Clock;\nimport org.springframework.context.annotation.Bean;\nimport org.springframework.context.annotation.Configuration;\n\n@Configuration\npublic class Configuracao {\n\n    @Bean\n    public Clock relogio() {\n        return Clock.systemDefaultZone();\n    }\n}',
    },
    { t: 'say', x: 'Pense no Spring como um almoxarifado: você marca as peças com @Service ou @Bean, e ele entrega cada uma onde for pedida.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Spring: <a href="https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html" target="_blank" rel="noopener">Spring Beans and Dependency Injection</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que é um bean no Spring?',
      options: [
        'Um arquivo de configuração',
        'Um objeto que o Spring cria, guarda e entrega para quem precisa',
        'Uma tabela do banco',
        'Uma dependência do Maven',
      ],
      answer: 1,
      explain: 'Beans são os objetos gerenciados pelo Spring.',
    },
    {
      id: 'q2',
      q: 'Qual é o jeito recomendado de receber uma dependência?',
      options: ['Criar com new dentro do método', 'Pelo construtor', 'Numa variável static', 'Lendo de um arquivo'],
      answer: 1,
      explain: 'Injeção pelo construtor deixa o campo <code>final</code> e facilita testes.',
    },
    {
      id: 'q3',
      kind: 'bug',
      q: 'O Spring não encontra o serviço para injetar no controller. Toque na linha com o bug.',
      lines: ['public class ServicoDePedidos {', '', '    public int total() {', '        return 3;', '    }', '}'],
      bugLine: 1,
      explain: 'Falta marcar a classe com <code>@Service</code> (ou <code>@Component</code>) para ela virar um bean.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o construtor que recebe o serviço.',
      pieces: ['public', 'PedidoController(', 'ServicoDePedidos servico', ')'],
      distractors: ['new', 'static', 'void'],
      explain: 'Construtor não tem tipo de retorno: <code>public PedidoController(ServicoDePedidos servico)</code>.',
    },
  ],
};
