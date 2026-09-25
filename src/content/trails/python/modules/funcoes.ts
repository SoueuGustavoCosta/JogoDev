import type { Module } from '@/domain/trail/types';

/** Farol 6 da Lua de Python: def, argumentos padrão, *args/**kwargs e a armadilha da lista mutável. */
export const modFuncoes: Module = {
  id: 'funcoes-python',
  short: 'Empacotar lógica',
  title: 'Funções: def, argumentos e a armadilha da lista mutável',
  lead: 'Uma função bem escrita é um bloco de lógica com nome. Aqui mora também o truque mais sutil que Onduluk sabe fazer.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Definindo uma função com def' },
    {
      t: 'code',
      file: 'funcao_simples.py',
      lang: 'python',
      nolab: true,
      x: 'def saudacao(nome):\n    return f"Olá, {nome}!"\n\nprint(saudacao("Viajante"))',
    },
    {
      t: 'out',
      file: 'funcao_simples.out',
      x: 'Olá, Viajante!',
    },
    { t: 'h', x: 'Argumentos com valor padrão' },
    {
      t: 'p',
      x: 'Um parâmetro pode ter um valor padrão, usado quando quem chama a função não informa aquele argumento.',
    },
    {
      t: 'code',
      file: 'padrao.py',
      lang: 'python',
      nolab: true,
      x: 'def saudacao(nome, saudacao_inicial="Olá"):\n    return f"{saudacao_inicial}, {nome}!"\n\nprint(saudacao("Ana"))                  # Olá, Ana!\nprint(saudacao("Ana", "Bem-vinda"))     # Bem-vinda, Ana!',
    },
    { t: 'h', x: '*args e **kwargs: uma quantidade variável de argumentos' },
    {
      t: 'p',
      x: 'Quando você não sabe quantos argumentos vão chegar, <code>*args</code> junta os argumentos posicionais numa tupla, e <code>**kwargs</code> junta os argumentos nomeados num dicionário.',
    },
    {
      t: 'code',
      file: 'args_kwargs.py',
      lang: 'python',
      nolab: true,
      x: 'def somar(*numeros):\n    return sum(numeros)\n\nprint(somar(1, 2, 3, 4))   # 10\n\ndef perfil(**dados):\n    for chave, valor in dados.items():\n        print(f"{chave}: {valor}")\n\nperfil(nome="Ana", idade=27)',
    },
    { t: 'h', x: 'A armadilha clássica de Python: lista mutável como padrão' },
    {
      t: 'p',
      x: 'Este é um dos erros mais famosos entre quem aprende Python — e o truque favorito de Onduluk. Um valor padrão <b>mutável</b> (como uma lista) é criado <b>uma única vez</b>, na hora que a função é definida, não a cada chamada.',
    },
    {
      t: 'code',
      file: 'armadilha.py',
      lang: 'python',
      expectError: true,
      nolab: true,
      x: 'def adicionar_item(item, carrinho=[]):   # ERRADO: lista compartilhada entre chamadas\n    carrinho.append(item)\n    return carrinho\n\nprint(adicionar_item("maçã"))   # [\'maçã\']\nprint(adicionar_item("pão"))    # [\'maçã\', \'pão\'] — ela devia começar vazia!',
    },
    {
      t: 'note',
      k: 'O jeito certo',
      x: 'Use None como padrão, e crie a lista de verdade dentro da função: def adicionar_item(item, carrinho=None): if carrinho is None: carrinho = []',
      warn: true,
    },
    { t: 'h', x: 'return vs. nada' },
    {
      t: 'p',
      x: 'Uma função sem <code>return</code> explícito devolve <code>None</code> automaticamente. Isso não é um erro — só significa "esta função não produz um valor para usar depois".',
    },
    { t: 'h', x: 'Docstring: documentando a função' },
    {
      t: 'code',
      file: 'docstring.py',
      lang: 'python',
      nolab: true,
      x: 'def area_retangulo(base, altura):\n    """Calcula a área de um retângulo a partir da base e da altura."""\n    return base * altura',
    },
  ],
  quiz: [
    {
      q: 'O que uma função Python retorna se não tiver nenhum return explícito?',
      options: ['0', '""', 'None', 'Um erro de sintaxe'],
      answer: 2,
      explain: 'Sem return, a função devolve None automaticamente, sem gerar erro.',
    },
    {
      q: 'O que *args faz na definição de uma função?',
      options: [
        'Recebe um único argumento obrigatório',
        'Junta os argumentos posicionais extras numa tupla',
        'Junta os argumentos nomeados num dicionário',
        'Impede que a função receba argumentos',
      ],
      answer: 1,
      explain: '*args recolhe quantos argumentos posicionais forem passados numa tupla dentro da função.',
    },
    {
      q: 'Por que def adicionar_item(item, carrinho=[]) é uma armadilha conhecida em Python?',
      options: [
        'Porque listas não podem ser parâmetros',
        'Porque a lista padrão é criada uma vez só e compartilhada entre chamadas',
        'Porque o Python trava ao rodar esse código',
        'Porque falta o tipo do parâmetro',
      ],
      answer: 1,
      explain: 'Valores padrão mutáveis (como listas) são criados uma única vez, quando a função é definida — não a cada chamada, o que causa dados vazando entre chamadas diferentes.',
      hint: 'Pense em quando o valor padrão [] é criado: uma vez, ou toda vez que a função roda?',
    },
    {
      q: 'Qual é o jeito seguro de ter um parâmetro de lista opcional em Python?',
      options: [
        'carrinho=[] direto no parâmetro',
        'carrinho=None, e criar a lista dentro da função se for None',
        'Não é possível ter parâmetros de lista opcionais',
        'carrinho=list() direto no parâmetro',
      ],
      answer: 1,
      explain: 'Usar None como padrão e criar carrinho = [] dentro do corpo da função evita o compartilhamento indesejado entre chamadas.',
    },
    {
      q: 'Complete: **kwargs recolhe os argumentos nomeados extras dentro de um ___.',
      fill: true,
      pre: '**kwargs recolhe os argumentos nomeados extras dentro de um',
      post: '.',
      accept: ['dicionário', 'dicionario', 'dicionário', 'dict'],
      wrong: ['lista', 'tupla', 'conjunto'],
      placeholder: 'tipo de coleção',
      explain: '**kwargs junta os argumentos passados como nome=valor em um dicionário, acessível dentro da função.',
    },
  ],
};
