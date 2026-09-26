import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Agregações e GROUP BY").
 */
export const modAgg: Module = {
  id: "agg",
  short: "Agregações e GROUP BY",
  title: "Agregações e GROUP BY: transformando linhas em respostas",
  lead: "Quanto vendemos? Quantos pedidos por cliente? Agora o banco faz as contas por você.",
  level: "Intermediário",
  blocks: [
    { t: 'table', cols: ["Função","Faz"], rows: [["COUNT(*)","Conta linhas"],["SUM(col)","Soma"],["AVG(col)","Média"],["MIN(col) / MAX(col)","Menor / maior valor"]], mac: false },
    { t: 'code', file: "14_group_by.sql", x: "SELECT\n    c.nome,\n    COUNT(p.id)                AS qtd_pedidos,\n    COALESCE(SUM(p.total), 0)  AS gasto\nFROM clientes c\nLEFT JOIN pedidos p ON p.cliente_id = c.id\nGROUP BY c.nome\nORDER BY gasto DESC;" },
    { t: 'table', cols: ["nome","qtd_pedidos","gasto"], rows: [["Ana","2","330.00"],["Bruno","1","129.90"],["Carla","0","0"]], file: "Data Output — 3 linhas" },
    { t: 'p', x: "<code>GROUP BY</code> forma grupos (um por cliente) e as funções de agregação calculam dentro de cada grupo. <code>COALESCE(x, 0)</code> troca NULL por 0, por isso a Carla aparece com 0 e não vazia." },
    { t: 'h', x: "WHERE filtra linhas, HAVING filtra grupos" },
    { t: 'code', file: "15_having.sql", x: "SELECT cliente_id, SUM(total) AS gasto\nFROM pedidos\nWHERE total > 50\nGROUP BY cliente_id\nHAVING SUM(total) > 200;" },
    { t: 'h', x: "A ordem em que o banco pensa" },
    { t: 'p', x: "Você escreve <code>SELECT</code> primeiro, mas o banco <b>executa</b> nesta ordem. Isso explica por que <code>WHERE</code> não enxerga o resultado de <code>SUM</code>:" },
    { t: 'flow', items: ["FROM / JOIN","WHERE","GROUP BY","HAVING","SELECT","ORDER BY","LIMIT"] },
    { t: 'h', x: "Várias agregações de uma vez" },
    { t: 'code', file: "16_resumo.sql", x: "SELECT\n    COUNT(*)               AS produtos,\n    MIN(preco)             AS menor,\n    MAX(preco)             AS maior,\n    ROUND(AVG(preco), 2)   AS media\nFROM produtos;" },
    { t: 'table', cols: ["produtos","menor","maior","media"], rows: [["4","129.90","899.00","364.68"]], file: "Data Output — 1 linha" },
    { t: 'note', k: "NULL e agregações", x: "<code>COUNT(*)</code> conta linhas. <code>COUNT(coluna)</code> ignora as linhas em que a coluna é NULL, assim como <code>SUM</code>, <code>AVG</code>, <code>MIN</code> e <code>MAX</code>. E <code>COUNT(DISTINCT coluna)</code> conta valores diferentes." }
  ],
  quiz: [
    {
      id: 'q1',
      q: "Complete para contar quantas linhas existem:",
      fill: true,
      pre: "SELECT",
      post: "(*) FROM produtos;",
      accept: ["COUNT"],
      wrong: ["SUM", "AVG", "MAX"],
      placeholder: "?",
      explain: "COUNT(*) conta linhas.",
    },
    {
      id: 'q2',
      afterBlock: 5,
      q: "Você quer só os clientes que gastaram mais de 200 no total. Complete:",
      fill: true,
      pre: "SELECT cliente_id, SUM(total)\nFROM pedidos\nGROUP BY cliente_id",
      post: "SUM(total) > 200;",
      accept: ["HAVING"],
      wrong: ["WHERE", "LIMIT", "ORDER BY"],
      placeholder: "?",
      explain: "A soma só existe depois do GROUP BY, então o filtro vai no HAVING.",
    },
    {
      id: 'q3',
      kind: "order",
      q: "Monte a ordem em que o banco executa as partes de uma consulta",
      pieces: ["FROM / JOIN", "WHERE", "GROUP BY", "HAVING", "SELECT", "ORDER BY", "LIMIT"],
      explain: "O banco primeiro descobre de onde vêm as linhas (FROM e JOIN), filtra, agrupa, filtra os grupos, escolhe as colunas, ordena e só então corta.",
    },
    {
      id: 'q4',
      kind: "output",
      q: "A coluna descricao está NULL em todas as linhas de produtos. O que aparece?",
      lang: "sql",
      code: "SELECT COUNT(descricao) FROM produtos;",
      options: ["4", "1", "null", "0"],
      answer: 3,
      explain: "COUNT(coluna) ignora NULLs. Como todas são nulas, o resultado é 0. Já COUNT(*) daria 4.",
    },
  ],
};
