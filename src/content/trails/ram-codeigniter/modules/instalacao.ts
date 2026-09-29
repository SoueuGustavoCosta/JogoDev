import type { Module } from '@/domain/trail/types';

/** Trilha 1 da Ramificação CodeIgniter: instalação e estrutura MVC. */
export const modCiInstalacao: Module = {
  id: 'ci-instalacao',
  short: 'Instalação e MVC',
  title: 'Instalação e a estrutura MVC',
  lead: 'CodeIgniter é um framework PHP pequeno e rápido. Ele organiza o projeto em MVC: Model (dados), View (tela) e Controller (quem decide).',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, a terceira Ramificação da Lua de PHP é leve como uma faísca. O CodeIgniter é direto ao ponto: pouca configuração e muita velocidade.' },
    { t: 'h', x: 'Instalando' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'composer create-project codeigniter4/appstarter projeto\ncd projeto\nphp spark serve' },
    { t: 'out', file: 'saida', x: 'CodeIgniter development server started on http://localhost:8080' },
    {
      t: 'note',
      k: 'Modo de desenvolvimento',
      x: 'Copie o arquivo <code>env</code> para <code>.env</code> e defina <code>CI_ENVIRONMENT = development</code>. Assim os erros aparecem detalhados enquanto você programa.',
    },
    { t: 'h', x: 'MVC: três papéis' },
    {
      t: 'flow',
      items: ['Pedido chega', 'Controller decide', 'Model busca os dados', 'View monta a página', 'Resposta'],
    },
    {
      t: 'cards',
      items: [
        { h: 'app/Controllers', x: 'Recebem o pedido e decidem o que fazer.' },
        { h: 'app/Models', x: 'Conversam com o banco de dados.' },
        { h: 'app/Views', x: 'Os arquivos da tela (HTML com um pouco de PHP).' },
        { h: 'app/Config/Routes.php', x: 'O mapa de rotas.' },
        { h: 'public/', x: 'A única pasta que o servidor deve mostrar ao mundo.' },
      ],
    },
    { t: 'p', x: 'O <code>php spark</code> é a linha de comando do CodeIgniter: sobe o servidor, cria arquivos e roda migrações.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Guia do CodeIgniter 4: <a href="https://codeigniter.com/user_guide/installation/installing_composer.html" target="_blank" rel="noopener">Composer Installation</a> e <a href="https://codeigniter.com/user_guide/concepts/mvc.html" target="_blank" rel="noopener">Models, Views, and Controllers</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual comando sobe o servidor de desenvolvimento do CodeIgniter?',
      options: ['php artisan serve', 'php spark serve', 'php bin/console serve', 'php -S spark'],
      answer: 1,
      explain: '<code>php spark serve</code>, na porta 8080.',
    },
    {
      id: 'q2',
      q: 'No MVC, quem conversa com o banco de dados?',
      options: ['A View', 'O Model', 'O Controller', 'O public/'],
      answer: 1,
      explain: 'O Model cuida dos dados; o Controller decide; a View mostra.',
    },
    {
      id: 'q3',
      q: 'Por que só a pasta public/ deve ficar visível para o servidor web?',
      options: [
        'Porque é a mais leve',
        'Para o código e as configurações do app não ficarem acessíveis pela internet',
        'Porque o PHP só lê essa pasta',
        'Não precisa, pode mostrar tudo',
      ],
      answer: 1,
      explain: 'O resto do projeto (inclusive o <code>.env</code>) fica fora do alcance de quem acessa o site.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o comando que cria o projeto.',
      pieces: ['composer', 'create-project', 'codeigniter4/appstarter', 'projeto'],
      distractors: ['spark', 'laravel/laravel', 'install'],
      explain: '<code>composer create-project codeigniter4/appstarter projeto</code>.',
    },
  ],
};
