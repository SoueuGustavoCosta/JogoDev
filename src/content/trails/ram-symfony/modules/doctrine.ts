import type { Module } from '@/domain/trail/types';

/** Trilha 4 da Ramificação Symfony: banco com Doctrine. */
export const modSymfonyDoctrine: Module = {
  id: 'symfony-doctrine',
  short: 'Banco com Doctrine',
  title: 'Banco de dados com Doctrine',
  lead: 'O Doctrine é o ORM usado pelo Symfony: uma classe vira tabela, e o EntityManager salva os objetos no banco.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Configurar e criar a entidade' },
    { t: 'p', x: 'A conexão fica na variável <code>DATABASE_URL</code> do arquivo <code>.env</code>. Com o <b>MakerBundle</b>, o console cria a entidade fazendo perguntas:' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'php bin/console make:entity Produto' },
    {
      t: 'code',
      file: 'src/Entity/Produto.php',
      lang: 'php',
      nolab: true,
      x: "#[ORM\\Entity(repositoryClass: ProdutoRepository::class)]\nclass Produto\n{\n    #[ORM\\Id]\n    #[ORM\\GeneratedValue]\n    #[ORM\\Column]\n    private ?int $id = null;\n\n    #[ORM\\Column(length: 255)]\n    private ?string $nome = null;\n\n    #[ORM\\Column]\n    private ?int $preco = null;\n\n    // getters e setters gerados...\n}",
    },
    { t: 'h', x: 'Migração' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'php bin/console make:migration\nphp bin/console doctrine:migrations:migrate' },
    { t: 'h', x: 'Salvando' },
    {
      t: 'code',
      file: 'src/Controller/ProdutoController.php',
      lang: 'php',
      nolab: true,
      x: "use Doctrine\\ORM\\EntityManagerInterface;\n\n#[Route('/produto/novo')]\npublic function criar(EntityManagerInterface $entityManager): Response\n{\n    $produto = new Produto();\n    $produto->setNome('Teclado');\n    $produto->setPreco(199);\n\n    $entityManager->persist($produto);\n    $entityManager->flush();\n\n    return new Response('Produto salvo com id ' . $produto->getId());\n}",
    },
    {
      t: 'cards',
      items: [
        { h: 'persist()', x: 'Avisa o Doctrine: "cuide deste objeto". Ainda não vai ao banco.' },
        { h: 'flush()', x: 'Agora sim: executa no banco tudo o que estava pendente.' },
        { h: 'Repositório', x: 'Para buscar: <code>$repositorio->find($id)</code>, <code>findBy([...])</code>, <code>findAll()</code>.' },
      ],
    },
    {
      t: 'note',
      k: 'Injeção de dependência',
      x: 'O <code>EntityManagerInterface</code> chega como argumento do método: o Symfony injeta o serviço certo sozinho.',
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Documentação do Symfony: <a href="https://symfony.com/doc/current/doctrine.html" target="_blank" rel="noopener">Databases and the Doctrine ORM</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Depois de $entityManager->persist($produto), o produto já está no banco?',
      options: ['Sim', 'Não: ele só vai ao banco no flush()', 'Só se reiniciar o servidor', 'Só com commit()'],
      answer: 1,
      explain: '<code>persist</code> marca; <code>flush</code> executa.',
    },
    {
      id: 'q2',
      q: 'Onde fica o endereço de conexão com o banco?',
      options: ['Na variável DATABASE_URL do .env', 'No controller', 'No template Twig', 'No composer.json'],
      answer: 0,
      explain: '<code>DATABASE_URL</code>, no <code>.env</code> (e os segredos de verdade fora do Git).',
    },
    {
      id: 'q3',
      q: 'Qual comando aplica as migrações no banco?',
      options: ['php bin/console make:migration', 'php bin/console doctrine:migrations:migrate', 'php artisan migrate', 'composer migrate'],
      answer: 1,
      explain: '<code>make:migration</code> gera o arquivo; <code>doctrine:migrations:migrate</code> executa.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: monte as duas linhas que salvam o produto.',
      pieces: ['$entityManager->persist($produto);', '$entityManager->flush();'],
      distractors: ['$produto->save();', '$entityManager->commit();'],
      explain: 'Primeiro marcar, depois executar.',
    },
  ],
};
