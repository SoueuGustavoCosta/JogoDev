import type { Module } from '@/domain/trail/types';

/** Trilha 5 do Cometa Linux: primeiro script em shell. */
export const modLinuxScript: Module = {
  id: 'linux-script',
  short: 'Primeiro script',
  title: 'O primeiro script em shell',
  lead: 'Um script é uma lista de comandos num arquivo. Escreveu uma vez, roda sempre que quiser.',
  level: 'Intermediário',
  blocks: [
    {
      t: 'code',
      file: 'ola.sh',
      lang: 'bash',
      nolab: true,
      x: '#!/bin/bash\nnome=$1\nif [ -z "$nome" ]; then\n  nome="Viajante"\nfi\necho "Olá, $nome!"\n\nfor i in 1 2 3; do\n  echo "Contando: $i"\ndone',
    },
    {
      t: 'cards',
      items: [
        { h: '#!/bin/bash', x: 'A primeira linha (shebang) diz qual programa roda o script.' },
        { h: 'nome=$1', x: 'Variável recebe o primeiro argumento. Sem espaços em volta do =.' },
        { h: '[ -z "$nome" ]', x: 'Verdadeiro se a variável estiver vazia.' },
        { h: 'for ... do ... done', x: 'Repete para cada item da lista.' },
      ],
    },
    { t: 'h', x: 'Rodando' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'chmod +x ola.sh\n./ola.sh Ana' },
    { t: 'out', file: 'saida', x: 'Olá, Ana!\nContando: 1\nContando: 2\nContando: 3' },
    {
      t: 'note',
      k: 'Aspas nas variáveis',
      x: 'Use <code>"$nome"</code> com aspas. Sem elas, um nome com espaço vira duas palavras e o <code>if</code> quebra.',
    },
    { t: 'say', x: 'Última trilha do cometa! O Sudo Supremo está esperando: ele roda tudo como root e dá 777 para tudo. Vença ele antes do cometa sumir.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Linux man-pages: <a href="https://man7.org/linux/man-pages/man1/bash.1.html" target="_blank" rel="noopener">bash(1)</a>; manual do GNU coreutils: <a href="https://www.gnu.org/software/coreutils/manual/html_node/echo-invocation.html" target="_blank" rel="noopener">echo</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O script ola.sh tem echo "Olá, $nome!" e nome recebe $1. O que aparece com ./ola.sh Bia?',
      options: ['Olá, $nome!', 'Olá, Bia!', 'Olá, $1!', 'Olá, Viajante!'],
      answer: 1,
      explain: '$1 é o primeiro argumento: Bia.',
    },
    {
      id: 'q2',
      kind: 'bug',
      q: 'O script dá "nome: command not found". Toque na linha com o bug.',
      lines: ['#!/bin/bash', 'nome = $1', 'echo "Olá, $nome!"'],
      bugLine: 2,
      explain: 'Em shell, a atribuição não tem espaços: nome=$1.',
    },
    {
      id: 'q3',
      q: 'Para que serve a primeira linha #!/bin/bash?',
      options: ['É um comentário sem efeito', 'Diz qual programa vai rodar o script', 'Deixa o script mais rápido', 'Pede senha de root'],
      answer: 1,
      explain: 'É o shebang: aponta o interpretador.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: dê permissão de execução e rode o script com o argumento Ana.',
      pieces: ['chmod +x ola.sh', '&&', './ola.sh Ana'],
      distractors: ['chmod 777', 'sudo rm', 'bash -x'],
      explain: 'Primeiro a permissão, depois ./ para rodar.',
    },
  ],
};
