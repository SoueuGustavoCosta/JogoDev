import type { Module } from '@/domain/trail/types';

/** Trilha 5 da Ramificação Laravel: validação de formulários. */
export const modLaravelValidacao: Module = {
  id: 'laravel-validacao',
  short: 'Validação',
  title: 'Validação de formulários',
  lead: 'Nunca confie no que chega de um formulário. No Laravel, uma linha descreve as regras, e se algo falhar o usuário volta com os erros na tela.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'O formulário' },
    {
      t: 'code',
      file: 'resources/views/tarefas/criar.blade.php',
      lang: 'html',
      nolab: true,
      x: "<form method=\"POST\" action=\"/tarefas\">\n    @csrf\n    <input name=\"titulo\" value=\"{{ old('titulo') }}\">\n    @error('titulo')\n        <p>{{ $message }}</p>\n    @enderror\n    <button>Salvar</button>\n</form>",
    },
    {
      t: 'cards',
      items: [
        { h: '@csrf', x: 'Um campo escondido que prova que o formulário veio do seu site. Sem ele, o Laravel recusa o POST.' },
        { h: "old('titulo')", x: 'Devolve o que o usuário digitou, para ele não perder tudo quando der erro.' },
        { h: '@error', x: 'Mostra a mensagem de erro daquele campo.' },
      ],
    },
    { t: 'h', x: 'Validando no controller' },
    {
      t: 'code',
      file: 'app/Http/Controllers/TarefaController.php',
      lang: 'php',
      nolab: true,
      x: "use Illuminate\\Http\\Request;\n\npublic function salvar(Request $request)\n{\n    $dados = $request->validate([\n        'titulo' => 'required|max:255',\n    ]);\n\n    Tarefa::create($dados);\n\n    return redirect('/tarefas');\n}",
    },
    {
      t: 'p',
      x: 'Se a regra falhar, o <code>validate</code> para ali mesmo e manda o usuário de volta ao formulário, com os erros e o que ele digitou. Se passar, devolve só os campos validados.',
    },
    { t: 'say', x: 'Última trilha! O Artesão das Sombras está esperando: ele cria rotas soltas, esquece o @csrf e salva qualquer coisa no banco. Mostre como se faz.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Laravel: <a href="https://laravel.com/docs/validation" target="_blank" rel="noopener">Validation</a> e <a href="https://laravel.com/docs/csrf" target="_blank" rel="noopener">CSRF Protection</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que acontece quando o $request->validate([...]) encontra um erro?',
      options: [
        'Salva mesmo assim',
        'Volta para o formulário com os erros e o que foi digitado',
        'Mostra uma página em branco',
        'Apaga a tabela',
      ],
      answer: 1,
      explain: 'Ele interrompe e redireciona de volta, com os erros disponíveis para o <code>@error</code>.',
    },
    {
      id: 'q2',
      kind: 'bug',
      q: 'O envio do formulário dá erro 419 (página expirada). Toque na linha com o bug.',
      lines: ['<form method="POST" action="/tarefas">', '    {{ csrf }}', '    <input name="titulo">', '    <button>Salvar</button>', '</form>'],
      bugLine: 2,
      explain: 'A diretiva certa é <code>@csrf</code>: ela coloca o campo escondido com o token. Sem ele, o Laravel recusa o envio.',
    },
    {
      id: 'q3',
      q: "Complete a regra: o título é obrigatório e tem no máximo 255 caracteres.",
      fill: true,
      pre: "'titulo' => '",
      post: "|max:255',",
      accept: ['required'],
      wrong: ['needed', 'not_null', 'min:1'],
      placeholder: '?',
      explain: 'As regras se juntam com <code>|</code>: <code>required|max:255</code>.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha que valida o título.',
      pieces: ['$dados', '=', '$request->validate(', "['titulo' => 'required|max:255']", ');'],
      distractors: ['$_POST', 'validate::', 'if ('],
      explain: 'Uma linha: regras dentro, dados validados fora.',
    },
  ],
};
