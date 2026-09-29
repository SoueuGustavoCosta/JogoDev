import type { Module } from '@/domain/trail/types';

/** Trilha 3 do Cometa Docker: escrevendo um Dockerfile. */
export const modDockerDockerfile: Module = {
  id: 'docker-dockerfile',
  short: 'Dockerfile',
  title: 'Escrevendo um Dockerfile',
  lead: 'O Dockerfile é a receita da sua própria imagem: de qual imagem partir, o que copiar, o que instalar e como ligar.',
  level: 'Intermediário',
  blocks: [
    {
      t: 'code',
      file: 'Dockerfile',
      lang: 'dockerfile',
      nolab: true,
      x: 'FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["node", "src/index.js"]',
    },
    {
      t: 'table',
      cols: ['Instrução', 'O que faz'],
      rows: [
        ['FROM', 'A imagem de partida (aqui, Node.js numa versão pequena).'],
        ['WORKDIR', 'A pasta de trabalho dentro da imagem.'],
        ['COPY', 'Copia arquivos do seu projeto para a imagem.'],
        ['RUN', 'Roda um comando na hora de construir (instalar dependências).'],
        ['EXPOSE', 'Documenta a porta que o programa usa.'],
        ['CMD', 'O comando que roda quando o container liga.'],
      ],
      mac: false,
    },
    { t: 'h', x: 'Construindo e rodando' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'docker build -t meu-app .\ndocker run -d -p 3000:3000 meu-app' },
    { t: 'p', x: 'O <code>-t meu-app</code> dá nome à imagem, e o <code>.</code> diz onde está o Dockerfile (a pasta atual).' },
    { t: 'h', x: 'Por que copiar o package.json primeiro?' },
    {
      t: 'p',
      x: 'Cada instrução vira uma <b>camada</b>, e o Docker reaproveita (cache) as camadas que não mudaram. Copiando só o <code>package.json</code> antes do <code>npm install</code>, mudar o código não obriga a reinstalar tudo.',
    },
    {
      t: 'note',
      k: '.dockerignore',
      x: 'Um arquivo <code>.dockerignore</code> (como o <code>.gitignore</code>) deixa de fora do COPY o que não deve ir para a imagem, como <code>node_modules</code> e arquivos com senhas.',
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Docker: <a href="https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/" target="_blank" rel="noopener">Writing a Dockerfile</a> e <a href="https://docs.docker.com/reference/dockerfile/" target="_blank" rel="noopener">Dockerfile reference</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual instrução define a imagem de partida?',
      options: ['RUN', 'FROM', 'CMD', 'COPY'],
      answer: 1,
      explain: 'Todo Dockerfile começa com FROM.',
    },
    {
      id: 'q2',
      q: 'Qual a diferença entre RUN e CMD?',
      options: [
        'Nenhuma',
        'RUN roda na construção da imagem; CMD roda quando o container liga',
        'CMD roda na construção; RUN quando liga',
        'RUN só funciona no Linux',
      ],
      answer: 1,
      explain: 'RUN prepara a imagem (instalar); CMD é o programa do container.',
    },
    {
      id: 'q3',
      q: 'Complete para construir a imagem com o nome meu-app, usando o Dockerfile da pasta atual:',
      fill: true,
      pre: 'docker build -t meu-app',
      post: '',
      accept: ['.'],
      wrong: ['Dockerfile', '-f', '/'],
      placeholder: '?',
      explain: 'O ponto é o "contexto": a pasta atual.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: coloque as instruções do Dockerfile na ordem certa.',
      pieces: ['FROM node:22-alpine', 'WORKDIR /app', 'COPY . .', 'CMD ["node", "src/index.js"]'],
      distractors: ['RUN docker run', 'START node'],
      explain: 'Partida, pasta, arquivos e, por último, o comando de ligar.',
    },
  ],
};
