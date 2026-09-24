import type { Module } from '@/domain/trail/types';

/** Farol 5 da Lua de Python: list, tuple, dict, set e slicing. */
export const modColecoes: Module = {
  id: 'colecoes',
  short: 'Guardar muitos valores',
  title: 'Coleções: listas, tuplas, dicionários e conjuntos',
  lead: 'Quatro jeitos diferentes de guardar vários valores numa variável só. Cada um existe para um problema diferente.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'list: a coleção mais usada' },
    {
      t: 'p',
      x: 'Uma <b>lista</b> guarda vários valores, em ordem, e pode ser alterada depois de criada (é <i>mutável</i>). Os itens ficam entre colchetes <code>[ ]</code>, e cada posição tem um índice começando em <b>0</b>.',
    },
    {
      t: 'code',
      file: 'listas.py',
      lang: 'python',
      nolab: true,
      x: 'numeros = [10, 20, 30, 40]\nprint(numeros[0])    # 10 (primeiro item)\nprint(numeros[-1])   # 40 (último item)\n\nnumeros.append(50)   # adiciona ao final\nnumeros[1] = 99       # troca o item do índice 1',
    },
    {
      t: 'note',
      k: 'Índice negativo',
      x: 'numeros[-1] pega o último item, numeros[-2] o penúltimo — um recurso próprio de Python que evita ter que calcular len(lista) - 1.',
    },
    { t: 'h', x: 'Slicing: fatiando uma lista' },
    {
      t: 'p',
      x: 'A notação <code>lista[início:fim]</code> pega um pedaço da lista, parando <i>antes</i> do índice final (a mesma regra do range()).',
    },
    {
      t: 'code',
      file: 'slicing.py',
      lang: 'python',
      nolab: true,
      x: 'numeros = [10, 20, 30, 40, 50]\nprint(numeros[1:3])   # [20, 30]\nprint(numeros[:2])    # [10, 20]\nprint(numeros[2:])    # [30, 40, 50]',
    },
    { t: 'h', x: 'tuple: como uma lista, mas travada' },
    {
      t: 'p',
      x: 'Uma <b>tupla</b> usa parênteses <code>( )</code> e não pode ser alterada depois de criada (é <i>imutável</i>). É usada quando os dados não devem mudar, como uma coordenada (x, y).',
    },
    {
      t: 'code',
      file: 'tupla.py',
      lang: 'python',
      nolab: true,
      x: 'coordenada = (10, 20)\nx, y = coordenada   # "desempacotar" a tupla em duas variáveis\nprint(x, y)          # 10 20',
    },
    { t: 'h', x: 'dict: pares de chave e valor' },
    {
      t: 'p',
      x: 'Um <b>dicionário</b> guarda valores associados a uma <b>chave</b>, entre chaves <code>{ }</code>. Em vez de um índice numérico, você acessa o valor pela chave.',
    },
    {
      t: 'code',
      file: 'dict.py',
      lang: 'python',
      nolab: true,
      x: 'viajante = {\n    "nome": "Ana",\n    "idade": 27,\n    "trilha": "python",\n}\n\nprint(viajante["nome"])        # Ana\nviajante["idade"] = 28          # atualiza o valor\nprint(viajante.get("cidade"))  # None, sem dar erro',
    },
    {
      t: 'note',
      k: 'viajante["cidade"] vs viajante.get("cidade")',
      x: 'Acessar uma chave que não existe com colchetes ([ ]) causa um erro (KeyError). Usar .get() na mesma situação devolve None em vez de quebrar o programa.',
      warn: true,
    },
    { t: 'h', x: 'set: só valores únicos, sem ordem garantida' },
    {
      t: 'p',
      x: 'Um <b>conjunto</b> (set) nunca guarda valores repetidos. É útil para remover duplicatas ou testar se um item existe rapidamente.',
    },
    {
      t: 'code',
      file: 'set.py',
      lang: 'python',
      nolab: true,
      x: 'cores = {"azul", "roxo", "azul", "laranja"}\nprint(cores)          # {\'azul\', \'roxo\', \'laranja\'} — sem repetição',
    },
    { t: 'h', x: 'Qual coleção usar?' },
    {
      t: 'table',
      cols: ['Coleção', 'Símbolo', 'Muda depois de criada?', 'Uso típico'],
      rows: [
        ['list', '[ ]', 'sim', 'sequência de itens que pode crescer'],
        ['tuple', '( )', 'não', 'valores fixos, como coordenadas'],
        ['dict', '{chave: valor}', 'sim', 'dados nomeados, como um cadastro'],
        ['set', '{ }', 'sim', 'valores únicos, sem duplicata'],
      ],
    },
  ],
  quiz: [
    {
      q: 'Dada a lista numeros = [10, 20, 30, 40], o que numeros[-1] retorna?',
      options: ['10', '40', 'erro', '-1'],
      answer: 1,
      explain: 'Índice -1 acessa o último item da lista: 40.',
    },
    {
      q: 'Qual coleção é imutável (não pode ser alterada depois de criada)?',
      options: ['list', 'dict', 'tuple', 'set'],
      answer: 2,
      explain: 'A tupla, criada com parênteses ( ), não permite alterar seus valores depois de criada.',
    },
    {
      q: 'O que numeros[1:3] retorna, para numeros = [10, 20, 30, 40, 50]?',
      options: ['[20, 30]', '[20, 30, 40]', '[10, 20, 30]', '[30, 40]'],
      answer: 0,
      explain: 'O slicing pega do índice 1 até antes do índice 3: posições 1 e 2, ou seja, [20, 30].',
      hint: 'A mesma regra do range(): para antes do índice final.',
    },
    {
      q: 'Em um dict, qual é a diferença entre usar colchetes e usar .get() para uma chave que não existe?',
      options: [
        'Não há diferença',
        'Colchetes causam erro (KeyError); .get() devolve None',
        '.get() causa erro; colchetes devolvem None',
        'Ambos sempre devolvem None',
      ],
      answer: 1,
      explain: 'dicionario["chave"] gera KeyError se a chave não existir; dicionario.get("chave") devolve None com segurança.',
    },
    {
      q: 'Complete: a coleção que nunca guarda valores repetidos, usando { } mas sem pares de chave e valor, se chama ___.',
      fill: true,
      pre: 'A coleção que nunca guarda valores repetidos se chama',
      post: '.',
      accept: ['set', 'conjunto'],
      placeholder: 'nome da coleção',
      explain: 'O set (conjunto) elimina automaticamente valores duplicados.',
    },
  ],
};
