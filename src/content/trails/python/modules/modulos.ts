import type { Module } from '@/domain/trail/types';

/** Farol 7 da Lua de Python: import, biblioteca padrão, pip e arquivos com "with open". */
export const modModulos: Module = {
  id: 'modulos-e-arquivos',
  short: 'Além de um arquivo só',
  title: 'Módulos, pacotes e arquivos',
  lead: 'Python vem com "pilhas incluídas": uma biblioteca padrão enorme, mais um jeito seguro de ler e escrever arquivos de verdade.',
  level: 'Avançado',
  blocks: [
    { t: 'h', x: 'import: usando código de outro arquivo' },
    {
      t: 'p',
      x: 'Um <b>módulo</b> é simplesmente um arquivo <code>.py</code>. Você importa o que precisa de outro módulo com <code>import</code>.',
    },
    {
      t: 'code',
      file: 'import.py',
      lang: 'python',
      nolab: true,
      x: 'import math\n\nprint(math.sqrt(16))   # 4.0\nprint(math.pi)          # 3.141592653589793',
    },
    {
      t: 'code',
      file: 'import_de.py',
      lang: 'python',
      nolab: true,
      x: 'from math import sqrt\n\nprint(sqrt(16))   # 4.0, sem precisar escrever math. na frente',
    },
    { t: 'h', x: '"Pilhas incluídas": a biblioteca padrão' },
    {
      t: 'p',
      x: 'Uma frase famosa sobre Python é "batteries included" ("pilhas incluídas"): a instalação já vem com módulos prontos para datas, arquivos, matemática, internet e muito mais — sem precisar instalar nada a mais.',
    },
    {
      t: 'cards',
      items: [
        { h: 'math', x: 'Funções matemáticas: raiz quadrada, potência, trigonometria.' },
        { h: 'random', x: 'Números e escolhas aleatórias.' },
        { h: 'datetime', x: 'Datas e horários.' },
        { h: 'os', x: 'Conversar com o sistema operacional: pastas, variáveis de ambiente.' },
      ],
    },
    { t: 'h', x: 'pip: instalando pacotes de fora' },
    {
      t: 'p',
      x: 'Para bibliotecas que não vêm de fábrica (como pandas ou requests), Python usa o <code>pip</code>, o gerenciador de pacotes, que baixa código publicado no PyPI (Python Package Index).',
    },
    {
      t: 'code',
      file: 'pip.sh',
      lang: 'bash',
      nolab: true,
      x: 'pip install requests',
    },
    { t: 'h', x: 'Lendo e escrevendo arquivos: with open(...)' },
    {
      t: 'p',
      x: 'O jeito recomendado de abrir um arquivo em Python é com <code>with open(...)</code>. O bloco <code>with</code> garante que o arquivo é fechado sozinho ao final, mesmo se algo der errado no meio do caminho.',
    },
    {
      t: 'code',
      file: 'escrever.py',
      lang: 'python',
      nolab: true,
      x: 'with open("diario.txt", "w") as arquivo:\n    arquivo.write("Cheguei na Lua de Python.\\n")\n    arquivo.write("Onduluk está por perto.\\n")',
    },
    {
      t: 'code',
      file: 'ler.py',
      lang: 'python',
      nolab: true,
      x: 'with open("diario.txt", "r") as arquivo:\n    conteudo = arquivo.read()\n    print(conteudo)',
    },
    { t: 'h', x: 'Os modos de abertura mais comuns' },
    {
      t: 'table',
      cols: ['Modo', 'Significado'],
      rows: [
        ['"r"', 'leitura (o arquivo precisa existir)'],
        ['"w"', 'escrita, apagando o conteúdo anterior'],
        ['"a"', 'escrita, adicionando ao final do arquivo existente'],
      ],
    },
    {
      t: 'note',
      k: 'Por que with, e não open() sozinho?',
      x: 'Sem with, é fácil esquecer de chamar arquivo.close() no final, deixando o arquivo "travado" para outros programas. with fecha automaticamente, mesmo se der erro no meio.',
      warn: true,
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que é um "módulo" em Python?',
      options: ['Um comentário especial', 'Um arquivo .py que pode ser importado', 'Um tipo de variável', 'Um tipo de erro'],
      answer: 1,
      explain: 'Qualquer arquivo .py pode ser importado como módulo em outro arquivo com import.',
    },
    {
      id: 'q2',
      q: 'O que significa a frase "batteries included" sobre Python?',
      options: [
        'Python precisa de hardware especial para rodar',
        'A instalação já vem com uma biblioteca padrão ampla, sem precisar instalar nada a mais',
        'Python só roda em notebooks com bateria',
        'É o nome do primeiro módulo de Python',
      ],
      answer: 1,
      explain: '"Pilhas incluídas" descreve como a biblioteca padrão de Python já resolve tarefas comuns (math, datetime, os) sem depender de pacotes externos.',
    },
    {
      id: 'q3',
      q: 'Qual ferramenta é usada para instalar pacotes de fora da biblioteca padrão, vindos do PyPI?',
      options: ['import', 'pip', 'with', 'venv'],
      answer: 1,
      explain: 'pip install &lt;pacote&gt; baixa e instala bibliotecas publicadas no PyPI (Python Package Index).',
    },
    {
      id: 'q4',
      q: 'Por que with open("arquivo.txt") as f é preferível a abrir o arquivo sem with?',
      options: [
        'É mais rápido de digitar',
        'Fecha o arquivo automaticamente, mesmo se ocorrer um erro no meio',
        'Só with pode ler arquivos de texto',
        'Não faz diferença nenhuma',
      ],
      answer: 1,
      explain: 'O bloco with garante o fechamento do arquivo mesmo diante de um erro, evitando arquivos "travados".',
      hint: 'Pense no que acontece se o programa quebrar no meio da leitura.',
    },
    {
      id: 'q5',
      q: 'Complete: para abrir um arquivo apagando o conteúdo anterior e escrever nele, o modo usado em open() é "___".',
      fill: true,
      pre: 'Para abrir um arquivo apagando o conteúdo anterior e escrever nele, o modo usado é "',
      post: '".',
      accept: ['w'],
      wrong: ['r', 'a', 'x'],
      placeholder: 'letra',
      explain: 'O modo "w" (write) abre para escrita, apagando o conteúdo anterior. "a" adiciona ao final, sem apagar.',
    },
  ],
};
