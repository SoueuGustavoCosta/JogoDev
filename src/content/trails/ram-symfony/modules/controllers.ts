import type { Module } from '@/domain/trail/types';

/** Trilha 2 da Ramificação Symfony: rotas e controllers. */
export const modSymfonyControllers: Module = {
  id: 'symfony-controllers',
  short: 'Rotas e controllers',
  title: 'Rotas e controllers',
  lead: 'No Symfony, a rota mora em cima do método, num atributo #[Route]. O método recebe o pedido e devolve um objeto Response.',
  level: 'Base',
  blocks: [
    {
      t: 'code',
      file: 'src/Controller/SorteController.php',
      lang: 'php',
      nolab: true,
      x: "<?php\n\nnamespace App\\Controller;\n\nuse Symfony\\Bundle\\FrameworkBundle\\Controller\\AbstractController;\nuse Symfony\\Component\\HttpFoundation\\Response;\nuse Symfony\\Component\\Routing\\Attribute\\Route;\n\nclass SorteController extends AbstractController\n{\n    #[Route('/sorte/numero', name: 'sorte_numero')]\n    public function numero(): Response\n    {\n        $numero = random_int(0, 100);\n\n        return new Response('Seu número da sorte: ' . $numero);\n    }\n}",
    },
    {
      t: 'cards',
      items: [
        { h: "#[Route('/sorte/numero')]", x: 'Um atributo do PHP: liga o caminho ao método logo abaixo.' },
        { h: "name: 'sorte_numero'", x: 'O nome da rota, para montar links sem escrever a URL.' },
        { h: 'Response', x: 'Todo controller devolve uma resposta: texto, HTML, JSON ou redirecionamento.' },
      ],
    },
    { t: 'h', x: 'Parâmetros e JSON' },
    {
      t: 'code',
      file: 'src/Controller/BlogController.php',
      lang: 'php',
      nolab: true,
      x: "#[Route('/blog/{slug}', name: 'blog_mostrar')]\npublic function mostrar(string $slug): Response\n{\n    return $this->json(['post' => $slug]);\n}",
    },
    { t: 'p', x: '<code>$this->json(...)</code> vem do <code>AbstractController</code> e devolve uma resposta JSON pronta.' },
    { t: 'p', x: 'Para ver todas as rotas: <code>php bin/console debug:router</code>.' },
    { t: 'say', x: 'Rota em cima do método: é só abrir o controller para saber qual endereço chama o quê.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Symfony: <a href="https://symfony.com/doc/current/page_creation.html" target="_blank" rel="noopener">Create your First Page in Symfony</a>, <a href="https://symfony.com/doc/current/routing.html" target="_blank" rel="noopener">Routing</a> e <a href="https://symfony.com/doc/current/controller.html" target="_blank" rel="noopener">Controller</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Como se define a rota de um método de controller no Symfony?',
      options: ["Route::get('/x', ...)", "Com o atributo #[Route('/x')] em cima do método", "@GetMapping('/x')", "$routes->get('/x')"],
      answer: 1,
      explain: 'O atributo <code>#[Route]</code> fica logo acima do método.',
    },
    {
      id: 'q2',
      q: 'O que todo método de controller do Symfony devolve?',
      options: ['Um array', 'Um objeto Response', 'Uma string sempre', 'Nada'],
      answer: 1,
      explain: 'Sempre uma <code>Response</code> (ou algo que a gera, como <code>$this->json()</code>).',
    },
    {
      id: 'q3',
      q: 'Complete para devolver JSON a partir do AbstractController:',
      fill: true,
      pre: 'return $this->',
      post: "(['post' => $slug]);",
      accept: ['json'],
      wrong: ['render', 'Response', 'send'],
      placeholder: '?',
      explain: '<code>$this->json([...])</code> monta a resposta JSON.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o atributo de rota com nome.',
      pieces: ['#[Route(', "'/blog/{slug}'", ',', "name: 'blog_mostrar'", ')]'],
      distractors: ['@Route(', "path = '/blog'", 'Route::get('],
      explain: "<code>#[Route('/blog/{slug}', name: 'blog_mostrar')]</code>.",
    },
  ],
};
