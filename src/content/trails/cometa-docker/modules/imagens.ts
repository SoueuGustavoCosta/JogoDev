import type { Module } from '@/domain/trail/types';

/** Trilha 2 do Cometa Docker: imagens e o primeiro docker run. */
export const modDockerImagens: Module = {
  id: 'docker-imagens',
  short: 'Imagens e docker run',
  title: 'Imagens e o primeiro docker run',
  lead: 'Com um comando você baixa uma imagem pronta e liga um container. Depois, lista, para e remove.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'O primeiro container' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'docker run hello-world' },
    {
      t: 'p',
      x: 'Se a imagem <code>hello-world</code> não estiver no seu computador, o Docker baixa do <b>Docker Hub</b> (o registro público de imagens), cria o container e roda. Ele imprime uma mensagem e termina.',
    },
    { t: 'h', x: 'Um servidor de verdade' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'docker run -d -p 8080:80 --name web nginx' },
    {
      t: 'cards',
      items: [
        { h: '-d', x: '"Destacado": roda em segundo plano e devolve o terminal.' },
        { h: '-p 8080:80', x: 'Liga a porta 8080 do seu computador à porta 80 do container.' },
        { h: '--name web', x: 'Dá um nome ao container, para você não decorar o id.' },
        { h: 'nginx', x: 'A imagem: um servidor web. Abra <code>http://localhost:8080</code>.' },
      ],
    },
    { t: 'h', x: 'Cuidando dos containers' },
    {
      t: 'code',
      file: 'terminal',
      lang: 'bash',
      nolab: true,
      x: 'docker ps          # containers rodando\ndocker ps -a       # todos, inclusive os parados\ndocker stop web    # para\ndocker rm web      # remove\ndocker images      # imagens baixadas\ndocker pull nginx  # só baixa a imagem',
    },
    { t: 'say', x: 'Parar não é apagar: um container parado ainda existe (docker ps -a mostra). Para apagar, docker rm.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Docker: <a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/" target="_blank" rel="noopener">What is an image?</a> e <a href="https://docs.docker.com/reference/cli/docker/container/run/" target="_blank" rel="noopener">docker container run</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que faz o -d em docker run -d nginx?',
      options: ['Apaga o container no fim', 'Roda em segundo plano', 'Baixa a imagem de novo', 'Dá um nome'],
      answer: 1,
      explain: '-d = detached: o container segue rodando e o terminal fica livre.',
    },
    {
      id: 'q2',
      q: 'Em -p 8080:80, qual número é a porta do seu computador?',
      options: ['8080', '80', 'Os dois', 'Nenhum'],
      answer: 0,
      explain: 'O formato é porta-do-computador:porta-do-container.',
    },
    {
      id: 'q3',
      q: 'Qual comando lista também os containers parados?',
      options: ['docker ps', 'docker ps -a', 'docker images', 'docker list'],
      answer: 1,
      explain: 'Sem -a, o docker ps mostra só os que estão rodando.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: rode o nginx em segundo plano, na porta 8080 do seu computador.',
      pieces: ['docker run', '-d', '-p 8080:80', 'nginx'],
      distractors: ['-p 80:8080', 'docker start', '--rm-all'],
      explain: 'docker run -d -p 8080:80 nginx.',
    },
  ],
};
