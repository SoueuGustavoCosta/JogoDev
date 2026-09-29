import type { Module } from '@/domain/trail/types';

/** Trilha 5 da Ramificação CodeIgniter: formulários e validação. */
export const modCiFormularios: Module = {
  id: 'ci-formularios',
  short: 'Formulários e validação',
  title: 'Formulários e validação',
  lead: 'O CodeIgniter valida os dados do formulário com regras em texto e protege o envio com um token CSRF.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'As rotas' },
    {
      t: 'code',
      file: 'app/Config/Routes.php',
      lang: 'php',
      nolab: true,
      x: "use App\\Controllers\\Noticias;\n\n$routes->get('noticias/nova', [Noticias::class, 'nova']);\n$routes->post('noticias', [Noticias::class, 'criar']);",
    },
    { t: 'h', x: 'O formulário' },
    {
      t: 'code',
      file: 'app/Views/noticias/nova.php',
      lang: 'php',
      nolab: true,
      x: "<?= validation_list_errors() ?>\n\n<form action=\"/noticias\" method=\"post\">\n    <?= csrf_field() ?>\n    <input name=\"titulo\" value=\"<?= set_value('titulo') ?>\">\n    <textarea name=\"texto\"><?= set_value('texto') ?></textarea>\n    <button>Publicar</button>\n</form>",
    },
    { t: 'p', x: 'O <code>csrf_field()</code> cria o campo escondido com o token de proteção, e o <code>set_value()</code> devolve o que o usuário já tinha digitado.' },
    { t: 'h', x: 'Validando no controller' },
    {
      t: 'code',
      file: 'app/Controllers/Noticias.php',
      lang: 'php',
      nolab: true,
      x: "public function criar()\n{\n    helper('form');\n\n    $data = $this->request->getPost(['titulo', 'texto']);\n\n    if (! $this->validateData($data, [\n        'titulo' => 'required|max_length[255]|min_length[3]',\n        'texto'  => 'required|min_length[10]',\n    ])) {\n        return $this->nova();\n    }\n\n    $post = $this->validator->getValidated();\n    model(NoticiaModel::class)->save($post);\n\n    return redirect()->to('/noticias');\n}",
    },
    {
      t: 'cards',
      items: [
        { h: 'getPost([...])', x: 'Pega só os campos pedidos do envio.' },
        { h: 'validateData', x: 'Confere as regras. Se falhar, os erros ficam disponíveis para a view.' },
        { h: 'getValidated()', x: 'Os dados que passaram na validação: são esses que vão para o banco.' },
      ],
    },
    { t: 'say', x: 'Última trilha! A Faísca Apagada está esperando: ela deixa formulários sem proteção e grava qualquer coisa. Hora de acender a luz.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Guia do CodeIgniter 4: <a href="https://codeigniter.com/user_guide/tutorial/create_news_items.html" target="_blank" rel="noopener">Create News Items</a> e <a href="https://codeigniter.com/user_guide/libraries/validation.html" target="_blank" rel="noopener">Validation</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que csrf_field() coloca no formulário?',
      options: ['Um botão', 'Um campo escondido com o token de proteção', 'O título da página', 'Um captcha'],
      answer: 1,
      explain: 'O token prova que o envio saiu do seu site.',
    },
    {
      id: 'q2',
      q: 'Depois da validação passar, de onde vêm os dados que vão para o banco?',
      options: ['$_POST direto', '$this->validator->getValidated()', '$this->request->getGet()', 'set_value()'],
      answer: 1,
      explain: 'Só os dados validados.',
    },
    {
      id: 'q3',
      q: "Complete a regra: título obrigatório com no máximo 255 caracteres.",
      fill: true,
      pre: "'titulo' => 'required|",
      post: "[255]',",
      accept: ['max_length'],
      wrong: ['max', 'size', 'length'],
      placeholder: '?',
      explain: "No CodeIgniter a regra é <code>max_length[255]</code>.",
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte a linha que pega só os campos do formulário.',
      pieces: ['$data', '=', '$this->request->getPost(', "['titulo', 'texto']", ');'],
      distractors: ['$_POST', '->getGet(', 'request()'],
      explain: '<code>getPost([...])</code> com a lista dos campos.',
    },
  ],
};
