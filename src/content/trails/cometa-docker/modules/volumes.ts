import type { Module } from '@/domain/trail/types';

/** Trilha 4 do Cometa Docker: volumes e portas. */
export const modDockerVolumes: Module = {
  id: 'docker-volumes',
  short: 'Volumes e portas',
  title: 'Volumes e portas',
  lead: 'Container apagado leva junto os arquivos que ele criou. Volumes guardam dados fora dele. E portas deixam o mundo falar com ele.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Os dados morrem com o container' },
    {
      t: 'p',
      x: 'Tudo que um container grava fica numa camada dele. Rodou <code>docker rm</code>, foi embora. Para um banco de dados, isso seria um desastre.',
    },
    { t: 'h', x: 'Volumes' },
    {
      t: 'code',
      file: 'terminal',
      lang: 'bash',
      nolab: true,
      x: 'docker volume create dados-db\n\ndocker run -d --name db \\\n  -e POSTGRES_PASSWORD=senha-de-teste \\\n  -v dados-db:/var/lib/postgresql/data \\\n  postgres',
    },
    { t: 'p', x: 'O <code>-v dados-db:/var/lib/postgresql/data</code> monta o volume dentro do container. Apague e recrie o container com o mesmo volume: os dados continuam lá.' },
    { t: 'h', x: 'Bind mount: uma pasta do seu computador' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'docker run -d -p 8080:80 -v "$(pwd)/site:/usr/share/nginx/html" nginx' },
    { t: 'p', x: 'Aqui a pasta <code>site</code> do seu computador aparece dentro do container. Mudou um arquivo? O nginx já serve a versão nova. Ótimo para desenvolver.' },
    {
      t: 'cards',
      items: [
        { h: 'Volume', x: 'O Docker guarda e gerencia. Melhor para dados de programas (bancos).' },
        { h: 'Bind mount', x: 'Uma pasta sua, escolhida por você. Melhor para editar código.' },
        { h: '-p host:container', x: 'Publica uma porta do container numa porta do seu computador.' },
      ],
    },
    {
      t: 'note',
      k: 'Senhas',
      x: 'A senha no <code>-e</code> é só para testar no seu computador. Em produção, senha não fica escrita no comando nem no repositório.',
      warn: true,
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Docker: <a href="https://docs.docker.com/engine/storage/volumes/" target="_blank" rel="noopener">Volumes</a>, <a href="https://docs.docker.com/engine/storage/bind-mounts/" target="_blank" rel="noopener">Bind mounts</a> e <a href="https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/" target="_blank" rel="noopener">Publishing and exposing ports</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que acontece com os arquivos gravados dentro de um container quando ele é removido (sem volume)?',
      options: ['Vão para a lixeira', 'São perdidos', 'Vão para o Docker Hub', 'Ficam na imagem'],
      answer: 1,
      explain: 'A camada do container vai embora com ele. Por isso existem volumes.',
    },
    {
      id: 'q2',
      q: 'Qual é melhor para guardar os dados de um banco?',
      options: ['Um volume', 'A camada do container', 'Uma variável -e', 'A imagem'],
      answer: 0,
      explain: 'Volumes são gerenciados pelo Docker e sobrevivem ao container.',
    },
    {
      id: 'q3',
      q: 'Complete para montar o volume dados-db na pasta de dados do Postgres:',
      fill: true,
      pre: 'docker run',
      post: ' dados-db:/var/lib/postgresql/data postgres',
      accept: ['-v'],
      wrong: ['-p', '-d', '-e'],
      placeholder: '?',
      explain: '-v monta volumes (e pastas); -p publica portas.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: rode o nginx na porta 8080 servindo a sua pasta site.',
      pieces: ['docker run -d', '-p 8080:80', '-v "$(pwd)/site:/usr/share/nginx/html"', 'nginx'],
      distractors: ['-p 80:8080', 'docker volume rm', '-e site'],
      explain: 'Porta com -p e pasta com -v.',
    },
  ],
};
