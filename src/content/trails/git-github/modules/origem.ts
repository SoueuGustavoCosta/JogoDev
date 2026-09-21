import type { Module } from '@/domain/trail/types';

/**
 * Migrado de ilha_git_github.html (módulo "origem" — "Por que existe o Git").
 */
export const modOrigem: Module = {
  id: 'origem',
  short: 'Por que existe o Git',
  title: 'Por que existe um controle de versão?',
  lead: 'Antes de digitar qualquer comando, entenda o problema que o Git veio resolver — e o que quase parou o desenvolvimento do Linux em 2005.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'O problema: código que ninguém sabe qual é o certo' },
    {
      t: 'p',
      x: 'Sem controle de versão, projetos viram uma pilha de arquivos chamados <code>projeto_final.zip</code>, <code>projeto_final2.zip</code> e <code>projeto_final_DEFINITIVO.zip</code>. Ninguém sabe qual é o mais recente, o que mudou entre um e outro, nem como voltar atrás quando algo quebra.',
    },
    {
      t: 'cards',
      items: [
        { h: 'Perda de histórico', x: 'Sem saber quem mudou o quê e quando, um bug de duas semanas atrás vira um mistério.' },
        { h: 'Medo de mudar', x: 'Sem uma forma segura de voltar atrás, cada mudança arriscada é adiada.' },
        { h: 'Trabalho em equipe travado', x: 'Duas pessoas editando o mesmo arquivo, uma sobrescrevendo o trabalho da outra.' },
        { h: 'Cópias divergentes', x: 'Cada computador com uma versão diferente do projeto, sem ninguém saber qual é a verdadeira.' },
      ],
    },
    {
      t: 'note',
      k: 'Curiosidade histórica',
      x: 'O Git foi criado por <b>Linus Torvalds</b> (o mesmo do Linux) em <b>abril de 2005</b>. A equipe do kernel Linux usava o BitKeeper, um sistema pago, até a licença gratuita ser revogada. Sem alternativa à altura, Torvalds escreveu o núcleo do Git em cerca de dez dias.',
    },
    { t: 'h', x: 'Git não é GitHub' },
    {
      t: 'table',
      mac: false,
      cols: ['Nome', 'O que é'],
      rows: [
        ['Git', 'A <b>ferramenta</b> de controle de versão que roda no seu computador, criada em 2005.'],
        ['GitHub', 'Um <b>serviço</b> que hospeda repositórios Git na nuvem e adiciona colaboração social — fundado em 2008.'],
        ['GitLab / Bitbucket', 'Outras plataformas de hospedagem Git, concorrentes do GitHub.'],
      ],
    },
    { t: 'h', x: 'Centralizado x distribuído' },
    {
      t: 'ul',
      items: [
        'Sistemas antigos como CVS e Subversion eram <b>centralizados</b>: existia um servidor único, e sem ele ninguém trabalhava.',
        'O Git é <b>distribuído</b>: cada cópia local (cada <code>clone</code>) carrega o histórico completo do projeto.',
        'Isso significa trabalhar offline, sem depender da internet, e não ter um único ponto de falha.',
      ],
    },
  ],
  quiz: [
    {
      q: 'Por que Linus Torvalds criou o Git do zero, em 2005?',
      options: [
        'Por diversão, sem motivo real',
        'Porque a licença gratuita do BitKeeper foi revogada e não havia alternativa livre à altura',
        'Porque o GitHub pediu para ele criar',
        'Para substituir o Linux',
      ],
      answer: 1,
      explain: 'Sem o BitKeeper gratuito, a equipe do kernel Linux precisava urgentemente de um sistema próprio.',
    },
    {
      q: 'Qual é a diferença entre Git e GitHub?',
      options: [
        'São a mesma coisa, com nomes diferentes',
        'Git é a ferramenta de controle de versão; GitHub é o serviço que hospeda repositórios na nuvem',
        'GitHub é mais antigo que o Git',
        'Git só funciona dentro do GitHub',
      ],
      answer: 1,
      explain: 'Git nasceu em 2005 como ferramenta; GitHub nasceu em 2008 como plataforma de hospedagem.',
    },
    {
      q: 'O que significa um sistema de controle de versão "distribuído"?',
      options: [
        'Só existe uma cópia do histórico, no servidor',
        'Cada cópia local tem o histórico completo, sem depender de um servidor central',
        'Os arquivos ficam espalhados em vários serviços diferentes',
        'É um sistema que só funciona conectado à internet',
      ],
      answer: 1,
      explain: 'No modelo distribuído, cada `git clone` carrega o histórico inteiro do projeto.',
    },
  ],
};
