import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Subconsultas, CTE e janelas").
 */
export const modSubconsultas: Module = {
  id: "subconsultas",
  short: "Subconsultas, CTE e janelas",
  title: "Subconsultas, CTE, CASE e funções de janela",
  lead: "Consultas dentro de consultas, resultados temporários com nome e rankings sem perder as linhas.",
  level: "Intermediário",
  blocks: [
    { t: 'h', x: "Subconsulta: um SELECT dentro de outro" },
    { t: 'p', x: "Uma subconsulta responde uma pergunta menor para a consulta maior usar. Aqui: \"quais produtos custam mais que a média?\"" },
    { t: 'code', file: "18_subconsulta.sql", x: "SELECT nome, preco\nFROM produtos\nWHERE preco > (SELECT AVG(preco) FROM produtos);" },
    { t: 'table', cols: ["nome","preco"], rows: [["Monitor 24 pol","899.00"]], file: "Data Output — 1 linha" },
    { t: 'p', x: "A média é 364,68, então só o monitor passa. Subconsultas também funcionam com <code>IN</code> (pertence a uma lista) e <code>EXISTS</code> (existe ao menos uma linha):" },
    { t: 'code', file: "19_in_exists.sql", x: "-- clientes que já fizeram pedido\nSELECT nome FROM clientes\nWHERE id IN (SELECT cliente_id FROM pedidos)\nORDER BY nome;\n\n-- clientes que nunca fizeram pedido\nSELECT nome FROM clientes c\nWHERE NOT EXISTS (\n    SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id\n);" },
    { t: 'table', cols: ["nome"], rows: [["Ana"],["Bruno"]], file: "IN — 2 linhas" },
    { t: 'table', cols: ["nome"], rows: [["Carla"]], file: "NOT EXISTS — 1 linha" },
    { t: 'h', x: "CTE: dar nome a um resultado temporário" },
    { t: 'p', x: "Com <code>WITH</code>, você escreve o resultado intermediário primeiro e o usa depois, como se fosse uma tabela. O código fica na ordem em que você pensa." },
    { t: 'code', file: "20_cte.sql", x: "WITH gasto AS (\n    SELECT cliente_id, SUM(total) AS total_gasto\n    FROM pedidos\n    GROUP BY cliente_id\n)\nSELECT c.nome, g.total_gasto\nFROM clientes c\nJOIN gasto g ON g.cliente_id = c.id\nORDER BY g.total_gasto DESC;" },
    { t: 'table', cols: ["nome","total_gasto"], rows: [["Ana","330.00"],["Bruno","129.90"]], file: "Data Output — 2 linhas" },
    { t: 'h', x: "CASE: decisões dentro da consulta" },
    { t: 'code', file: "21_case.sql", x: "SELECT\n    nome,\n    CASE\n        WHEN estoque = 0 THEN 'Esgotado'\n        WHEN estoque < 10 THEN 'Baixo'\n        ELSE 'OK'\n    END AS situacao\nFROM produtos\nORDER BY id;" },
    { t: 'table', cols: ["nome","situacao"], rows: [["Teclado Mecânico","OK"],["Mouse Gamer","OK"],["Monitor 24 pol","Baixo"],["Teclado Compacto","Esgotado"]], file: "Data Output — 4 linhas" },
    { t: 'h', x: "Funções de janela: agregar sem juntar linhas" },
    { t: 'p', x: "Uma função de janela calcula algo sobre um conjunto de linhas <b>sem colapsá-las</b> como o <code>GROUP BY</code> faz. É a ferramenta dos rankings." },
    { t: 'code', file: "22_janela.sql", x: "SELECT\n    nome,\n    preco,\n    RANK() OVER (ORDER BY preco DESC) AS posicao\nFROM produtos\nORDER BY posicao;" },
    { t: 'table', cols: ["nome","preco","posicao"], rows: [["Monitor 24 pol","899.00","1"],["Teclado Mecânico","249.90","2"],["Teclado Compacto","179.90","3"],["Mouse Gamer","129.90","4"]], file: "Data Output — 4 linhas" }
  ],
  quiz: [
    {
      id: 'q1',
      q: "Qual palavra introduz uma CTE (resultado temporário com nome)?",
      options: ["CASE","WITH","OVER","EXISTS"],
      answer: 1,
      explain: "WITH nome AS ( ... ) define a CTE, que pode ser usada na consulta principal.",
    },
    {
      id: 'q2',
      q: "Qual a diferença central entre GROUP BY e uma função de janela?",
      options: ["Nenhuma","A janela mantém todas as linhas; o GROUP BY as agrupa","O GROUP BY é mais novo","A janela só funciona com texto"],
      answer: 1,
      explain: "GROUP BY colapsa em uma linha por grupo. A função de janela calcula sem perder as linhas.",
    },
    {
      id: 'q3',
      q: "O que faz  WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id) ?",
      options: ["Traz clientes que têm pedido","Traz clientes sem nenhum pedido","Apaga pedidos","Cria um índice"],
      answer: 1,
      explain: "NOT EXISTS mantém a linha quando a subconsulta não encontra nada: clientes sem pedidos.",
    }
  ],
};
