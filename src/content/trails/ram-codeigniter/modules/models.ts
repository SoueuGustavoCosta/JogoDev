import type { Module } from '@/domain/trail/types';

/** Trilha 4 da Ramificação CodeIgniter: models e banco de dados. */
export const modCiModels: Module = {
  id: 'ci-models',
  short: 'Models e banco',
  title: 'Models e banco de dados',
  lead: 'O Model do CodeIgniter já sabe buscar, inserir, atualizar e apagar. Você só diz qual é a tabela e quais campos podem ser gravados.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Configurando o banco' },
    {
      t: 'code',
      file: '.env',
      lang: 'properties',
      nolab: true,
      x: 'database.default.hostname = localhost\ndatabase.default.database = ci4\ndatabase.default.username = usuario\ndatabase.default.password = senha\ndatabase.default.DBDriver = MySQLi',
    },
    { t: 'h', x: 'A tabela com migration' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'php spark make:migration CriaNoticias\nphp spark migrate' },
    { t: 'h', x: 'O model' },
    {
      t: 'code',
      file: 'app/Models/NoticiaModel.php',
      lang: 'php',
      nolab: true,
      x: "<?php\n\nnamespace App\\Models;\n\nuse CodeIgniter\\Model;\n\nclass NoticiaModel extends Model\n{\n    protected $table         = 'noticias';\n    protected $allowedFields = ['titulo', 'slug', 'texto'];\n}",
    },
    {
      t: 'code',
      file: 'app/Controllers/Noticias.php',
      lang: 'php',
      nolab: true,
      x: "use App\\Models\\NoticiaModel;\n\npublic function index()\n{\n    $model = model(NoticiaModel::class);\n\n    return view('noticias/lista', [\n        'noticias' => $model->findAll(),\n    ]);\n}\n\npublic function mostrar(string $slug)\n{\n    $noticia = model(NoticiaModel::class)->where('slug', $slug)->first();\n    // ...\n}",
    },
    {
      t: 'cards',
      items: [
        { h: 'findAll()', x: 'Todas as linhas.' },
        { h: "where(...)->first()", x: 'A primeira que casar com a condição (ou <code>null</code>).' },
        { h: 'save([...])', x: 'Insere (ou atualiza, se tiver a chave primária).' },
        { h: '$allowedFields', x: 'Só esses campos podem ser gravados por insert, update e save.' },
      ],
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Guia do CodeIgniter 4: <a href="https://codeigniter.com/user_guide/models/model.html" target="_blank" rel="noopener">Using CodeIgniter’s Model</a> e <a href="https://codeigniter.com/user_guide/dbmgmt/migration.html" target="_blank" rel="noopener">Database Migrations</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'No model, para que serve $allowedFields?',
      options: ['Define as colunas do banco', 'Lista os campos que podem ser gravados', 'Esconde campos da view', 'Define a chave primária'],
      answer: 1,
      explain: 'Campos fora da lista são ignorados na gravação: proteção contra dados indesejados.',
    },
    {
      id: 'q2',
      q: 'Qual método devolve todas as notícias?',
      options: ['$model->all()', '$model->findAll()', '$model->get()', '$model->select()'],
      answer: 1,
      explain: '<code>findAll()</code>.',
    },
    {
      id: 'q3',
      q: 'Complete para dizer qual tabela o model usa:',
      fill: true,
      pre: 'protected',
      post: " = 'noticias';",
      accept: ['$table'],
      wrong: ['$name', '$tabela', '$db'],
      placeholder: '?',
      explain: "<code>protected $table = 'noticias';</code>",
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a busca da notícia pelo slug.',
      pieces: ['$model', "->where('slug', $slug)", '->first()'],
      distractors: ['->findAll()', 'SELECT *', '->get('],
      explain: '<code>where</code> + <code>first</code>: a primeira que casar.',
    },
  ],
};
