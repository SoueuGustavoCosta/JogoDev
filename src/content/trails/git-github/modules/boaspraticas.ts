import type { Module } from '@/domain/trail/types';

/**
 * Migrado de ilha_git_github.html (módulo "boaspraticas" — ".gitignore e o fluxo do dia a dia").
 */
export const modBoaspraticas: Module = {
  id: 'boaspraticas',
  short: 'Boas práticas',
  title: '.gitignore e o fluxo do dia a dia',
  lead: 'Os detalhes que separam um repositório organizado de uma bagunça de centenas de megabytes de arquivos gerados.',
  level: 'Avançado',
  blocks: [
    { t: 'h', x: 'O que nunca deveria entrar em um commit' },
    {
      t: 'ul',
      items: [
        'Senhas, chaves de API e outros segredos.',
        'Pastas geradas automaticamente, como <code>node_modules</code> ou <code>dist</code>.',
        'Arquivos pesados ou binários que não precisam de histórico linha a linha.',
        'Arquivos pessoais do seu editor, como <code>.vscode</code> ou <code>.DS_Store</code>.',
      ],
    },
    { t: 'code', file: '.gitignore', x: 'node_modules/\n.env\ndist/\n.DS_Store' },
    {
      t: 'note',
      k: 'Se você já commitou por engano',
      x: 'Adicionar algo ao <code>.gitignore</code> depois <b>não remove</b> o que já está no histórico. É preciso um comando à parte (<code>git rm --cached</code>) — e cuidado redobrado se o que vazou foi uma senha: nesse caso, ela precisa ser trocada, não só removida.',
    },
    { t: 'h', x: 'Um fluxo simples para usar hoje' },
    {
      t: 'ol',
      items: [
        'Crie um branch para cada tarefa ou funcionalidade nova.',
        'Faça commits pequenos e frequentes, cada um com uma mudança que faça sentido sozinha.',
        'Dê <code>git push</code> regularmente, para não acumular um histórico gigante sem backup.',
        'Ao terminar, abra um Pull Request para revisão antes de fundir na branch principal.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      q: 'Complete: qual arquivo especial diz ao Git quais arquivos e pastas ignorar?',
      fill: true,
      pre: '',
      post: '',
      accept: ['.gitignore'],
      wrong: ['.gitconfig', 'README.md', '.gitkeep'],
      placeholder: '.____',
      explain: 'O .gitignore lista padrões de arquivos que o Git nunca deve rastrear.',
    },
    {
      id: 'q2',
      q: 'Por que a pasta node_modules normalmente não deve ir para o repositório?',
      options: [
        'Porque o Git não aceita pastas com esse nome',
        'Porque ela é gerada automaticamente e pode ser recriada, além de pesar muito',
        'Porque é proibido por lei',
        'Porque trava o GitHub',
      ],
      answer: 1,
      explain: 'Se pode ser recriada com um comando de instalação, não precisa de histórico versionado.',
    },
    {
      id: 'q3',
      q: 'Qual é uma boa prática de mensagem de commit?',
      options: [
        'Escrever sempre "mudanças"',
        'Ser curta, no imperativo, e descrever o que a mudança faz',
        'Nunca escrever nada, deixar em branco',
        'Copiar a mensagem do commit anterior',
      ],
      answer: 1,
      explain: 'Uma mensagem clara economiza tempo de investigação no futuro.',
    },
  ],
};
