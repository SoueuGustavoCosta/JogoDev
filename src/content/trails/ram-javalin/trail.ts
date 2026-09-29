import type { Trail } from '@/domain/trail/types';
import { ramJavalinModules } from './modules';

/**
 * Ramificação Javalin (Evento Nexus da Lua de Java). Conteúdo original, com base só na
 * documentação oficial do Javalin (links no fim de cada trilha).
 */
export const ramJavalinTrail: Trail = {
  id: 'ram-javalin',
  title: 'Ramificação Javalin',
  tagline: 'Um framework web leve para Java: rotas com lambdas, sem anotações nem mágica.',
  symbol: 'ram-javalin',
  accent: '#b6ff3d',
  eyebrow: 'Ramificação de Java · Javalin',
  intro: [
    'Viajante, a segunda Ramificação da Lua de Java é leve e direta. Um servidor inteiro em três linhas, e cada rota é uma função curta.',
    'Mas o <b>Handler Fantasma</b> assombra este lugar: ele some com rotas, engole erros e responde 200 para tudo.',
    'Em 5 trilhas você vai montar uma API de verdade, com JSON e erros tratados. Aí o fantasma não tem onde se esconder. Bora?',
  ],
  modules: ramJavalinModules,
  lab: null,
  bossFight: {
    bossName: 'O Handler Fantasma',
    tagline: 'A ROTA QUE RESPONDE 200 PARA TUDO',
    intro: [
      'O Handler Fantasma atravessa paredes e rotas. Onde ele passa, os erros somem e tudo responde 200, mesmo quando deu errado.',
      'Cada rodada é uma parte do Javalin que ele deixou invisível.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'Fantasma.java',
    rounds: [
      {
        title: 'Rodada 1 — O servidor invisível',
        description: 'No Javalin 7, onde a rota GET da raiz é registrada?',
        talk: 'Servidor? Que servidor? Eu não vejo nada.',
        hint: 'A partir do Javalin 7, as rotas ficam em config.routes, dentro do create.',
        check: ['^javalin\\.create\\(\\s*config\\s*->\\s*config\\.routes\\.get\\(\\s*"/"\\s*,\\s*ctx\\s*->\\s*ctx\\.result\\(.*\\)\\s*\\)\\s*\\)\\.start\\(\\s*7070\\s*\\);?$'],
        choices: {
          correct: 'Javalin.create(config -> config.routes.get("/", ctx -> ctx.result("Oi"))).start(7070);',
          wrong: [
            'new Javalin().get("/", ctx -> ctx.result("Oi")).start(7070);',
            'Javalin.create(config -> config.routes.get("/", ctx -> "Oi"));',
            'Javalin.create().start(7070).routes("/");',
          ],
        },
      },
      {
        title: 'Rodada 2 — O nome que sumiu',
        description: 'Na rota /ola/{nome}, como ler o nome?',
        talk: 'O nome? Evaporou. Tenta name, quem sabe.',
        hint: 'Parte do caminho entre chaves: pathParam, com o mesmo nome.',
        check: ['^ctx\\.pathparam\\(\\s*"nome"\\s*\\)$'],
        choices: { correct: 'ctx.pathParam("nome")', wrong: ['ctx.pathParam("name")', 'ctx.queryParam("nome")', 'ctx.body("nome")'] },
      },
      {
        title: 'Rodada 3 — O JSON transparente',
        description: 'Leia o corpo JSON do POST como um objeto NovaTarefa.',
        talk: 'JSON é só texto. Leia na mão, letra por letra.',
        hint: 'bodyAsClass converte o corpo na classe pedida.',
        check: ['^ctx\\.bodyasclass\\(\\s*novatarefa\\.class\\s*\\)$'],
        choices: {
          correct: 'ctx.bodyAsClass(NovaTarefa.class)',
          wrong: ['ctx.json(NovaTarefa.class)', 'ctx.body()', 'new NovaTarefa(ctx)'],
        },
      },
      {
        title: 'Rodada 4 — O erro que atravessa a parede',
        description: 'A tarefa não existe. Qual linha responde 404 de verdade?',
        talk: 'Eu engulo o erro e respondo 200. Ninguém percebe.',
        hint: 'A exceção pronta só funciona se for lançada.',
        check: ['^throw\\s+new\\s+notfoundresponse\\('],
        choices: {
          correct: 'throw new NotFoundResponse("Tarefa não encontrada");',
          wrong: ['new NotFoundResponse("Tarefa não encontrada");', 'ctx.result("Tarefa não encontrada");', 'return 404;'],
        },
      },
      {
        title: 'Rodada 5 — Golpe final: status honesto',
        description: 'Uma tarefa acabou de ser criada. Qual resposta?',
        talk: '200 para tudo! Criou, apagou, quebrou: 200!',
        hint: 'Criado é 201, e o objeto vai em JSON.',
        check: ['^ctx\\.status\\(\\s*201\\s*\\)\\.json\\(\\s*t\\s*\\);?$'],
        choices: { correct: 'ctx.status(201).json(t);', wrong: ['ctx.status(200).json(t);', 'ctx.result(201);', 'ctx.json(t).status(204);'] },
      },
    ],
    badgeId: 'ram-javalin-fantasma',
    badgeTitle: 'Caçador do Handler Fantasma',
    badgeDescription: 'Pegou o Handler Fantasma com rotas, JSON e erros tratados: a coroa da Ramificação Javalin.',
  },
};
