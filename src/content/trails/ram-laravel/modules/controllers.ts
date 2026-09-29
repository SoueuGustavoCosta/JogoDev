import type { Module } from '@/domain/trail/types';

/** Trilha 3 da Ramificação Laravel: controllers e views com Blade. */
export const modLaravelControllers: Module = {
  id: 'laravel-controllers',
  short: 'Controllers e Blade',
  title: 'Controllers e views com Blade',
  lead: 'Quando a lógica cresce, ela sai da rota e vai para um controller. E a página é montada por um template Blade.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'Criando o controller' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'php artisan make:controller UsuarioController' },
    {
      t: 'code',
      file: 'app/Http/Controllers/UsuarioController.php',
      lang: 'php',
      nolab: true,
      x: "<?php\n\nnamespace App\\Http\\Controllers;\n\nuse Illuminate\\View\\View;\n\nclass UsuarioController extends Controller\n{\n    public function mostrar(string $id): View\n    {\n        return view('usuario.perfil', ['nome' => 'Ana', 'id' => $id]);\n    }\n}",
    },
    {
      t: 'code',
      file: 'routes/web.php',
      lang: 'php',
      nolab: true,
      x: "use App\\Http\\Controllers\\UsuarioController;\n\nRoute::get('/usuario/{id}', [UsuarioController::class, 'mostrar']);",
    },
    { t: 'h', x: 'A view Blade' },
    { t: 'p', x: "<code>view('usuario.perfil', ...)</code> procura <code>resources/views/usuario/perfil.blade.php</code>. O ponto separa as pastas." },
    {
      t: 'code',
      file: 'resources/views/usuario/perfil.blade.php',
      lang: 'html',
      nolab: true,
      x: "@extends('layouts.app')\n\n@section('conteudo')\n    <h1>Olá, {{ $nome }}!</h1>\n    @if ($id === '1')\n        <p>Você é o primeiro viajante.</p>\n    @endif\n@endsection",
    },
    {
      t: 'code',
      file: 'resources/views/layouts/app.blade.php',
      lang: 'html',
      nolab: true,
      x: "<!doctype html>\n<html lang=\"pt-BR\">\n<body>\n    <main>@yield('conteudo')</main>\n</body>\n</html>",
    },
    {
      t: 'cards',
      items: [
        { h: '{{ $nome }}', x: 'Mostra a variável, já escapando HTML (protege contra scripts).' },
        { h: '@if / @foreach', x: 'Condições e laços, sem abrir <code>&lt;?php</code>.' },
        { h: '@extends e @section', x: 'A página usa um layout e preenche os espaços com <code>@yield</code>.' },
      ],
    },
    { t: 'say', x: 'Repare no {{ }}: ele escapa o HTML sozinho. Mostrar texto do usuário assim é seguro.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Laravel: <a href="https://laravel.com/docs/controllers" target="_blank" rel="noopener">Controllers</a>, <a href="https://laravel.com/docs/views" target="_blank" rel="noopener">Views</a> e <a href="https://laravel.com/docs/blade" target="_blank" rel="noopener">Blade Templates</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: "view('usuario.perfil') procura qual arquivo?",
      options: [
        'usuario.perfil.php na raiz',
        'resources/views/usuario/perfil.blade.php',
        'app/Views/usuario/perfil.php',
        'routes/usuario/perfil.php',
      ],
      answer: 1,
      explain: 'O ponto vira barra, e as views ficam em <code>resources/views</code> com <code>.blade.php</code>.',
    },
    {
      id: 'q2',
      q: 'Complete a rota que chama o método mostrar do controller:',
      fill: true,
      pre: "Route::get('/usuario/{id}', [UsuarioController::class,",
      post: ']);',
      accept: ["'mostrar'"],
      wrong: ["'perfil'", 'UsuarioController', "'index'"],
      placeholder: '?',
      explain: "O array tem a classe e o nome do método em texto: <code>[UsuarioController::class, 'mostrar']</code>.",
    },
    {
      id: 'q3',
      q: 'Por que {{ $nome }} é seguro para mostrar texto digitado pelo usuário?',
      options: ['Porque apaga o texto', 'Porque escapa o HTML automaticamente', 'Porque criptografa', 'Não é seguro'],
      answer: 1,
      explain: 'O Blade passa a variável por uma função de escape: um <code>&lt;script&gt;</code> vira texto.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o comando que cria o controller.',
      pieces: ['php', 'artisan', 'make:controller', 'UsuarioController'],
      distractors: ['composer', 'new:controller', 'spark'],
      explain: '<code>php artisan make:controller UsuarioController</code> cria o arquivo em <code>app/Http/Controllers</code>.',
    },
  ],
};
