import type { Module } from '@/domain/trail/types';

/** Trilha 5 da Ramificação Symfony: formulários. */
export const modSymfonyForms: Module = {
  id: 'symfony-forms',
  short: 'Formulários',
  title: 'Formulários',
  lead: 'O componente Form monta o formulário a partir de um objeto, recebe o envio, valida e devolve o objeto preenchido.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'O objeto e suas regras' },
    {
      t: 'code',
      file: 'src/Entity/Tarefa.php',
      lang: 'php',
      nolab: true,
      x: "use Symfony\\Component\\Validator\\Constraints as Assert;\n\nclass Tarefa\n{\n    #[Assert\\NotBlank]\n    public string $titulo = '';\n}",
    },
    { t: 'h', x: 'No controller' },
    {
      t: 'code',
      file: 'src/Controller/TarefaController.php',
      lang: 'php',
      nolab: true,
      x: "use Symfony\\Component\\Form\\Extension\\Core\\Type\\SubmitType;\nuse Symfony\\Component\\Form\\Extension\\Core\\Type\\TextType;\nuse Symfony\\Component\\HttpFoundation\\Request;\n\n#[Route('/tarefa/nova', name: 'tarefa_nova')]\npublic function nova(Request $request): Response\n{\n    $tarefa = new Tarefa();\n\n    $form = $this->createFormBuilder($tarefa)\n        ->add('titulo', TextType::class)\n        ->add('salvar', SubmitType::class, ['label' => 'Criar tarefa'])\n        ->getForm();\n\n    $form->handleRequest($request);\n    if ($form->isSubmitted() && $form->isValid()) {\n        $tarefa = $form->getData();\n        // ... salvar\n        return $this->redirectToRoute('tarefa_nova');\n    }\n\n    return $this->render('tarefa/nova.html.twig', ['form' => $form]);\n}",
    },
    {
      t: 'cards',
      items: [
        { h: 'handleRequest', x: 'Lê o envio (se houver) e preenche o objeto.' },
        { h: 'isSubmitted() && isValid()', x: 'Foi enviado e passou nas regras, como o <code>#[Assert\\NotBlank]</code>.' },
        { h: 'redirectToRoute', x: 'Depois de salvar, redireciona: recarregar a página não envia de novo.' },
      ],
    },
    { t: 'h', x: 'No template' },
    { t: 'code', file: 'templates/tarefa/nova.html.twig', lang: 'html', nolab: true, x: '{{ form(form) }}' },
    { t: 'p', x: 'Uma linha desenha o formulário inteiro, com os erros de validação e o token de proteção CSRF.' },
    { t: 'say', x: 'Última trilha! A Sinfonia Desafinada está tocando: rotas fora do tom, dados sem validação e flush esquecido. Hora de afinar.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Symfony: <a href="https://symfony.com/doc/current/forms.html" target="_blank" rel="noopener">Forms</a> e <a href="https://symfony.com/doc/current/validation.html" target="_blank" rel="noopener">Validation</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual condição garante que o formulário foi enviado e passou nas regras?',
      options: ['$form->isValid()', '$form->isSubmitted() && $form->isValid()', '$request->isPost()', '$form->getData()'],
      answer: 1,
      explain: 'Primeiro enviado, depois válido.',
    },
    {
      id: 'q2',
      q: 'Para que serve #[Assert\\NotBlank] no campo?',
      options: ['Deixa o campo invisível', 'Diz que o campo não pode ficar vazio', 'Cria a coluna no banco', 'Escapa o HTML'],
      answer: 1,
      explain: 'É uma regra de validação.',
    },
    {
      id: 'q3',
      q: 'Complete a linha que lê o envio do formulário:',
      fill: true,
      pre: '$form->',
      post: '($request);',
      accept: ['handleRequest'],
      wrong: ['submit', 'getData', 'isValid'],
      placeholder: '?',
      explain: '<code>handleRequest</code> lê o pedido e preenche o objeto.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte o if que processa o formulário válido.',
      pieces: ['if (', '$form->isSubmitted()', '&&', '$form->isValid()', ')'],
      distractors: ['||', '$form->isSent()', '$request->isValid()'],
      explain: 'Os dois precisam ser verdadeiros: <code>&&</code>.',
    },
  ],
};
