import type { Module } from '@/domain/trail/types';

/** Farol 5 da Lua de PHP: arrays indexados e associativos, o array único e versátil da linguagem. */
export const modColecoes: Module = {
  id: 'arrays-php',
  short: 'Um array, dois usos',
  title: 'Arrays: indexados e associativos',
  lead: 'Python tem list, tuple, dict e set. PHP resolve quase tudo isso com uma única estrutura: o array.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Array indexado: como uma lista' },
    {
      t: 'code',
      file: 'indexado.php',
      lang: 'php',
      nolab: true,
      x: '$numeros = [10, 20, 30, 40];\necho $numeros[0];        // 10\necho count($numeros);     // 4\n\n$numeros[] = 50;          // adiciona ao final, sem precisar dizer o índice',
    },
    { t: 'h', x: 'Array associativo: como um dicionário' },
    {
      t: 'p',
      x: 'O mesmo tipo <code>array</code> também guarda pares chave-valor, usando <code>=&gt;</code> entre a chave e o valor.',
    },
    {
      t: 'code',
      file: 'associativo.php',
      lang: 'php',
      nolab: true,
      x: '$viajante = [\n    "nome" => "Ana",\n    "idade" => 27,\n    "trilha" => "php",\n];\n\necho $viajante["nome"];        // Ana\n$viajante["idade"] = 28;        // atualiza o valor\necho isset($viajante["cidade"]) ? "tem" : "não tem"; // não tem',
    },
    {
      t: 'note',
      k: 'isset() em vez de comparar com null',
      x: 'isset($array["chave"]) verifica se uma chave existe e não é null, sem gerar aviso — o jeito seguro de checar antes de acessar.',
    },
    { t: 'h', x: 'Por que PHP tem só um tipo de array' },
    {
      t: 'p',
      x: 'Por trás dos panos, um array PHP é uma <b>lista ordenada de pares chave-valor</b>. Quando você não escreve chaves, PHP usa índices numéricos automáticos (0, 1, 2...) — por isso ele funciona tanto como lista quanto como dicionário.',
    },
    { t: 'h', x: 'Funções úteis de array' },
    {
      t: 'table',
      cols: ['Função', 'O que faz'],
      rows: [
        ['count($array)', 'quantos itens o array tem'],
        ['array_push($array, $item)', 'adiciona um item ao final'],
        ['in_array($valor, $array)', 'verifica se um valor existe no array'],
        ['array_keys($array)', 'devolve só as chaves, num novo array'],
        ['sort($array)', 'ordena o array (reorganiza os índices)'],
      ],
    },
    {
      t: 'note',
      k: 'A ordem dos argumentos varia',
      x: 'Repare que in_array(valor, array) recebe o valor primeiro, mas array_push(array, item) recebe o array primeiro. Não existe um padrão único na biblioteca de arrays de PHP — vale sempre conferir a documentação.',
      warn: true,
    },
    { t: 'h', x: 'Array multidimensional' },
    {
      t: 'code',
      file: 'multidimensional.php',
      lang: 'php',
      nolab: true,
      x: '$matriz = [\n    [1, 2],\n    [3, 4],\n];\n\necho $matriz[1][0];   // 3',
    },
  ],
  quiz: [
    {
      q: 'O que $numeros[] = 50; faz num array PHP?',
      options: [
        'Substitui todos os itens por 50',
        'Adiciona 50 ao final do array, sem precisar informar o índice',
        'Causa um erro de sintaxe',
        'Remove o item de índice 50',
      ],
      answer: 1,
      explain: 'Colchetes vazios [] dizem para PHP adicionar o item na próxima posição disponível, automaticamente.',
    },
    {
      q: 'Como se cria um par chave-valor num array associativo PHP?',
      options: ['"chave": valor', '"chave" => valor', 'chave = valor', '{"chave": valor}'],
      answer: 1,
      explain: 'PHP usa a seta => para associar uma chave a um valor dentro de um array.',
    },
    {
      q: 'Por que PHP consegue usar o mesmo tipo array tanto como lista quanto como dicionário?',
      options: [
        'É mágica, sem explicação técnica',
        'Por trás dos panos, é sempre uma lista ordenada de pares chave-valor; sem chave explícita, usa índices numéricos automáticos',
        'PHP na verdade tem dois tipos diferentes com o mesmo nome',
        'Só funciona como lista, nunca como dicionário',
      ],
      answer: 1,
      explain: 'Um array PHP guarda pares chave-valor; quando você não escreve a chave, ela vira automaticamente um índice numérico.',
    },
    {
      q: 'Qual função verifica se uma chave existe num array, sem gerar aviso?',
      options: ['exists()', 'has()', 'isset()', 'contains()'],
      answer: 2,
      explain: 'isset($array["chave"]) é o jeito seguro e idiomático de checar se uma chave existe (e não é null) antes de usá-la.',
      hint: 'A função começa com "is".',
    },
    {
      q: 'Complete: função que devolve quantos itens um array tem se chama ___($array).',
      fill: true,
      pre: 'A função que devolve quantos itens um array tem se chama',
      post: '($array).',
      accept: ['count'],
      placeholder: 'nome da função',
      explain: 'count($array) retorna o número de elementos do array.',
    },
  ],
};
