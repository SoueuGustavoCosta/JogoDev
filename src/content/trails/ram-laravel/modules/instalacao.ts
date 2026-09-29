import type { Module } from '@/domain/trail/types';

/** Trilha 1 da Ramificação Laravel: instalação e estrutura. */
export const modLaravelInstalacao: Module = {
  id: 'laravel-instalacao',
  short: 'Instalação e estrutura',
  title: 'Instalação e estrutura de um projeto Laravel',
  lead: 'Laravel é um framework PHP completo: rotas, páginas, banco, validação e uma linha de comando que gera código por você, o Artisan.',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, a primeira Ramificação da Lua de PHP é o Laravel. Aqui o PHP ganhou organização de gente grande. Vamos criar um projeto.' },
    { t: 'h', x: 'Criando o projeto' },
    { t: 'p', x: 'Com o PHP e o <b>Composer</b> (o gerenciador de pacotes do PHP) instalados:' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'composer create-project laravel/laravel exemplo-app\ncd exemplo-app\nphp artisan serve' },
    { t: 'out', file: 'saida', x: 'INFO  Server running on [http://127.0.0.1:8000].' },
    {
      t: 'note',
      k: 'Instalador',
      x: 'Também existe o instalador do Laravel: <code>laravel new exemplo-app</code>. Ele faz perguntas (banco, testes, kit inicial) e cria o mesmo tipo de projeto.',
    },
    { t: 'h', x: 'Onde fica cada coisa' },
    {
      t: 'cards',
      items: [
        { h: 'routes/web.php', x: 'As rotas das páginas do site.' },
        { h: 'app/', x: 'O seu código: controllers (<code>app/Http/Controllers</code>) e models (<code>app/Models</code>).' },
        { h: 'resources/views', x: 'Os templates Blade (as páginas).' },
        { h: 'database/migrations', x: 'A história do banco: cada arquivo cria ou altera tabelas.' },
        { h: '.env', x: 'Configurações e segredos deste ambiente (banco, chave da aplicação). Nunca vai para o Git.' },
      ],
    },
    { t: 'h', x: 'O Artisan' },
    { t: 'p', x: 'O <code>php artisan</code> é a linha de comando do Laravel. Ele sobe o servidor, cria arquivos e roda o banco. Para ver tudo o que ele sabe fazer:' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'php artisan list' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Laravel: <a href="https://laravel.com/docs/installation" target="_blank" rel="noopener">Installation</a> e <a href="https://laravel.com/docs/structure" target="_blank" rel="noopener">Directory Structure</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual comando sobe o servidor de desenvolvimento do Laravel?',
      options: ['php artisan serve', 'php -S laravel', 'composer start', 'laravel run'],
      answer: 0,
      explain: '<code>php artisan serve</code> sobe em <code>http://127.0.0.1:8000</code>.',
    },
    {
      id: 'q2',
      q: 'Onde ficam as rotas das páginas do site?',
      options: ['app/Models', 'routes/web.php', 'resources/views', '.env'],
      answer: 1,
      explain: 'Rotas de páginas ficam em <code>routes/web.php</code>.',
    },
    {
      id: 'q3',
      q: 'Por que o arquivo .env nunca vai para o Git?',
      options: [
        'Porque é muito grande',
        'Porque guarda segredos e configurações do ambiente, como a senha do banco',
        'Porque o Git não aceita arquivos com ponto',
        'Porque ele é gerado a cada pedido',
      ],
      answer: 1,
      explain: 'Cada ambiente tem o seu <code>.env</code>, com os próprios segredos.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o comando que cria um projeto Laravel chamado exemplo-app.',
      pieces: ['composer', 'create-project', 'laravel/laravel', 'exemplo-app'],
      distractors: ['artisan', 'npm', 'install'],
      explain: '<code>composer create-project laravel/laravel exemplo-app</code>.',
    },
  ],
};
