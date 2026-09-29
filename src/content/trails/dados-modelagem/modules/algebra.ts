import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Álgebra relacional").
 */
export const modAlgebra: Module = {
  id: "algebra",
  short: "Álgebra relacional",
  title: "Álgebra relacional: a matemática por trás do SQL",
  lead: "Toda consulta SQL é, no fundo, uma expressão de álgebra relacional. Entender isso deixa você pensar consultas como quem monta blocos.",
  level: "Intermediário",
  blocks: [
    { t: 'p', x: "A álgebra relacional é um conjunto de operações que recebem uma ou duas relações e devolvem <b>outra relação</b>. Como o resultado também é uma relação, dá para combinar operações, uma dentro da outra. O otimizador do PostgreSQL usa essa base para reescrever e acelerar as suas consultas." },
    { t: 'table', cols: ["Operação","Símbolo","Em SQL","Faz"], rows: [["Seleção","σ (sigma)","<code>WHERE</code>","Escolhe <b>linhas</b> que satisfazem um predicado"],["Projeção","π (pi)","<code>SELECT colunas</code> (<code>DISTINCT</code>)","Escolhe <b>colunas</b>"],["Renomeação","ρ (rô)","<code>AS</code>","Dá outro nome à relação ou ao atributo"],["União","∪","<code>UNION</code>","Linhas de uma ou de outra, sem repetir"],["Diferença","−","<code>EXCEPT</code>","Linhas que estão na primeira e não na segunda"],["Interseção","∩","<code>INTERSECT</code>","Linhas que estão nas duas"],["Produto cartesiano","×","<code>CROSS JOIN</code>","Todas as combinações entre as linhas"],["Junção","⋈","<code>JOIN ... ON</code>","Produto cartesiano seguido de seleção pela condição"],["Divisão","÷","<code>NOT EXISTS</code> duplo","\"Quem se relaciona com todos os...\""]], mac: false },
    { t: 'h', x: "Lendo e escrevendo expressões" },
    { t: 'p', x: "<code>σ estoque = 0 (PRODUTOS)</code> lê-se: \"da relação PRODUTOS, selecione as tuplas com estoque igual a 0\". Para combinar: <code>π nome, preco ( σ preco &lt; 200 (PRODUTOS) )</code> primeiro filtra as linhas (σ), depois fica só com duas colunas (π). Em SQL, as duas ideias aparecem juntas no mesmo comando:" },
    { t: 'code', file: "15_sigma_pi.sql", x: "-- π nome, preco ( σ preco < 200 (PRODUTOS) )\nSELECT nome, preco\nFROM produtos\nWHERE preco < 200;" },
    { t: 'h', x: "Operações de conjuntos" },
    { t: 'p', x: "<code>UNION</code>, <code>EXCEPT</code> e <code>INTERSECT</code> só funcionam entre relações <b>compatíveis</b>: o mesmo número de colunas, na mesma ordem, com tipos parecidos." },
    { t: 'code', file: "16_conjuntos.sql", x: "-- União: produtos esgotados OU caros\nSELECT nome FROM produtos WHERE estoque = 0\nUNION\nSELECT nome FROM produtos WHERE preco > 500\nORDER BY nome;\n\n-- Diferença: π nome (clientes) − π nome (clientes com pedido)\nSELECT nome FROM clientes\nEXCEPT\nSELECT c.nome\nFROM clientes c\nJOIN pedidos p ON p.cliente_id = c.id;" },
    { t: 'table', cols: ["nome"], rows: [["Monitor 24 pol"],["Teclado Compacto"]], file: "UNION — 2 linhas" },
    { t: 'table', cols: ["nome"], rows: [["Carla"]], file: "EXCEPT — 1 linha" },
    { t: 'note', k: "Não é comutativa", x: "Na diferença a ordem importa: <b>A − B</b> é diferente de <b>B − A</b>. Já a união e a interseção não dependem da ordem. E <code>UNION</code> elimina duplicatas; <code>UNION ALL</code> mantém." },
    { t: 'h', x: "Produto cartesiano: a origem do JOIN" },
    { t: 'p', x: "Se A = {1, 2} e B = {3, 5, 7}, então A × B tem <code>2 × 3 = 6</code> pares. Regra geral: <code>n(A × B) = n(A) · n(B)</code>. Ele cresce rápido: duas tabelas de 1 milhão de linhas dariam 1 trilhão de combinações. Por isso, na prática, você quase sempre usa um JOIN com condição." },
    { t: 'code', file: "17_cartesiano.sql", x: "SELECT a.n AS a, b.n AS b\nFROM (VALUES (1), (2)) AS a(n)\nCROSS JOIN (VALUES (3), (5), (7)) AS b(n)\nORDER BY a, b;" },
    { t: 'table', cols: ["a","b"], rows: [["1","3"],["1","5"],["1","7"],["2","3"],["2","5"],["2","7"]], file: "CROSS JOIN — 6 linhas" }
  ],
  quiz: [
    {
      id: 'q1',
      afterBlock: 4,
      q: "A seleção σ preco < 200 (PRODUTOS) da álgebra relacional vira qual cláusula do SQL?",
      fill: true,
      pre: "SELECT * FROM produtos",
      post: "preco < 200;",
      accept: ["WHERE"],
      wrong: ["FROM", "ORDER BY", "GROUP BY"],
      placeholder: "?",
      explain: "Seleção (σ) escolhe linhas por um predicado: é o WHERE. Projeção (π) escolhe colunas: é a lista do SELECT.",
    },
    {
      id: 'q2',
      afterBlock: 13,
      kind: "output",
      q: "A tem 4 linhas e B tem 5. O que aparece?",
      lang: "sql",
      code: "SELECT COUNT(*)\nFROM (VALUES (1), (2), (3), (4)) AS a(n)\nCROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS b(n);",
      options: ["9", "5", "20", "4"],
      answer: 2,
      explain: "n(A × B) = n(A) · n(B) = 4 · 5 = 20: o produto cartesiano junta cada linha de A com cada linha de B.",
    },
    {
      id: 'q3',
      q: "Para dois SELECTs poderem ser unidos com UNION, é preciso que...",
      options: ["Venham da mesma tabela","Tenham o mesmo número de colunas e tipos compatíveis","Tenham o mesmo nome de coluna","Não tenham WHERE"],
      answer: 1,
      explain: "As relações precisam ser compatíveis: mesmo grau e domínios parecidos, na mesma ordem.",
    },
    {
      id: 'q4',
      q: "Complete para obter os ids de clientes que NUNCA fizeram pedido:",
      fill: true,
      pre: "SELECT id FROM clientes",
      post: "SELECT cliente_id FROM pedidos;",
      accept: ["EXCEPT"],
      wrong: ["UNION", "INTERSECT", "CROSS JOIN"],
      placeholder: "?",
      explain: "Diferença: todos os clientes menos os que têm pedido.",
    },
  ],
};
