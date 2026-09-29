import type { Module } from '@/domain/trail/types';

/** Trilha 3 da Ramificação Symfony: templates com Twig. */
export const modSymfonyTwig: Module = {
  id: 'symfony-twig',
  short: 'Templates Twig',
  title: 'Templates com Twig',
  lead: 'O Twig é a linguagem de templates do Symfony: HTML com espaços para preencher, laços e herança de layout.',
  level: 'Base',
  blocks: [
    {
      t: 'code',
      file: 'src/Controller/SorteController.php',
      lang: 'php',
      nolab: true,
      x: "#[Route('/sorte/numero')]\npublic function numero(): Response\n{\n    return $this->render('sorte/numero.html.twig', [\n        'numero' => random_int(0, 100),\n    ]);\n}",
    },
    {
      t: 'code',
      file: 'templates/sorte/numero.html.twig',
      lang: 'html',
      nolab: true,
      x: "{% extends 'base.html.twig' %}\n\n{% block body %}\n    <h1>Seu número da sorte: {{ numero }}</h1>\n{% endblock %}",
    },
    {
      t: 'cards',
      items: [
        { h: '{{ ... }}', x: 'Mostra um valor, com o HTML escapado.' },
        { h: '{% ... %}', x: 'Faz algo: <code>if</code>, <code>for</code>, <code>extends</code>, <code>block</code>.' },
        { h: '{# ... #}', x: 'Comentário: não aparece na página.' },
      ],
    },
    { t: 'h', x: 'Laços' },
    {
      t: 'code',
      file: 'templates/blog/lista.html.twig',
      lang: 'html',
      nolab: true,
      x: "<ul>\n{% for post in posts %}\n    <li>{{ post.titulo }}</li>\n{% else %}\n    <li>Nenhum post ainda.</li>\n{% endfor %}\n</ul>",
    },
    { t: 'p', x: 'O <code>{% else %}</code> dentro do <code>for</code> aparece quando a lista está vazia. E <code>post.titulo</code> funciona tanto para arrays quanto para objetos.' },
    { t: 'say', x: 'Se você fez as Ramificações de Python, reconheceu a família: Django, Jinja e Twig são primos.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Symfony: <a href="https://symfony.com/doc/current/templates.html" target="_blank" rel="noopener">Creating and Using Templates</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual método do controller junta um template Twig com os dados?',
      options: ['$this->json()', '$this->render()', 'view()', 'new Twig()'],
      answer: 1,
      explain: "<code>$this->render('caminho.html.twig', [...])</code>.",
    },
    {
      id: 'q2',
      q: 'No Twig, para que serve {# ... #}?',
      options: ['Mostrar um valor', 'Fazer um laço', 'Comentário que não aparece', 'Importar CSS'],
      answer: 2,
      explain: 'É comentário.',
    },
    {
      id: 'q3',
      q: 'Complete a primeira linha para herdar o layout base:',
      fill: true,
      pre: '{%',
      post: "'base.html.twig' %}",
      accept: ['extends'],
      wrong: ['include', 'import', 'block'],
      placeholder: '?',
      explain: "<code>{% extends 'base.html.twig' %}</code> e depois os <code>block</code>.",
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha que repete cada post.',
      pieces: ['{%', 'for', 'post', 'in', 'posts', '%}'],
      distractors: ['{{', 'foreach', 'as'],
      explain: '<code>{% for post in posts %}</code>, fechando com <code>{% endfor %}</code>.',
    },
  ],
};
