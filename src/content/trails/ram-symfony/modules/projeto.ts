import type { Module } from '@/domain/trail/types';

/** Trilha 1 da Ramificação Symfony: criar o projeto. */
export const modSymfonyProjeto: Module = {
  id: 'symfony-projeto',
  short: 'Criar o projeto',
  title: 'Criando um projeto Symfony',
  lead: 'Symfony é um framework PHP feito de componentes reutilizáveis. Você começa com um esqueleto pequeno e instala só o que precisar.',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, a segunda Ramificação da Lua de PHP é o Symfony. Aqui cada peça é um componente, e tudo se encaixa como numa orquestra.' },
    { t: 'h', x: 'Criando' },
    { t: 'p', x: 'Com a <b>Symfony CLI</b> instalada, um comando cria um projeto pronto para aplicações web:' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'symfony new meu_projeto --webapp\ncd meu_projeto\nsymfony server:start' },
    {
      t: 'p',
      x: 'Sem a CLI, com o Composer: <code>composer create-project symfony/skeleton meu_projeto</code> e depois <code>composer require webapp</code>, que instala os pacotes comuns de um site (Twig, Doctrine, formulários...).',
    },
    { t: 'h', x: 'Onde fica cada coisa' },
    {
      t: 'cards',
      items: [
        { h: 'src/Controller', x: 'Os controllers: o código que responde aos pedidos.' },
        { h: 'templates/', x: 'Os templates Twig.' },
        { h: 'config/', x: 'A configuração dos pacotes e das rotas.' },
        { h: 'public/index.php', x: 'A única porta de entrada: todo pedido passa por aqui.' },
        { h: 'bin/console', x: 'A linha de comando do Symfony.' },
      ],
    },
    { t: 'h', x: 'O bin/console' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'php bin/console list' },
    {
      t: 'note',
      k: 'Flex e recipes',
      x: 'Ao instalar um pacote com o Composer, o <b>Symfony Flex</b> aplica uma "receita" (recipe): cria os arquivos de configuração daquele pacote para você.',
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Symfony: <a href="https://symfony.com/doc/current/setup.html" target="_blank" rel="noopener">Installing &amp; Setting up the Symfony Framework</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual comando da Symfony CLI cria um projeto já preparado para sites?',
      options: ['symfony new meu_projeto --webapp', 'php artisan new', 'symfony create site', 'composer new symfony'],
      answer: 0,
      explain: '<code>--webapp</code> já instala os pacotes de uma aplicação web.',
    },
    {
      id: 'q2',
      q: 'Onde ficam os controllers num projeto Symfony?',
      options: ['app/Http/Controllers', 'src/Controller', 'controllers/', 'public/'],
      answer: 1,
      explain: 'Em <code>src/Controller</code>, no namespace <code>App\\Controller</code>.',
    },
    {
      id: 'q3',
      q: 'O que o Symfony Flex faz quando você instala um pacote?',
      options: ['Apaga os outros pacotes', 'Aplica uma receita que cria a configuração do pacote', 'Compila o PHP', 'Publica o site'],
      answer: 1,
      explain: 'As recipes criam arquivos de configuração automaticamente.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o comando que lista tudo o que o console sabe fazer.',
      pieces: ['php', 'bin/console', 'list'],
      distractors: ['artisan', 'spark', 'help me'],
      explain: '<code>php bin/console list</code> mostra todos os comandos.',
    },
  ],
};
