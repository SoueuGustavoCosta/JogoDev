import type { Module } from '@/domain/trail/types';

/** Trilha 1 da Ramificação Django: o que é o Django e como criar o primeiro projeto. */
export const modDjangoProjeto: Module = {
  id: 'django-projeto',
  short: 'Primeiro projeto',
  title: 'O que é o Django e como nasce um projeto',
  lead: 'Django é um framework web em Python que já vem com quase tudo pronto: rotas, páginas, banco de dados e painel de administração.',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, você acabou de atravessar o primeiro portal. Aqui a linha do tempo virou um site inteiro feito em Python. Vamos começar pelo começo: instalar e criar o projeto.' },
    { t: 'h', x: 'Framework: uma caixa de ferramentas com regras' },
    {
      t: 'p',
      x: 'Um <b>framework</b> é um conjunto de código pronto que resolve as partes repetidas de um sistema. No Django, você não escreve do zero como receber um pedido do navegador ou como falar com o banco: você preenche os espaços que o framework deixa para você.',
    },
    { t: 'h', x: 'Instalando' },
    { t: 'p', x: 'O Django é um pacote Python. Ele se instala com o <code>pip</code>, de preferência dentro de um ambiente virtual:' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'python -m pip install Django\npython -m django --version' },
    { t: 'h', x: 'Criando o projeto' },
    { t: 'p', x: 'O comando <code>django-admin startproject</code> cria a pasta do projeto com os arquivos de configuração:' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'django-admin startproject meusite' },
    {
      t: 'code',
      file: 'estrutura',
      lang: 'text',
      nolab: true,
      x: 'meusite/\n    manage.py\n    meusite/\n        __init__.py\n        settings.py\n        urls.py\n        asgi.py\n        wsgi.py',
    },
    {
      t: 'cards',
      items: [
        { h: 'manage.py', x: 'O "controle remoto" do projeto: roda o servidor, cria apps, aplica migrações.' },
        { h: 'settings.py', x: 'As configurações: apps instalados, banco de dados, idioma, fuso horário.' },
        { h: 'urls.py', x: 'O mapa de endereços: qual URL chama qual código.' },
        { h: 'asgi.py e wsgi.py', x: 'A porta de entrada para servidores web de produção.' },
      ],
    },
    { t: 'h', x: 'Ligando o servidor de desenvolvimento' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'cd meusite\npython manage.py runserver' },
    { t: 'out', file: 'saida', x: 'Starting development server at http://127.0.0.1:8000/\nQuit the server with CONTROL-C.' },
    {
      t: 'note',
      k: 'Só para testar',
      x: 'O <code>runserver</code> é feito para o seu computador, enquanto você programa. A própria documentação avisa: não use ele em produção.',
      warn: true,
    },
    { t: 'say', x: 'Abriu no navegador e apareceu o foguetinho do Django? Então o portal está estável. Próxima parada: apps, URLs e views.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Django: <a href="https://docs.djangoproject.com/en/stable/intro/tutorial01/" target="_blank" rel="noopener">Tutorial, parte 1</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual comando cria um projeto Django novo chamado meusite?',
      options: ['django-admin startproject meusite', 'python manage.py startapp meusite', 'pip install meusite', 'django new meusite'],
      answer: 0,
      explain: '<code>django-admin startproject</code> cria o projeto. <code>startapp</code> cria um app <b>dentro</b> de um projeto que já existe.',
    },
    {
      id: 'q2',
      q: 'Em qual arquivo ficam as configurações do projeto, como os apps instalados e o banco de dados?',
      options: ['manage.py', 'urls.py', 'settings.py', 'wsgi.py'],
      answer: 2,
      explain: 'O <code>settings.py</code> guarda as configurações. O <code>urls.py</code> é o mapa de endereços.',
    },
    {
      id: 'q3',
      q: 'Por que o runserver não deve ser usado para colocar o site no ar de verdade?',
      options: [
        'Porque ele só funciona sem internet',
        'Porque é um servidor feito para desenvolvimento, não para produção',
        'Porque ele apaga o banco a cada reinício',
        'Porque ele só aceita páginas em inglês',
      ],
      answer: 1,
      explain: 'O servidor de desenvolvimento é leve e prático, mas não foi feito para aguentar tráfego nem para segurança de produção.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o comando que liga o servidor de desenvolvimento.',
      pieces: ['python', 'manage.py', 'runserver'],
      distractors: ['startproject', 'django-admin', 'migrate'],
      explain: '<code>python manage.py runserver</code> sobe o servidor em <code>http://127.0.0.1:8000/</code>.',
    },
  ],
};
