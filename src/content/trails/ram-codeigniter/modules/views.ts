import type { Module } from '@/domain/trail/types';

/** Trilha 3 da Ramificação CodeIgniter: views. */
export const modCiViews: Module = {
  id: 'ci-views',
  short: 'Views',
  title: 'Views: a tela',
  lead: 'Uma view é um arquivo PHP com HTML. O controller manda os dados num array, e cada chave vira uma variável na view.',
  level: 'Base',
  blocks: [
    {
      t: 'code',
      file: 'app/Controllers/Noticias.php',
      lang: 'php',
      nolab: true,
      x: "public function index()\n{\n    $data = [\n        'titulo'   => 'Últimas notícias',\n        'noticias' => ['Nova Ramificação aberta', 'O Eco foi visto na Lua de PHP'],\n    ];\n\n    return view('noticias/lista', $data);\n}",
    },
    {
      t: 'code',
      file: 'app/Views/noticias/lista.php',
      lang: 'php',
      nolab: true,
      x: "<h1><?= esc($titulo) ?></h1>\n\n<?php if ($noticias !== []): ?>\n    <ul>\n    <?php foreach ($noticias as $noticia): ?>\n        <li><?= esc($noticia) ?></li>\n    <?php endforeach ?>\n    </ul>\n<?php else: ?>\n    <p>Nenhuma notícia.</p>\n<?php endif ?>",
    },
    {
      t: 'cards',
      items: [
        { h: "view('noticias/lista', $data)", x: 'Carrega <code>app/Views/noticias/lista.php</code> com os dados.' },
        { h: '<?= ... ?>', x: 'Atalho do PHP para mostrar um valor.' },
        { h: 'esc()', x: 'Sempre em volta do que vai para a tela.' },
      ],
    },
    { t: 'h', x: 'Layouts' },
    {
      t: 'code',
      file: 'app/Views/noticias/lista.php',
      lang: 'php',
      nolab: true,
      x: "<?= $this->extend('layouts/padrao') ?>\n\n<?= $this->section('conteudo') ?>\n    <h1><?= esc($titulo) ?></h1>\n<?= $this->endSection() ?>",
    },
    { t: 'p', x: 'O layout <code>app/Views/layouts/padrao.php</code> tem o HTML comum e marca o lugar com <code>&lt;?= $this-&gt;renderSection(\'conteudo\') ?&gt;</code>.' },
    { t: 'say', x: 'No CodeIgniter a view é PHP puro. Por isso o esc() é seu melhor amigo: nada de mostrar texto do usuário sem ele.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Guia do CodeIgniter 4: <a href="https://codeigniter.com/user_guide/outgoing/views.html" target="_blank" rel="noopener">Views</a> e <a href="https://codeigniter.com/user_guide/outgoing/view_layouts.html" target="_blank" rel="noopener">View Layouts</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: "view('noticias/lista', $data) carrega qual arquivo?",
      options: ['app/Views/noticias/lista.php', 'resources/views/noticias/lista.blade.php', 'templates/noticias/lista.html.twig', 'public/noticias/lista.html'],
      answer: 0,
      explain: 'As views ficam em <code>app/Views</code>.',
    },
    {
      id: 'q2',
      q: "Com $data = ['titulo' => 'Olá'], como a view usa o título?",
      options: ["$data['titulo']", '$titulo', '{{ titulo }}', 'this.titulo'],
      answer: 1,
      explain: 'Cada chave do array vira uma variável: <code>$titulo</code>.',
    },
    {
      id: 'q3',
      kind: 'output',
      q: 'O CodeIgniter entrega o array de dados à view transformando cada chave numa variável, como o extract() do PHP. O que este código mostra?',
      lang: 'php',
      code: "<?php\n$data = ['titulo' => 'Olá', 'nome' => 'Ana'];\nextract($data);\necho $titulo . ', ' . $nome;",
      options: ['Olá, Ana', 'titulo, nome', 'Array', 'Erro: variável indefinida'],
      answer: 0,
      explain: 'Cada chave vira uma variável: <code>$titulo</code> e <code>$nome</code>. É por isso que a view usa <code>$titulo</code>, não <code>$data[\'titulo\']</code>.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha da view que mostra o título com segurança.',
      pieces: ['<?=', 'esc(', '$titulo', ')', '?>'],
      distractors: ['echo', '{{', '$data'],
      explain: '<code>&lt;?= esc($titulo) ?&gt;</code>.',
    },
  ],
};
