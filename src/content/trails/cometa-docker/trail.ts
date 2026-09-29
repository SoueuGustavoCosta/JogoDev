import type { Trail } from '@/domain/trail/types';
import { cometaDockerModules } from './modules';

/**
 * Cometa Docker (expansão Nexus): evento temporário. Datas em content/comets/calendar.ts.
 * Conteúdo original, com base só na documentação oficial do Docker.
 */
export const cometaDockerTrail: Trail = {
  id: 'cometa-docker',
  title: 'Cometa Docker',
  tagline: 'Containers: leve o programa e tudo que ele precisa para qualquer lugar.',
  symbol: 'cometa-docker',
  accent: '#5ee7ff',
  eyebrow: 'Cometa de tecnologia · Docker',
  intro: [
    'Viajante, um cometa cruzou a linha do tempo, e ele não vai ficar muito tempo! Ele carrega containers: programas que rodam iguais em qualquer máquina.',
    'Um fragmento do Eco pegou carona nele: o <b>Capitão Porto Fechado</b>, que tranca portas e joga dados fora.',
    'São 5 trilhas. Vença o Capitão enquanto o cometa está no céu e a insígnia rara é sua. Bora?',
  ],
  modules: cometaDockerModules,
  lab: null,
  bossFight: {
    bossName: 'Capitão Porto Fechado',
    tagline: 'NENHUMA PORTA ABRE NO MEU NAVIO',
    intro: [
      'O Capitão Porto Fechado comanda um navio de containers sem nenhuma porta aberta. O que entra, não sai; o que é salvo, afunda.',
      'Cada rodada é um container que ele trancou.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'navio.sh',
    rounds: [
      {
        title: 'Rodada 1 — Zarpar',
        description: 'Rode o nginx em segundo plano, com o nome web.',
        talk: 'Ninguém liga nada no meu navio!',
        hint: 'docker run, -d para segundo plano, --name para o nome.',
        check: ['^docker\\s+run\\s+-d\\s+--name\\s+web\\s+nginx$'],
        choices: {
          correct: 'docker run -d --name web nginx',
          wrong: ['docker start -d web nginx', 'docker run nginx --name web -d', 'docker build -d --name web nginx'],
        },
      },
      {
        title: 'Rodada 2 — A porta trancada',
        description: 'O nginx escuta na porta 80 do container. Publique na porta 8080 do seu computador.',
        talk: 'Porta? Aqui é tudo lacrado.',
        hint: 'O formato é -p porta-do-computador:porta-do-container.',
        check: ['^-p\\s+8080:80$'],
        choices: { correct: '-p 8080:80', wrong: ['-p 80:8080', '--port 8080', '-v 8080:80'] },
      },
      {
        title: 'Rodada 3 — A receita perdida',
        description: 'Qual instrução do Dockerfile define o comando que roda quando o container liga?',
        talk: 'Receita? Eu cozinho na hora.',
        hint: 'RUN é na construção; o que roda ao ligar é outra instrução.',
        check: ['^cmd\\s+\\["node",\\s*"src/index\\.js"\\]$'],
        choices: {
          correct: 'CMD ["node", "src/index.js"]',
          wrong: ['RUN ["node", "src/index.js"]', 'FROM node src/index.js', 'START node src/index.js'],
        },
      },
      {
        title: 'Rodada 4 — O porão que afunda',
        description: 'Os dados do Postgres somem quando o container é removido. Como montar o volume dados-db?',
        talk: 'Dados? Jogo ao mar.',
        hint: 'Volumes entram com -v nome:pasta-no-container.',
        check: ['^-v\\s+dados-db:/var/lib/postgresql/data$'],
        choices: {
          correct: '-v dados-db:/var/lib/postgresql/data',
          wrong: ['-p dados-db:/var/lib/postgresql/data', '-e dados-db', '-v /var/lib/postgresql/data:dados-db'],
        },
      },
      {
        title: 'Rodada 5 — Golpe final: a frota inteira',
        description: 'Ligue todos os serviços do compose.yaml em segundo plano.',
        talk: 'Um container de cada vez. Para sempre.',
        hint: 'O Compose liga tudo com up; -d para segundo plano.',
        check: ['^docker\\s+compose\\s+up\\s+-d$'],
        choices: { correct: 'docker compose up -d', wrong: ['docker compose down', 'docker run compose -d', 'docker compose build'] },
      },
    ],
    badgeId: 'cometa-docker-comum',
    badgeTitle: 'Tripulante do Cometa Docker',
    badgeDescription: 'Abriu as portas do Capitão Porto Fechado: containers, Dockerfile, volumes e Compose.',
  },
};
