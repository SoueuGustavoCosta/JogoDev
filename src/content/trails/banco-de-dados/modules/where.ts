import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "WHERE, ORDER BY, LIMIT").
 */
export const modWhere: Module = {
  id: "where",
  short: "WHERE, ORDER BY, LIMIT",
  title: "Filtrando: WHERE, ORDER BY e LIMIT",
  lead: "Ninguém quer todas as linhas. Vamos pedir só o que interessa, na ordem que interessa.",
  level: "Intermediário",
  blocks: [
    { t: 'code', file: "07_filtrar.sql", x: "SELECT nome, preco\nFROM produtos\nWHERE preco < 200\nORDER BY preco DESC\nLIMIT 5;" },
    { t: 'table', cols: ["nome","preco"], rows: [["Teclado Compacto","179.90"],["Mouse Gamer","129.90"]], file: "Data Output — 2 linhas" },
    { t: 'p', x: "<code>WHERE</code> filtra as linhas, <code>ORDER BY</code> ordena (<code>ASC</code> crescente, <code>DESC</code> decrescente) e <code>LIMIT</code> corta a quantidade." },
    { t: 'h', x: "Os operadores do dia a dia" },
    { t: 'table', cols: ["Operador","Significa","Exemplo"], rows: [["=  &lt;&gt;  &gt;  &lt;  &gt;=  &lt;=","Comparações (<code>&lt;&gt;</code> é \"diferente\")","<code>WHERE estoque &lt;&gt; 0</code>"],["AND / OR / NOT","Combinar condições","<code>WHERE preco &lt; 200 AND estoque &gt; 0</code>"],["BETWEEN","Dentro de uma faixa (inclusive)","<code>WHERE preco BETWEEN 100 AND 300</code>"],["IN","Igual a um da lista","<code>WHERE categoria_id IN (1, 2)</code>"],["LIKE / ILIKE","Padrão de texto. <code>%</code> vale por qualquer coisa. ILIKE ignora maiúsculas","<code>WHERE nome LIKE 'Teclado%'</code>"],["IS NULL","Valor ausente","<code>WHERE descricao IS NULL</code>"]], mac: false },
    { t: 'note', k: "Pegadinha clássica", x: "<code>NULL</code> significa \"desconhecido\", então nada é igual a ele, nem outro NULL. Escreva <code>IS NULL</code> ou <code>IS NOT NULL</code>. <code>= NULL</code> nunca retorna nada.", warn: true },
    { t: 'code', file: "08_like.sql", x: "SELECT nome, estoque\nFROM produtos\nWHERE nome LIKE 'Teclado%'\nORDER BY nome;" },
    { t: 'table', cols: ["nome","estoque"], rows: [["Teclado Compacto","0"],["Teclado Mecânico","15"]], file: "Data Output — 2 linhas" },
    { t: 'h', x: "DISTINCT e paginação com OFFSET" },
    { t: 'code', file: "09_distinct.sql", x: "-- categorias que realmente têm produtos, sem repetir\nSELECT DISTINCT categoria_id\nFROM produtos\nORDER BY categoria_id;\n\n-- paginação: pula 2 linhas e mostra as 2 seguintes\nSELECT nome\nFROM produtos\nORDER BY id\nLIMIT 2 OFFSET 2;" },
    { t: 'table', cols: ["categoria_id"], rows: [["1"],["2"],["3"]], file: "Data Output — DISTINCT" },
    { t: 'table', cols: ["nome"], rows: [["Monitor 24 pol"],["Teclado Compacto"]], file: "Data Output — LIMIT 2 OFFSET 2" },
    { t: 'h', x: "AND vence OR: use parênteses" },
    { t: 'p', x: "O SQL avalia <code>AND</code> antes de <code>OR</code>, igual à multiplicação antes da soma. Sem parênteses, o resultado pode surpreender." },
    { t: 'code', file: "10_precedencia.sql", x: "-- lê-se: categoria 1  OU  (categoria 2 E com estoque)\nSELECT nome, estoque\nFROM produtos\nWHERE categoria_id = 1 OR categoria_id = 2 AND estoque > 0\nORDER BY id;\n\n-- com parênteses: (categoria 1 OU 2)  E  com estoque\nSELECT nome, estoque\nFROM produtos\nWHERE (categoria_id = 1 OR categoria_id = 2) AND estoque > 0\nORDER BY id;" },
    { t: 'table', cols: ["nome","estoque"], rows: [["Teclado Mecânico","15"],["Mouse Gamer","40"],["Teclado Compacto","0"]], file: "Sem parênteses — 3 linhas" },
    { t: 'table', cols: ["nome","estoque"], rows: [["Teclado Mecânico","15"],["Mouse Gamer","40"]], file: "Com parênteses — 2 linhas" }
  ],
  quiz: [
    {
      q: "Com os 4 produtos que inserimos, qual produto volta em  WHERE estoque = 0 ?",
      options: ["Mouse Gamer","Teclado Mecânico","Teclado Compacto","Monitor 24 pol"],
      answer: 2,
      explain: "Só o Teclado Compacto foi cadastrado com estoque 0.",
    },
    {
      q: "Como procurar produtos sem descrição preenchida?",
      options: ["WHERE descricao = NULL","WHERE descricao IS NULL","WHERE descricao = ''","WHERE NOT descricao"],
      answer: 1,
      explain: "NULL só se compara com IS NULL / IS NOT NULL.",
    },
    {
      q: "O que faz  ORDER BY preco DESC  ?",
      options: ["Ordena do menor para o maior","Ordena do maior para o menor","Remove os preços","Descreve a tabela"],
      answer: 1,
      explain: "DESC é decrescente: do maior para o menor.",
    },
    {
      q: "Com os nossos produtos, quantas linhas retorna  WHERE categoria_id = 1 OR categoria_id = 2 AND estoque > 0 ?",
      options: ["2","4","3","1"],
      answer: 2,
      explain: "AND é avaliado primeiro: categoria 1 inteira (2 produtos, mesmo o de estoque 0) mais o Mouse Gamer (categoria 2 com estoque) dão 3.",
    }
  ],
};
