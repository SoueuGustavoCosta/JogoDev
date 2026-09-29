import type { Module } from '@/domain/trail/types';

/** Trilha 3 do Cometa Linux: permissões. */
export const modLinuxPermissoes: Module = {
  id: 'linux-permissoes',
  short: 'Permissões',
  title: 'Permissões: quem pode ler, escrever e executar',
  lead: 'Cada arquivo diz o que o dono, o grupo e os outros podem fazer com ele. É o que protege um servidor inteiro.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Lendo o ls -l' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'ls -l notas.txt' },
    { t: 'out', file: 'saida', x: '-rwxr-xr-- 1 viajante devs 0 set 29 10:00 notas.txt' },
    {
      t: 'table',
      cols: ['Parte', 'Quer dizer'],
      rows: [
        ['-', 'Tipo: arquivo comum (d seria pasta)'],
        ['rwx', 'Dono (viajante): ler, escrever, executar'],
        ['r-x', 'Grupo (devs): ler e executar'],
        ['r--', 'Outros: só ler'],
      ],
      mac: false,
    },
    { t: 'h', x: 'Mudando com chmod' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'chmod +x script.sh       # todos podem executar\nchmod u=rwx,g=rx,o= app  # dono tudo, grupo lê e executa, outros nada\nchmod 754 notas.txt      # o mesmo que rwxr-xr--' },
    {
      t: 'cards',
      items: [
        { h: 'Números', x: 'r = 4, w = 2, x = 1. Some por grupo: rwx = 7, r-x = 5, r-- = 4.' },
        { h: 'chown', x: 'Muda o dono: <code>sudo chown ana notas.txt</code>.' },
        { h: 'sudo', x: 'Roda um comando como administrador (root). Use só quando precisar.' },
      ],
    },
    {
      t: 'note',
      k: 'chmod 777 não é solução',
      x: 'Dar todas as permissões para todo mundo "resolve" o erro na hora e abre uma porta enorme. Dê só a permissão necessária.',
      warn: true,
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Manual do GNU coreutils: <a href="https://www.gnu.org/software/coreutils/manual/html_node/chmod-invocation.html" target="_blank" rel="noopener">chmod</a>, <a href="https://www.gnu.org/software/coreutils/manual/html_node/File-permissions.html" target="_blank" rel="noopener">File permissions</a> e <a href="https://www.gnu.org/software/coreutils/manual/html_node/chown-invocation.html" target="_blank" rel="noopener">chown</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Em -rwxr-xr--, o que os "outros" (o último trio) podem fazer?',
      options: ['Tudo', 'Ler e executar', 'Só ler', 'Nada'],
      answer: 2,
      explain: 'r-- = só leitura.',
    },
    {
      id: 'q2',
      q: 'Quanto vale rwx em número?',
      options: ['3', '5', '7', '9'],
      answer: 2,
      explain: 'r (4) + w (2) + x (1) = 7.',
    },
    {
      id: 'q3',
      q: 'Seu script diz "Permissão negada" ao rodar ./script.sh. O que resolve do jeito certo?',
      options: ['chmod 777 script.sh', 'chmod +x script.sh', 'rm script.sh', 'sudo rm -r /'],
      answer: 1,
      explain: 'Falta a permissão de execução: chmod +x. Nada de 777.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: deixe o arquivo app com rwxr-x--- usando números.',
      pieces: ['chmod', '750', 'app'],
      distractors: ['777', 'chown', '+w'],
      explain: 'rwx = 7, r-x = 5, --- = 0: chmod 750 app.',
    },
  ],
};
