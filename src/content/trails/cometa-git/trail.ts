import type { Trail } from '@/domain/trail/types';
import { cometaGitModules } from './modules';

/**
 * Cometa Git (expansão Nexus): evento temporário. Datas em content/comets/calendar.ts.
 * Conteúdo original, com base só na documentação oficial do Git (git-scm.com). É outra
 * trilha, mais curta, que a Era do Git (`git-github`): liga os branches à trama das
 * Ramificações. Os desafios usam o laboratório Git que já existe.
 */
export const cometaGitTrail: Trail = {
  id: 'cometa-git',
  title: 'Cometa Git',
  tagline: 'Linhas do tempo que se dividem e se juntam: commits, branches, merge e push.',
  symbol: 'cometa-git',
  accent: '#5ee7ff',
  eyebrow: 'Cometa de tecnologia · Git',
  intro: [
    'Viajante, o terceiro cometa é o do Git: a ferramenta que dá nome às Ramificações. Aqui você cria, divide e junta linhas do tempo de verdade.',
    'O <b>Mestre dos Conflitos</b> veio junto. Ele adora quando duas linhas mexem no mesmo lugar e ninguém sabe resolver.',
    'São 5 trilhas, com laboratório. Vença o Mestre enquanto o cometa está no céu e a insígnia rara é sua. Bora?',
  ],
  modules: cometaGitModules,
  lab: 'git',
  bossFight: {
    bossName: 'Mestre dos Conflitos',
    tagline: 'TODA LINHA DO TEMPO EM CHOQUE',
    intro: [
      'O Mestre dos Conflitos cruza linhas do tempo só para vê-las bater. Onde ele passa, sobram marcas de conflito e commits sem mensagem.',
      'Cada rodada é uma linha que ele embaralhou.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'conflitos.sh',
    rounds: [
      {
        title: 'Rodada 1 — A primeira linha',
        description: 'Transforme a pasta num repositório.',
        talk: 'Sem história, sem conflito... por enquanto.',
        hint: 'Um comando só.',
        check: ['^git\\s+init$'],
        choices: { correct: 'git init', wrong: ['git start', 'git clone', 'git new'] },
      },
      {
        title: 'Rodada 2 — A foto do projeto',
        description: 'Grave o que está preparado com a mensagem "Cria o README".',
        talk: 'Commit sem mensagem é mais misterioso.',
        hint: 'git commit -m "mensagem".',
        check: ['^git\\s+commit\\s+-m\\s+"cria o readme"$'],
        choices: { correct: 'git commit -m "Cria o README"', wrong: ['git commit', 'git add -m "Cria o README"', 'git push -m "Cria o README"'] },
      },
      {
        title: 'Rodada 3 — A linha se divide',
        description: 'Crie o branch feature e já mude para ele, num comando só.',
        talk: 'Uma linha só para todos. E todos em choque.',
        hint: 'git switch com -c.',
        check: ['^git\\s+switch\\s+-c\\s+feature$'],
        choices: { correct: 'git switch -c feature', wrong: ['git branch feature', 'git merge feature', 'git switch feature -d'] },
      },
      {
        title: 'Rodada 4 — As marcas do choque',
        description: 'Qual linha separa as duas versões num conflito?',
        talk: 'Deixe as marcas no arquivo. São minha assinatura.',
        hint: 'São sete sinais de igual.',
        check: ['^=======$'],
        choices: { correct: '=======', wrong: ['<<<<<<< HEAD', '>>>>>>> feature', '-------'] },
      },
      {
        title: 'Rodada 5 — Golpe final: enviar ao mundo',
        description: 'Envie a main para o origin, lembrando a ligação.',
        talk: 'Deixe tudo só no seu computador.',
        hint: 'push com -u, o remoto e o branch.',
        check: ['^git\\s+push\\s+-u\\s+origin\\s+main$'],
        choices: { correct: 'git push -u origin main', wrong: ['git pull -u origin main', 'git push main origin', 'git remote push main'] },
      },
    ],
    badgeId: 'cometa-git-comum',
    badgeTitle: 'Tripulante do Cometa Git',
    badgeDescription: 'Desfez os choques do Mestre dos Conflitos: commits, branches, merge e push.',
  },
};
