import type { Module } from '@/domain/trail/types';

/** Trilha 2 da Ramificação CodeIgniter: rotas e controllers. */
export const modCiRotas: Module = {
  id: 'ci-rotas',
  short: 'Rotas e controllers',
  title: 'Rotas e controllers',
  lead: 'As rotas ficam num arquivo só, o Routes.php. Cada uma aponta para "Controller::método".',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'O mapa de rotas' },
    {
      t: 'code',
      file: 'app/Config/Routes.php',
      lang: 'php',
      nolab: true,
      x: "<?php\n\nuse CodeIgniter\\Router\\RouteCollection;\n\n/** @var RouteCollection $routes */\n$routes->get('/', 'Home::index');\n$routes->get('noticias', 'Noticias::index');\n$routes->get('noticias/(:segment)', 'Noticias::mostrar/$1');",
    },
    {
      t: 'table',
      cols: ['Coringa', 'Aceita'],
      rows: [
        ['(:num)', 'só números'],
        ['(:segment)', 'qualquer coisa sem barra'],
        ['(:any)', 'qualquer coisa, até com barras'],
      ],
      mac: false,
    },
    { t: 'p', x: 'O <code>$1</code> passa o primeiro coringa como argumento do método.' },
    { t: 'h', x: 'O controller' },
    {
      t: 'code',
      file: 'app/Controllers/Noticias.php',
      lang: 'php',
      nolab: true,
      x: "<?php\n\nnamespace App\\Controllers;\n\nclass Noticias extends BaseController\n{\n    public function index()\n    {\n        return 'Todas as notícias';\n    }\n\n    public function mostrar(string $slug)\n    {\n        return 'Notícia: ' . esc($slug);\n    }\n}",
    },
    {
      t: 'note',
      k: 'esc()',
      x: 'A função <code>esc()</code> escapa o texto antes de mostrar. Tudo que vem do usuário (como o slug da URL) deve passar por ela.',
      warn: true,
    },
    { t: 'p', x: 'Para ver todas as rotas: <code>php spark routes</code>.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Guia do CodeIgniter 4: <a href="https://codeigniter.com/user_guide/incoming/routing.html" target="_blank" rel="noopener">URI Routing</a> e <a href="https://codeigniter.com/user_guide/incoming/controllers.html" target="_blank" rel="noopener">Controllers</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: "Na rota $routes->get('noticias/(:segment)', 'Noticias::mostrar/$1'), o que é o $1?",
      options: ['O preço', 'O primeiro coringa, passado ao método', 'Uma variável de ambiente', 'O número da linha'],
      answer: 1,
      explain: 'O que casou com <code>(:segment)</code> vira o argumento do método.',
    },
    {
      id: 'q2',
      q: 'Qual coringa aceita só números?',
      options: ['(:any)', '(:segment)', '(:num)', '(:int)'],
      answer: 2,
      explain: '<code>(:num)</code> casa só com dígitos.',
    },
    {
      id: 'q3',
      q: 'Complete para mostrar o slug com segurança:',
      fill: true,
      pre: "return 'Notícia: ' .",
      post: '($slug);',
      accept: ['esc'],
      wrong: ['echo', 'print', 'raw'],
      placeholder: '?',
      explain: '<code>esc()</code> escapa o texto.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a rota GET da lista de notícias.',
      pieces: ['$routes->get(', "'noticias'", ',', "'Noticias::index'", ');'],
      distractors: ['Route::get(', "'Noticias@index'", '$routes->post('],
      explain: "No CodeIgniter, o destino é <code>'Controller::método'</code>.",
    },
  ],
};
