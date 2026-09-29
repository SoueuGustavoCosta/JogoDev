import type { Module } from '@/domain/trail/types';

/** Trilha 1 do Cometa Git: controle de versão e git init. */
export const modGitcInit: Module = {
  id: 'cometa-git-init',
  short: 'Controle de versão',
  title: 'O que é controle de versão, e o git init',
  lead: 'Controle de versão é uma máquina do tempo para o seu código: cada versão fica guardada e dá para voltar a qualquer uma.',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, o terceiro cometa é o do Git: a ferramenta que inspirou as próprias Ramificações. Aqui você aprende a criar linhas do tempo de verdade.' },
    { t: 'h', x: 'Sem controle de versão' },
    { t: 'p', x: '<code>trabalho_final.doc</code>, <code>trabalho_final_v2.doc</code>, <code>trabalho_final_AGORA_VAI.doc</code>... Você já viu esse filme. O Git guarda cada versão com data, autor e uma mensagem explicando o que mudou.' },
    { t: 'h', x: 'Configurando quem é você' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'git config --global user.name "Seu Nome"\ngit config --global user.email "voce@exemplo.com"' },
    { t: 'p', x: 'Isso é feito uma vez só por computador. O nome e o e-mail vão em cada versão que você gravar.' },
    { t: 'h', x: 'Criando o repositório' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'cd meu-projeto\ngit init' },
    { t: 'p', x: 'O <code>git init</code> cria uma pasta escondida <code>.git</code>: é ali que o Git guarda toda a história. A partir daqui, a pasta é um <b>repositório</b>.' },
    {
      t: 'try',
      engine: 'git',
      file: 'terminal — meu-projeto',
      brief: 'Transforme esta pasta num repositório Git.',
      starter: '',
      hint: 'Um comando só: git init.',
      repo: 'projeto',
      mission: 'm1',
      solution: 'git init',
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Pro Git (documentação oficial): <a href="https://git-scm.com/book/pt-br/v2/Come%C3%A7ando-Sobre-Controle-de-Vers%C3%A3o" target="_blank" rel="noopener">Sobre controle de versão</a> e <a href="https://git-scm.com/docs/git-init" target="_blank" rel="noopener">git-init</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Onde o Git guarda toda a história do repositório?',
      options: ['Na nuvem, sempre', 'Na pasta escondida .git', 'No arquivo README', 'No GitHub'],
      answer: 1,
      explain: 'Tudo fica em .git, no próprio projeto. O GitHub é só uma cópia remota.',
    },
    {
      id: 'q2',
      q: 'Para que serve git config --global user.name?',
      options: ['Criar uma conta no GitHub', 'Dizer quem é o autor das versões que você grava', 'Dar nome ao repositório', 'Trocar de branch'],
      answer: 1,
      explain: 'Nome e e-mail entram em cada commit.',
    },
    {
      id: 'q3',
      q: 'Qual comando transforma uma pasta num repositório Git?',
      options: ['git start', 'git init', 'git new', 'git create'],
      answer: 1,
      explain: 'git init.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: configure o seu nome no Git para todos os projetos.',
      pieces: ['git config', '--global', 'user.name', '"Seu Nome"'],
      distractors: ['git init', '--local-only', 'user.password'],
      explain: 'git config --global user.name "Seu Nome".',
    },
  ],
};
