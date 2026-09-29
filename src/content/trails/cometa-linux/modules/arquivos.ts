import type { Module } from '@/domain/trail/types';

/** Trilha 2 do Cometa Linux: arquivos e pastas. */
export const modLinuxArquivos: Module = {
  id: 'linux-arquivos',
  short: 'Arquivos e pastas',
  title: 'Arquivos e pastas: criar, copiar, mover e apagar',
  lead: 'Uns poucos comandos fazem tudo que você faria arrastando arquivos, só que mais rápido e dá para automatizar.',
  level: 'Base',
  blocks: [
    { t: 'h', x: 'Criar' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'mkdir projetos             # cria uma pasta\nmkdir -p projetos/a/b      # cria a pasta e as do meio, se faltarem\ntouch notas.txt            # cria um arquivo vazio' },
    { t: 'h', x: 'Copiar, mover, renomear' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'cp notas.txt copia.txt       # copia\ncp -r projetos backup        # copia uma pasta inteira\nmv copia.txt velhas.txt      # renomeia\nmv velhas.txt projetos/      # move para outra pasta' },
    { t: 'h', x: 'Ler' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'cat notas.txt       # mostra o arquivo inteiro\nhead -n 3 notas.txt # as 3 primeiras linhas\ntail -n 3 notas.txt # as 3 últimas' },
    { t: 'h', x: 'Apagar (com cuidado)' },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'rm notas.txt        # apaga o arquivo\nrm -r backup        # apaga a pasta e tudo dentro' },
    {
      t: 'note',
      k: 'Não tem lixeira',
      x: 'O <code>rm</code> apaga de vez: não passa pela lixeira. Confira o caminho antes de apertar Enter, principalmente com <code>-r</code>.',
      warn: true,
    },
    { t: 'say', x: 'mv serve para duas coisas: mover e renomear. Para o Linux, renomear é mover um arquivo para um nome novo.' },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Manual do GNU coreutils: <a href="https://www.gnu.org/software/coreutils/manual/html_node/mkdir-invocation.html" target="_blank" rel="noopener">mkdir</a>, <a href="https://www.gnu.org/software/coreutils/manual/html_node/cp-invocation.html" target="_blank" rel="noopener">cp</a>, <a href="https://www.gnu.org/software/coreutils/manual/html_node/mv-invocation.html" target="_blank" rel="noopener">mv</a> e <a href="https://www.gnu.org/software/coreutils/manual/html_node/rm-invocation.html" target="_blank" rel="noopener">rm</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Qual comando renomeia notas.txt para ideias.txt?',
      options: ['cp notas.txt ideias.txt', 'mv notas.txt ideias.txt', 'rename notas.txt', 'rm notas.txt ideias.txt'],
      answer: 1,
      explain: 'mv move, e mover para um nome novo é renomear.',
    },
    {
      id: 'q2',
      q: 'O que faz o -p em mkdir -p projetos/a/b?',
      options: ['Cria as pastas do meio que faltarem', 'Protege a pasta', 'Mostra o progresso', 'Apaga se já existir'],
      answer: 0,
      explain: 'Com -p ele cria o caminho inteiro e não reclama se já existir.',
    },
    {
      id: 'q3',
      q: 'Para onde vai um arquivo apagado com rm?',
      options: ['Para a lixeira', 'Para /tmp', 'Some de vez', 'Para a nuvem'],
      answer: 2,
      explain: 'rm não usa lixeira.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: copie a pasta projetos inteira para backup.',
      pieces: ['cp', '-r', 'projetos', 'backup'],
      distractors: ['mv', 'rm', '-p'],
      explain: 'cp -r copia a pasta com tudo dentro.',
    },
  ],
};
