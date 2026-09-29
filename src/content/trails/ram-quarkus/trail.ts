import type { Trail } from '@/domain/trail/types';
import { ramQuarkusModules } from './modules';

/**
 * Ramificação Quarkus (Evento Nexus da Lua de Java). Conteúdo original, com base só na
 * documentação oficial do Quarkus (links no fim de cada trilha).
 */
export const ramQuarkusTrail: Trail = {
  id: 'ram-quarkus',
  title: 'Ramificação Quarkus',
  tagline: 'Java que liga em segundos: modo dev com recarga, CDI, Panache e build para a nuvem.',
  symbol: 'ram-quarkus',
  accent: '#ff3db8',
  eyebrow: 'Ramificação de Java · Quarkus',
  intro: [
    'Viajante, a terceira Ramificação da Lua de Java é a mais rápida. Aqui o Java sobe em segundos e o código muda sem reiniciar nada.',
    'Mas a <b>Partida a Frio</b> congelou este lugar: tudo demora, o servidor reinicia a cada mudança e a configuração some.',
    'Em 5 trilhas você vai aprender o jeito Quarkus de fazer as coisas. Depois, a gente descongela essa linha do tempo. Bora?',
  ],
  modules: ramQuarkusModules,
  lab: null,
  bossFight: {
    bossName: 'A Partida a Frio',
    tagline: 'O SERVIDOR QUE NUNCA TERMINA DE LIGAR',
    intro: [
      'A Partida a Frio é um bloco de gelo que cobre servidores inteiros. Cada vez que você muda uma linha, ela congela tudo e manda reiniciar do zero.',
      'Cada rodada é uma parte do Quarkus que ela congelou.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'PartidaFria.java',
    rounds: [
      {
        title: 'Rodada 1 — Descongelar o modo dev',
        description: 'Qual comando liga o modo dev, com recarga automática?',
        talk: 'Reinicie tudo. Sempre. Do zero.',
        hint: 'O modo dev do Quarkus pelo Maven Wrapper: quarkus:dev.',
        check: ['^\\./mvnw\\s+quarkus:dev$'],
        choices: { correct: './mvnw quarkus:dev', wrong: ['./mvnw spring-boot:run', './mvnw package', 'java -jar quarkus-run.jar --dev'] },
      },
      {
        title: 'Rodada 2 — O endpoint congelado',
        description: 'A classe precisa responder em /saudacao. Qual anotação vai na classe?',
        talk: 'Caminho? Aqui só tem gelo.',
        hint: 'O Quarkus usa as anotações do Jakarta REST.',
        check: ['^@path\\(\\s*"/saudacao"\\s*\\)$'],
        choices: { correct: '@Path("/saudacao")', wrong: ['@GetMapping("/saudacao")', '@Route("/saudacao")', '@GET("/saudacao")'] },
      },
      {
        title: 'Rodada 3 — O serviço sem escopo',
        description: 'Qual anotação transforma o SaudacaoService num bean único para a aplicação?',
        talk: 'Crie um novo toda vez. Congela mais bonito.',
        hint: 'Escopo de aplicação no CDI.',
        check: ['^@applicationscoped$'],
        choices: { correct: '@ApplicationScoped', wrong: ['@Service', '@Inject', '@RequestScoped'] },
      },
      {
        title: 'Rodada 4 — A escrita que não salva',
        description: 'O método que salva uma Pessoa com persist() dá erro. O que falta?',
        talk: 'Salvar sem transação é mais emocionante.',
        hint: 'Toda escrita no banco precisa de transação.',
        check: ['^@transactional$'],
        choices: { correct: '@Transactional', wrong: ['@GET', '@ApplicationScoped', '@Produces'] },
      },
      {
        title: 'Rodada 5 — Golpe final: configuração por perfil',
        description: 'Qual linha do application.properties muda a mensagem só no modo dev?',
        talk: 'Um valor só para tudo. E congelado.',
        hint: 'O perfil vai como prefixo com %.',
        check: ['^%dev\\.saudacao\\.mensagem\\s*=\\s*.+$'],
        choices: {
          correct: '%dev.saudacao.mensagem=Olá, dev',
          wrong: ['dev.saudacao.mensagem=Olá, dev', 'saudacao.mensagem.dev=Olá, dev', '@dev.saudacao.mensagem=Olá, dev'],
        },
      },
    ],
    badgeId: 'ram-quarkus-partida',
    badgeTitle: 'Degelo Supersônico',
    badgeDescription: 'Derreteu a Partida a Frio com modo dev, CDI, Panache e perfis: a coroa da Ramificação Quarkus.',
  },
};
