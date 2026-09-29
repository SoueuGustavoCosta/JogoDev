import type { Module } from '@/domain/trail/types';

/** Trilha 1 do Cometa Linux: o terminal e a navegação. */
export const modLinuxTerminal: Module = {
  id: 'linux-terminal',
  short: 'Terminal e navegação',
  title: 'O terminal e a navegação: pwd, ls e cd',
  lead: 'O terminal é uma conversa por texto com o sistema. Três comandos já te deixam andar por qualquer pasta.',
  level: 'Base',
  blocks: [
    { t: 'say', x: 'Viajante, outro cometa! Este carrega o Linux, o sistema que roda na maioria dos servidores do mundo. Vamos abrir o terminal.' },
    { t: 'h', x: 'Onde estou? pwd' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'pwd' },
    { t: 'out', file: 'saida', x: '/home/viajante' },
    { t: 'p', x: '<code>pwd</code> (print working directory) mostra a pasta em que você está. No Linux, tudo parte da raiz <code>/</code>.' },
    { t: 'h', x: 'O que tem aqui? ls' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'ls\nls -l    # detalhes: permissões, dono, tamanho, data\nls -a    # inclui os arquivos escondidos (que começam com .)\nls -la   # os dois juntos' },
    { t: 'h', x: 'Andando: cd' },
    {
      t: 'code',
      file: 'terminal',
      lang: 'bash',
      nolab: true,
      x: 'cd projetos        # entra na pasta projetos (caminho relativo)\ncd ..              # volta uma pasta\ncd ~               # vai para a sua pasta pessoal\ncd /var/log        # caminho absoluto: começa na raiz',
    },
    {
      t: 'cards',
      items: [
        { h: 'Caminho absoluto', x: 'Começa com <code>/</code>. Funciona de qualquer lugar.' },
        { h: 'Caminho relativo', x: 'Parte da pasta atual. <code>..</code> é a pasta de cima; <code>.</code> é a atual.' },
        { h: '~', x: 'Atalho para a sua pasta pessoal (ex.: <code>/home/viajante</code>).' },
      ],
    },
    { t: 'note', k: 'Dica de ouro', x: 'Aperte <b>Tab</b> para completar nomes de pastas e arquivos. Menos digitação, menos erro.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Manual do GNU coreutils: <a href="https://www.gnu.org/software/coreutils/manual/html_node/pwd-invocation.html" target="_blank" rel="noopener">pwd</a> e <a href="https://www.gnu.org/software/coreutils/manual/html_node/ls-invocation.html" target="_blank" rel="noopener">ls</a>; <a href="https://man7.org/linux/man-pages/man1/bash.1.html" target="_blank" rel="noopener">bash(1)</a> (o cd é um comando do próprio shell).',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual comando mostra em que pasta você está?',
      options: ['ls', 'pwd', 'cd', 'where'],
      answer: 1,
      explain: 'pwd = print working directory.',
    },
    {
      id: 'q2',
      q: 'Você está em /home/viajante/projetos. Para onde vai cd ..?',
      options: ['/home/viajante', '/home', '/', '/home/viajante/projetos/..'],
      answer: 0,
      explain: '.. é a pasta de cima.',
    },
    {
      id: 'q3',
      q: 'Qual comando lista também os arquivos escondidos, com detalhes?',
      options: ['ls', 'ls -l', 'ls -la', 'ls -h'],
      answer: 2,
      explain: '-l dá os detalhes e -a mostra os escondidos.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: entre na pasta /var/log pelo caminho absoluto.',
      pieces: ['cd', '/var/log'],
      distractors: ['var/log', 'pwd', 'ls'],
      explain: 'Caminho absoluto começa com /: cd /var/log.',
    },
  ],
};
