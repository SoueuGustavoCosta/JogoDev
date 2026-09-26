import type { Module } from '@/domain/trail/types';

/**
 * Migrado de ilha_git_github.html (módulo "desfazer" — "Desfazendo erros").
 */
export const modDesfazer: Module = {
  id: 'desfazer',
  short: 'Desfazendo erros',
  title: 'Desfazendo: diff, reset, revert e stash',
  lead: 'Ninguém acerta sempre. O Git tem várias formas de voltar atrás — cada uma com um risco diferente.',
  level: 'Intermediário',
  blocks: [
    { t: 'h', x: 'Antes de desfazer, veja o que mudou' },
    { t: 'code', file: 'terminal — revisando antes de agir', x: 'git diff' },
    { t: 'h', x: 'Três formas de voltar atrás' },
    {
      t: 'cards',
      items: [
        { h: 'git restore', x: 'Desfaz uma mudança que ainda não foi commitada, devolvendo o arquivo ao último estado salvo.' },
        {
          h: 'git reset',
          x: 'Move o ponteiro do branch para um commit anterior. Reescreve o histórico — cuidado ao usar em algo já compartilhado.',
        },
        {
          h: 'git revert',
          x: 'Cria um novo commit que desfaz outro. Não apaga nada do histórico: é a forma segura para trabalho em equipe.',
        },
      ],
    },
    {
      t: 'note',
      k: 'Regra de ouro',
      warn: true,
      x: 'Nunca use <code>git reset --hard</code> em um branch que outras pessoas já baixaram (deram pull). Prefira sempre <code>git revert</code> nesse caso: ele desfaz sem reescrever a história de ninguém.',
    },
    { t: 'code', file: 'terminal — guardando mudanças no bolso', x: 'git stash\ngit stash pop' },
  ],
  quiz: [
    {
      id: 'q1',
      kind: "order",
      q: "O commit a1b2c3 já foi compartilhado com o time. Monte o comando seguro para desfazê-lo",
      pieces: ["git", "revert", "a1b2c3"],
      distractors: ["reset --hard"],
      explain: "<code>git revert</code> cria um commit novo que desfaz o anterior, sem reescrever o histórico que o time já tem. <code>reset --hard</code> apagaria história compartilhada.",
    },
    {
      id: 'q2',
      q: "Complete para guardar as mudanças não commitadas temporariamente, sem perdê-las:",
      fill: true,
      pre: "git",
      post: "",
      accept: ["stash"],
      wrong: ["reset", "rm", "push"],
      placeholder: "?",
      explain: "<code>git stash</code> guarda as mudanças numa gaveta; <code>git stash pop</code> traz de volta.",
    },
    {
      id: 'q3',
      q: 'Complete: qual comando mostra as diferenças linha a linha antes de commitar?',
      fill: true,
      pre: '',
      post: '',
      accept: ['git diff'],
      wrong: ['git log', 'git status', 'git add'],
      placeholder: 'git ...',
      explain: 'git diff mostra exatamente o que mudou, linha por linha.',
    },
  ],
};
