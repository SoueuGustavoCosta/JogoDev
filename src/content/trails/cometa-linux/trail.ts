import type { Trail } from '@/domain/trail/types';
import { cometaLinuxModules } from './modules';

/**
 * Cometa Linux (expansão Nexus): evento temporário. Datas em content/comets/calendar.ts.
 * Conteúdo original, com base só nos Linux man-pages e no manual do GNU coreutils.
 */
export const cometaLinuxTrail: Trail = {
  id: 'cometa-linux',
  title: 'Cometa Linux',
  tagline: 'O terminal do sistema que roda a maioria dos servidores do mundo.',
  symbol: 'cometa-linux',
  accent: '#5ee7ff',
  eyebrow: 'Cometa de tecnologia · Linux',
  intro: [
    'Viajante, mais um cometa na linha do tempo! Este traz o Linux: pastas, permissões, processos e scripts, tudo pelo terminal.',
    'Quem veio junto foi o <b>Sudo Supremo</b>, um fragmento do Eco que roda tudo como administrador e dá permissão para todo mundo.',
    'São 5 trilhas. Vença o Sudo Supremo enquanto o cometa está no céu e a insígnia rara é sua. Bora?',
  ],
  modules: cometaLinuxModules,
  lab: null,
  bossFight: {
    bossName: 'Sudo Supremo',
    tagline: 'ROOT PARA TODOS, 777 EM TUDO',
    intro: [
      'O Sudo Supremo senta num trono feito de terminais. Tudo que ele toca roda como root, e todo arquivo tem permissão 777.',
      'Cada rodada é um comando que ele desvirtuou.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'trono.sh',
    rounds: [
      {
        title: 'Rodada 1 — Onde estou?',
        description: 'Qual comando mostra a pasta atual?',
        talk: 'Você está onde eu mandar.',
        hint: 'print working directory.',
        check: ['^pwd$'],
        choices: { correct: 'pwd', wrong: ['ls', 'cd', 'whoami'] },
      },
      {
        title: 'Rodada 2 — Mudar de nome',
        description: 'Renomeie rascunho.txt para final.txt.',
        talk: 'Copie e apague. Dá mais trabalho, eu gosto.',
        hint: 'Renomear é mover para um nome novo.',
        check: ['^mv\\s+rascunho\\.txt\\s+final\\.txt$'],
        choices: { correct: 'mv rascunho.txt final.txt', wrong: ['cp rascunho.txt final.txt', 'rename final.txt', 'mv final.txt rascunho.txt'] },
      },
      {
        title: 'Rodada 3 — A coroa do 777',
        description: 'O script deploy.sh não executa. Qual comando resolve sem abrir tudo para todos?',
        talk: 'chmod 777. Sempre. Em tudo.',
        hint: 'Só falta a permissão de execução.',
        check: ['^chmod\\s+\\+x\\s+deploy\\.sh$'],
        choices: { correct: 'chmod +x deploy.sh', wrong: ['chmod 777 deploy.sh', 'sudo deploy.sh', 'chown +x deploy.sh'] },
      },
      {
        title: 'Rodada 4 — O processo teimoso',
        description: 'O processo 4321 precisa terminar, dando chance de fechar direito. Qual comando?',
        talk: 'kill -9 em tudo! Sem aviso!',
        hint: 'O sinal padrão (TERM) pede com educação.',
        check: ['^kill\\s+4321$'],
        choices: { correct: 'kill 4321', wrong: ['kill -9 4321', 'rm 4321', 'stop 4321'] },
      },
      {
        title: 'Rodada 5 — Golpe final: o script certo',
        description: 'Qual linha guarda o primeiro argumento na variável nome?',
        talk: 'Variável com let, com $ na frente... qualquer jeito serve!',
        hint: 'Em shell: nome, =, valor, tudo junto e sem espaços.',
        check: ['^nome=\\$1$'],
        choices: { correct: 'nome=$1', wrong: ['let nome = $1', '$nome=1', 'nome == $1'] },
      },
    ],
    badgeId: 'cometa-linux-comum',
    badgeTitle: 'Tripulante do Cometa Linux',
    badgeDescription: 'Destronou o Sudo Supremo: navegação, arquivos, permissões, processos e scripts.',
  },
};
