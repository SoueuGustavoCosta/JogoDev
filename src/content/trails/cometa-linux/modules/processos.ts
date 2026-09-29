import type { Module } from '@/domain/trail/types';

/** Trilha 4 do Cometa Linux: processos e pacotes. */
export const modLinuxProcessos: Module = {
  id: 'linux-processos',
  short: 'Processos e pacotes',
  title: 'Processos e pacotes',
  lead: 'Todo programa rodando é um processo, com um número (PID). E programas novos chegam pelo gerenciador de pacotes.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Vendo os processos' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'ps aux          # todos os processos\nps aux | grep node   # só os que têm "node" no nome\ntop             # ao vivo (q para sair)' },
    { t: 'p', x: 'A barra <code>|</code> (pipe) manda a saída de um comando para o próximo. Aqui, o <code>grep</code> filtra a lista.' },
    { t: 'h', x: 'Parando um processo' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'kill 4321       # pede para o processo 4321 terminar (sinal TERM)\nkill -9 4321    # força (sinal KILL): último recurso' },
    {
      t: 'note',
      k: 'kill -9 é o último recurso',
      x: 'O sinal padrão (TERM) deixa o programa salvar e fechar direito. O <code>-9</code> (KILL) derruba na hora, sem chance de arrumar nada.',
      warn: true,
    },
    { t: 'h', x: 'Instalando programas' },
    {
      t: 'p',
      x: 'Cada família de Linux tem o seu gerenciador de pacotes. No Debian e no Ubuntu é o <code>apt</code>:',
    },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'sudo apt update         # atualiza a lista de pacotes\nsudo apt install tree   # instala o programa tree\ntree                    # mostra as pastas em árvore' },
    { t: 'p', x: 'No Fedora, o equivalente é o <code>dnf</code>. Para saber tudo de qualquer comando, o próprio sistema tem o manual: <code>man ps</code>, <code>man kill</code>.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Linux man-pages: <a href="https://man7.org/linux/man-pages/man1/ps.1.html" target="_blank" rel="noopener">ps(1)</a>, <a href="https://man7.org/linux/man-pages/man1/top.1.html" target="_blank" rel="noopener">top(1)</a>, <a href="https://man7.org/linux/man-pages/man1/kill.1.html" target="_blank" rel="noopener">kill(1)</a> e <a href="https://man7.org/linux/man-pages/man7/signal.7.html" target="_blank" rel="noopener">signal(7)</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que é o PID de um processo?',
      options: ['A senha dele', 'O número que identifica o processo', 'O tamanho em memória', 'O nome do dono'],
      answer: 1,
      explain: 'PID = Process ID.',
    },
    {
      id: 'q2',
      q: 'Por que tentar kill antes de kill -9?',
      options: [
        'kill -9 não existe',
        'O sinal padrão deixa o programa fechar direito; o -9 derruba na hora',
        'kill -9 apaga o programa do disco',
        'Não há diferença',
      ],
      answer: 1,
      explain: 'TERM pede com educação; KILL não dá chance de salvar.',
    },
    {
      id: 'q3',
      q: 'Em ps aux | grep node, o que faz a barra |?',
      options: ['Divide o terminal', 'Manda a saída do ps para o grep', 'Roda os dois ao mesmo tempo sem ligação', 'Comenta o resto'],
      answer: 1,
      explain: 'O pipe liga a saída de um comando à entrada do próximo.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: no Ubuntu, instale o programa tree.',
      pieces: ['sudo', 'apt', 'install', 'tree'],
      distractors: ['npm', 'get', 'kill'],
      explain: 'sudo apt install tree (depois de um sudo apt update).',
    },
  ],
};
