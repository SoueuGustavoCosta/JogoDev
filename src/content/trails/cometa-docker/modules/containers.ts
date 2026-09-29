import type { Module } from '@/domain/trail/types';

/** Trilha 1 do Cometa Docker: o que é um container e por que existe. */
export const modDockerContainers: Module = {
  id: 'docker-containers',
  short: 'O que é um container',
  title: 'O que é um container e por que ele existe',
  lead: '"Na minha máquina funciona." O container resolve essa frase: ele leva o programa junto com tudo que ele precisa para rodar.',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, um cometa passou pela linha do tempo, e ele carrega containers! Aproveite enquanto ele está no céu.' },
    { t: 'h', x: 'O problema' },
    {
      t: 'p',
      x: 'Um sistema precisa de uma versão certa da linguagem, de bibliotecas, de configurações. No seu computador está tudo certo; no do colega falta uma peça, e nada roda.',
    },
    { t: 'h', x: 'A solução: imagem e container' },
    {
      t: 'cards',
      items: [
        { h: 'Imagem', x: 'Um pacote pronto e somente leitura: o programa, as bibliotecas e as configurações. É a "receita" congelada.' },
        { h: 'Container', x: 'Uma imagem rodando. Um processo isolado, com o próprio sistema de arquivos. Dá para ter vários containers da mesma imagem.' },
        { h: 'Docker', x: 'A ferramenta que cria imagens, roda containers e os compartilha.' },
      ],
    },
    { t: 'h', x: 'Container não é máquina virtual' },
    {
      t: 'table',
      cols: ['', 'Máquina virtual', 'Container'],
      rows: [
        ['O que carrega', 'Um sistema operacional inteiro', 'Só o programa e o que ele precisa'],
        ['Tamanho', 'Gigabytes', 'Megabytes'],
        ['Para ligar', 'Minutos', 'Segundos'],
        ['Isolamento', 'Um sistema completo separado', 'Processos isolados que dividem o núcleo (kernel) do sistema'],
      ],
      mac: false,
    },
    { t: 'h', x: 'Conferindo a instalação' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'docker version' },
    { t: 'p', x: 'No Windows e no macOS, o jeito mais simples é instalar o <b>Docker Desktop</b>. No Linux, o <b>Docker Engine</b>.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Docker: <a href="https://docs.docker.com/get-started/docker-overview/" target="_blank" rel="noopener">What is Docker?</a> e <a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/" target="_blank" rel="noopener">What is a container?</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual a diferença entre imagem e container?',
      options: [
        'São a mesma coisa',
        'A imagem é o pacote pronto; o container é a imagem rodando',
        'O container é o pacote; a imagem é o programa rodando',
        'A imagem só existe no Windows',
      ],
      answer: 1,
      explain: 'Imagem é a receita congelada; container é essa receita em execução.',
    },
    {
      id: 'q2',
      q: 'Por que um container liga mais rápido que uma máquina virtual?',
      options: [
        'Porque ele não carrega um sistema operacional inteiro',
        'Porque roda na nuvem',
        'Porque não tem arquivos',
        'Porque usa menos internet',
      ],
      answer: 0,
      explain: 'O container divide o núcleo do sistema com a máquina e leva só o que o programa precisa.',
    },
    {
      id: 'q3',
      q: 'Qual frase o Docker ajuda a acabar?',
      options: ['"Na minha máquina funciona"', '"O código compilou"', '"Faltou internet"', '"Esqueci a senha"'],
      answer: 0,
      explain: 'O container leva o ambiente junto: se roda num lugar, roda no outro.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a frase na ordem certa.',
      pieces: ['Uma imagem', 'rodando', 'vira', 'um container'],
      distractors: ['uma máquina virtual', 'um volume'],
      explain: 'Container = imagem em execução.',
    },
  ],
};
