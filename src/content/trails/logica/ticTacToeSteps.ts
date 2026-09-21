import type { Step } from '@/domain/ticTacToe';

/**
 * As lacunas dos 5 passos do Estudo Dirigido do farol "velha", extraídas literalmente
 * dos blocos `code` do módulo (ver modules/velha.ts) — mesmo código, mesmos comentários
 * como dica de cada `___`. É o que alimenta o widget jogável `TicTacToeStudyWidget`.
 */
export const ticTacToeSteps: Step[] = [
  {
    id: 'limpeza',
    title: 'Passo 1 — limpeza()',
    blanks: [
      { hint: "tabuleiro vazio: array_fill(0, LIM, array_fill(0, LIM, '0'))", accept: ["array_fill(0, LIM, array_fill(0, LIM, '0'))"] },
      { hint: 'vitória começa em', accept: ['0'] },
      { hint: 'empate começa em', accept: ['0'] },
    ],
  },
  {
    id: 'posicao',
    title: 'Passo 2 — posicao($l, $c)',
    blanks: [
      { hint: 'operador de "diferente de"', accept: ['!=='] },
      { hint: 'casa ocupada devolve', accept: ['1'] },
      { hint: 'casa livre devolve', accept: ['0'] },
    ],
  },
  {
    id: 'velha',
    title: 'Passo 3 — velha($jog)',
    blanks: [
      { hint: 'índice da 3ª coluna da linha (t[i][?])', accept: ['2'] },
      { hint: 'índice da 2ª linha da coluna (t[?][i])', accept: ['1'] },
      { hint: 'terceira casa da diagonal secundária', accept: ['$t[1][1] == $jog', 't[1][1] == $jog', '$t[1][1]==$jog'] },
      { hint: 'sem vitória, devolve', accept: ['0'] },
    ],
  },
  {
    id: 'maquinaJoga',
    title: 'Passo 4 — maquinaJoga()',
    blanks: [
      { hint: 'maior índice de linha/coluna (LIM-1)', accept: ['2'] },
      { hint: 'posicao() diz "ocupada" quando devolve', accept: ['1'] },
      { hint: 'marca da máquina', accept: ['MAQUINA', "'M'", 'M'] },
      { hint: 'vitória da máquina vale', accept: ['2'] },
    ],
  },
  {
    id: 'livres',
    title: 'Passo 5 — livres() (caça ao bug)',
    blanks: [
      { hint: 'casa livre guarda', accept: ["'0'", '0'] },
      { hint: 'conta mais uma casa livre', accept: ['$n++', 'n++'] },
      { hint: 'tabuleiro cheio quando livres() devolve', accept: ['0'] },
    ],
  },
];
