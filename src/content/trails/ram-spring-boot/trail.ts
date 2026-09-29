import type { Trail } from '@/domain/trail/types';
import { ramSpringBootModules } from './modules';

/**
 * Ramificação Spring Boot (Evento Nexus da Lua de Java). Conteúdo original, com base só na
 * documentação oficial do Spring (links no fim de cada trilha).
 */
export const ramSpringBootTrail: Trail = {
  id: 'ram-spring-boot',
  title: 'Ramificação Spring Boot',
  tagline: 'Java pronto para a web: servidor embutido, injeção de dependência e dados sem SQL na mão.',
  symbol: 'ram-spring-boot',
  accent: '#3df5ff',
  eyebrow: 'Ramificação de Java · Spring Boot',
  intro: [
    'Viajante, a primeira Ramificação da Lua de Java é gigante: é onde o Java vira servidor web, com banco de dados e configuração para cada ambiente.',
    'Quem manda aqui é o <b>Colecionador de Beans</b>. Ele cria tudo com new, esconde senhas dentro do código e nunca deixa o Spring ajudar.',
    'Em 5 trilhas você vai aprender a deixar o Spring trabalhar. Depois, a coleção dele acaba. Bora?',
  ],
  modules: ramSpringBootModules,
  lab: null,
  bossFight: {
    bossName: 'O Colecionador de Beans',
    tagline: 'TUDO COM NEW, NADA NO LUGAR',
    intro: [
      'O Colecionador de Beans guarda milhares de objetos em potes, todos criados à mão com new, e se recusa a entregar qualquer um.',
      'Cada rodada é uma parte do Spring Boot que ele travou.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'Colecionador.java',
    rounds: [
      {
        title: 'Rodada 1 — A partida',
        description: 'Dentro do main, qual linha sobe a aplicação Spring Boot?',
        talk: 'Eu ligo tudo à mão. Um por um.',
        hint: 'SpringApplication.run recebe a classe principal e os argumentos.',
        check: ['^springapplication\\.run\\(\\s*demoapplication\\.class\\s*,\\s*args\\s*\\);?$'],
        choices: {
          correct: 'SpringApplication.run(DemoApplication.class, args);',
          wrong: ['new DemoApplication().start();', 'SpringApplication.run(args);', 'SpringApplication.start(DemoApplication.class);'],
        },
      },
      {
        title: 'Rodada 2 — A porta do controller',
        description: 'O método precisa atender GET em /saudacao. Qual anotação?',
        talk: 'Rotas? Eu respondo tudo num método só.',
        hint: 'GET no caminho /saudacao: @GetMapping("/saudacao").',
        check: ['^@getmapping\\(\\s*"/saudacao"\\s*\\)$'],
        choices: { correct: '@GetMapping("/saudacao")', wrong: ['@PostMapping("/saudacao")', '@GetMapping', '@RestController("/saudacao")'] },
      },
      {
        title: 'Rodada 3 — Os potes de new',
        description: 'O controller precisa do ServicoDePedidos. Qual é o jeito recomendado de recebê-lo?',
        talk: 'new ServicoDePedidos(). Simples assim.',
        hint: 'Injeção pelo construtor: o Spring entrega o bean.',
        check: ['^public\\s+pedidocontroller\\(\\s*servicodepedidos\\s+servico\\s*\\)'],
        choices: {
          correct: 'public PedidoController(ServicoDePedidos servico) { this.servico = servico; }',
          wrong: [
            'private ServicoDePedidos servico = new ServicoDePedidos();',
            'public static ServicoDePedidos servico;',
            'public void PedidoController(ServicoDePedidos servico) {}',
          ],
        },
      },
      {
        title: 'Rodada 4 — A consulta escondida',
        description: 'No ClienteRepository, qual método busca os clientes de uma cidade sem escrever SQL?',
        talk: 'SQL na mão, em string, é mais emocionante.',
        hint: 'O nome do método vira a consulta: findBy + o nome do campo.',
        check: ['^list<cliente>\\s+findbycidade\\(\\s*string\\s+cidade\\s*\\);?$'],
        choices: {
          correct: 'List<Cliente> findByCidade(String cidade);',
          wrong: ['List<Cliente> buscarCidade(String cidade);', 'List<Cliente> findCidadeBy(String cidade);', 'Cliente findByCidade();'],
        },
      },
      {
        title: 'Rodada 5 — Golpe final: a configuração fora do código',
        description: 'Qual linha lê a propriedade app.boas-vindas do application.properties?',
        talk: 'Eu escrevo a mensagem direto no código. E a senha também.',
        hint: '@Value com ${...} busca o valor na configuração.',
        check: ['^@value\\(\\s*"\\$\\{app\\.boas-vindas\\}"\\s*\\)\\s+string\\s+mensagem$'],
        choices: {
          correct: '@Value("${app.boas-vindas}") String mensagem',
          wrong: ['@Value("app.boas-vindas") String mensagem', 'String mensagem = "Olá, Viajante";', '@Value("#{app.boas-vindas}") String mensagem'],
        },
      },
    ],
    badgeId: 'ram-spring-colecionador',
    badgeTitle: 'Libertador de Beans',
    badgeDescription: 'Esvaziou os potes do Colecionador de Beans com injeção de dependência, JPA e configuração externa: a coroa da Ramificação Spring Boot.',
  },
};
