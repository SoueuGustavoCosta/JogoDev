import type { Module } from '@/domain/trail/types';

/** Trilha 2 do Cometa Git: add, commit e histórico. */
export const modGitcCommit: Module = {
  id: 'cometa-git-commit',
  short: 'add, commit e log',
  title: 'add, commit e o histórico',
  lead: 'Gravar uma versão tem dois passos: escolher o que entra (add) e gravar com uma mensagem (commit).',
  level: 'Base',
  blocks: [
    { t: 'flow', items: ['Você edita', 'git add (prepara)', 'git commit (grava)', 'git log (histórico)'] },
    { t: 'code', file: 'terminal', lang: 'bash', nolab: true, x: 'git status                     # o que mudou?\ngit add README.md              # prepara um arquivo\ngit add .                      # prepara tudo\ngit commit -m "Cria o README"  # grava a versão\ngit log --oneline              # uma linha por commit' },
    {
      t: 'cards',
      items: [
        { h: 'Staging area', x: 'A "área de preparo": o que você deu add e vai entrar no próximo commit.' },
        { h: 'Commit', x: 'Uma foto do projeto, com autor, data e mensagem. Cada um tem um código único (hash).' },
        { h: 'Mensagem', x: 'Diga o que mudou e por quê: "Corrige cálculo do frete", não "ajustes".' },
      ],
    },
    {
      t: 'try',
      engine: 'git',
      file: 'terminal — meu-projeto',
      brief: 'Grave o primeiro commit: inicie o repositório, prepare os arquivos e faça o commit com uma mensagem.',
      starter: 'git init\n',
      hint: 'Depois do git init: git add . e git commit -m "sua mensagem". Um comando por linha.',
      repo: 'projeto',
      mission: 'm2',
      solution: 'git init\ngit add .\ngit commit -m "primeiro commit"',
    },
    {
      t: 'note',
      k: 'Fonte oficial',
      x: 'Pro Git: <a href="https://git-scm.com/book/pt-br/v2/Fundamentos-de-Git-Gravando-Altera%C3%A7%C3%B5es-em-Seu-Reposit%C3%B3rio" target="_blank" rel="noopener">Gravando alterações em seu repositório</a> e <a href="https://git-scm.com/docs/git-commit" target="_blank" rel="noopener">git-commit</a>.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'O que faz o git add?',
      options: ['Grava a versão', 'Prepara a mudança para o próximo commit', 'Envia para o GitHub', 'Apaga o arquivo'],
      answer: 1,
      explain: 'add coloca na staging area; commit grava.',
    },
    {
      id: 'q2',
      q: 'Qual mensagem de commit é mais útil?',
      options: ['ajustes', 'Corrige o cálculo do frete para o Norte', 'aaaa', 'commit'],
      answer: 1,
      explain: 'Diga o que mudou, para você (e o time) entender meses depois.',
    },
    {
      id: 'q3',
      q: 'Qual comando mostra o histórico com uma linha por commit?',
      options: ['git status', 'git log --oneline', 'git show all', 'git history'],
      answer: 1,
      explain: 'git log --oneline.',
    },
    {
      id: 'desafio',
      kind: 'order',
      q: 'Desafio: grave um commit com a mensagem "Cria o README".',
      pieces: ['git commit', '-m', '"Cria o README"'],
      distractors: ['git add', '--message-all', 'git push'],
      explain: 'git commit -m "mensagem".',
    },
  ],
};
