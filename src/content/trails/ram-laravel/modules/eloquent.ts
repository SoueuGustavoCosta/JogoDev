import type { Module } from '@/domain/trail/types';

/** Trilha 4 da Ramificação Laravel: banco com migrations e Eloquent. */
export const modLaravelEloquent: Module = {
  id: 'laravel-eloquent',
  short: 'Migrations e Eloquent',
  title: 'Banco de dados com migrations e Eloquent',
  lead: 'A migration descreve a tabela em PHP. O Eloquent transforma cada linha numa classe: você busca, cria e salva sem escrever SQL.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Model e migration juntos' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'php artisan make:model Tarefa -m' },
    { t: 'p', x: 'O <code>-m</code> cria também a migration. Nela você descreve a tabela:' },
    {
      t: 'code',
      file: 'database/migrations/xxxx_create_tarefas_table.php',
      lang: 'php',
      nolab: true,
      x: "public function up(): void\n{\n    Schema::create('tarefas', function (Blueprint $table) {\n        $table->id();\n        $table->string('titulo');\n        $table->boolean('feita')->default(false);\n        $table->timestamps();\n    });\n}",
    },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'php artisan migrate' },
    {
      t: 'cards',
      items: [
        { h: '$table->id()', x: 'Chave primária numérica que se numera sozinha.' },
        { h: '$table->timestamps()', x: 'Cria <code>created_at</code> e <code>updated_at</code>, preenchidas pelo Eloquent.' },
        { h: 'php artisan migrate', x: 'Roda as migrations que ainda não rodaram.' },
      ],
    },
    { t: 'h', x: 'Eloquent: a tabela vira classe' },
    {
      t: 'code',
      file: 'app/Models/Tarefa.php',
      lang: 'php',
      nolab: true,
      x: "<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Model;\n\nclass Tarefa extends Model\n{\n    protected $fillable = ['titulo', 'feita'];\n}",
    },
    { t: 'p', x: 'O model <code>Tarefa</code> usa a tabela <code>tarefas</code> (o nome no plural, em minúsculas). Usando:' },
    {
      t: 'code',
      file: 'uso.php',
      lang: 'php',
      nolab: true,
      x: "$todas = Tarefa::all();\n$pendentes = Tarefa::where('feita', false)->get();\n\n$nova = Tarefa::create(['titulo' => 'Estudar Eloquent']);\n\n$tarefa = Tarefa::find(1);\n$tarefa->feita = true;\n$tarefa->save();",
    },
    {
      t: 'note',
      k: '$fillable',
      x: 'O <code>create([...])</code> só preenche os campos listados em <code>$fillable</code>. Isso impede que alguém mande um campo que não devia (como <code>is_admin</code>) num formulário.',
      warn: true,
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Laravel: <a href="https://laravel.com/docs/migrations" target="_blank" rel="noopener">Migrations</a> e <a href="https://laravel.com/docs/eloquent" target="_blank" rel="noopener">Eloquent: Getting Started</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que o -m faz em php artisan make:model Tarefa -m?',
      options: ['Cria também a migration', 'Roda o banco', 'Cria um controller', 'Apaga o model antigo'],
      answer: 0,
      explain: 'Model e migration nascem juntos.',
    },
    {
      id: 'q2',
      q: 'Qual tabela o model Tarefa usa por padrão?',
      options: ['Tarefa', 'tarefa', 'tarefas', 'tb_tarefa'],
      answer: 2,
      explain: 'O Eloquent usa o nome do model no plural, em minúsculas.',
    },
    {
      id: 'q3',
      q: "Para que serve protected $fillable = ['titulo', 'feita'];?",
      options: [
        'Define a ordem das colunas',
        'Lista os campos que podem ser preenchidos em massa, como no create()',
        'Deixa os campos obrigatórios',
        'Cria as colunas no banco',
      ],
      answer: 1,
      explain: 'Proteção contra preenchimento em massa de campos que não deviam mudar.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a busca das tarefas que ainda não foram feitas.',
      pieces: ['Tarefa::where(', "'feita'", ',', 'false', ')', '->get()'],
      distractors: ['->all()', 'SELECT', '::find('],
      explain: "<code>where(...)</code> monta a condição; <code>->get()</code> executa e devolve a lista.",
    },
  ],
};
