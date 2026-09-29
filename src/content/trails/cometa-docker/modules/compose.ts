import type { Module } from '@/domain/trail/types';

/** Trilha 5 do Cometa Docker: Docker Compose. */
export const modDockerCompose: Module = {
  id: 'docker-compose',
  short: 'Docker Compose',
  title: 'Docker Compose: vários containers juntos',
  lead: 'Um app de verdade tem site, banco, cache... O Compose descreve todos num arquivo só e liga tudo com um comando.',
  level: 'Intermediário',
  blocks: [
    {
      t: 'code',
      file: 'compose.yaml',
      lang: 'yaml',
      nolab: true,
      x: 'services:\n  web:\n    build: .\n    ports:\n      - "3000:3000"\n    depends_on:\n      - db\n  db:\n    image: postgres\n    environment:\n      POSTGRES_PASSWORD: senha-de-teste\n    volumes:\n      - dados-db:/var/lib/postgresql/data\n\nvolumes:\n  dados-db:',
    },
    {
      t: 'cards',
      items: [
        { h: 'services', x: 'Cada serviço é um container: aqui, <code>web</code> e <code>db</code>.' },
        { h: 'build / image', x: '<code>build: .</code> usa o seu Dockerfile; <code>image</code> usa uma imagem pronta.' },
        { h: 'depends_on', x: 'Liga o <code>db</code> antes do <code>web</code>.' },
        { h: 'Rede de graça', x: 'Os serviços se enxergam pelo nome: o <code>web</code> acessa o banco em <code>db:5432</code>.' },
      ],
    },
    { t: 'h', x: 'Os comandos' },
    {
      t: 'code',
      file: 'terminal',
      lang: 'bash',
      nolab: true,
      x: 'docker compose up -d     # liga tudo em segundo plano\ndocker compose ps        # o que está rodando\ndocker compose logs -f   # acompanha os logs\ndocker compose down      # para e remove os containers',
    },
    {
      t: 'note',
      k: 'down não apaga o volume',
      x: 'O <code>docker compose down</code> remove os containers e a rede, mas mantém os volumes. Para apagar os volumes também, é preciso pedir: <code>docker compose down -v</code>.',
      warn: true,
    },
    { t: 'say', x: 'Última trilha do cometa! O Capitão Porto Fechado está bloqueando tudo: portas trancadas, dados perdidos. Vença ele antes do cometa sumir!' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Docker: <a href="https://docs.docker.com/compose/" target="_blank" rel="noopener">Docker Compose</a> e <a href="https://docs.docker.com/compose/gettingstarted/" target="_blank" rel="noopener">Compose Quickstart</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'No compose.yaml, como o serviço web acessa o banco do serviço db?',
      options: ['Pelo IP do seu computador', 'Pelo nome do serviço: db', 'Não acessa', 'Só pela internet'],
      answer: 1,
      explain: 'O Compose cria uma rede onde cada serviço atende pelo próprio nome.',
    },
    {
      id: 'q2',
      q: 'Qual comando liga todos os serviços em segundo plano?',
      options: ['docker compose up -d', 'docker run compose', 'docker compose start-all', 'docker up'],
      answer: 0,
      explain: 'docker compose up -d.',
    },
    {
      id: 'q3',
      q: 'O docker compose down apaga os volumes?',
      options: ['Sim, sempre', 'Não: só com down -v', 'Só no Windows', 'Só se o banco estiver vazio'],
      answer: 1,
      explain: 'Volumes sobrevivem ao down, a não ser que você peça -v.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o começo do compose.yaml com o serviço db usando a imagem postgres.',
      pieces: ['services:', 'db:', 'image: postgres'],
      distractors: ['containers:', 'FROM postgres', 'docker run'],
      explain: 'services → nome do serviço → image.',
    },
  ],
};
