import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "INSERT e SELECT").
 */
export const modInsert: Module = {
  id: "insert",
  short: "INSERT e SELECT",
  title: "INSERT e SELECT: guardar e perguntar",
  lead: "Com as tabelas prontas, vamos colocar dados dentro e fazer as primeiras perguntas.",
  level: "Intermediário",
  blocks: [
    { t: 'h', x: "Inserindo linhas" },
    { t: 'code', file: "04_inserir.sql", x: "INSERT INTO categorias (nome)\nVALUES ('Teclados'), ('Mouses'), ('Monitores');\n\nINSERT INTO produtos (nome, preco, estoque, categoria_id)\nVALUES\n    ('Teclado Mecânico', 249.90, 15, 1),\n    ('Mouse Gamer',      129.90, 40, 2),\n    ('Monitor 24 pol',   899.00,  8, 3),\n    ('Teclado Compacto', 179.90,  0, 1);" },
    { t: 'p', x: "Repare que <code>id</code> ficou de fora: o <code>SERIAL</code> preenche sozinho. A ordem dos valores segue a ordem das colunas listadas." },
    { t: 'h', x: "Lendo dados" },
    { t: 'code', file: "05_consultar.sql", x: "SELECT nome, preco\nFROM produtos;" },
    { t: 'table', cols: ["nome","preco"], rows: [["Teclado Mecânico","249.90"],["Mouse Gamer","129.90"],["Monitor 24 pol","899.00"],["Teclado Compacto","179.90"]], file: "Data Output — 4 linhas" },
    { t: 'p', x: "<code>SELECT</code> diz <b>quais colunas</b> você quer e <code>FROM</code> diz <b>de qual tabela</b>. Com <code>SELECT *</code> você pede todas as colunas, útil para explorar mas evite em sistemas reais." },
    { t: 'h', x: "Apelidos e contas" },
    { t: 'code', file: "06_apelidos.sql", x: "SELECT\n    nome AS produto,\n    ROUND(preco * 1.10, 2) AS preco_reajustado\nFROM produtos;" },
    { t: 'table', cols: ["produto","preco_reajustado"], rows: [["Teclado Mecânico","274.89"],["Mouse Gamer","142.89"],["Monitor 24 pol","988.90"],["Teclado Compacto","197.89"]], file: "Data Output — 4 linhas" },
    { t: 'note', k: "Detalhe", x: "<code>AS</code> renomeia a coluna só no resultado, sem mexer na tabela. <code>ROUND(valor, 2)</code> arredonda para 2 casas decimais." }
  ],
  quiz: [
    {
      q: "Por que o id não aparece no INSERT de produtos?",
      options: ["Porque o id é proibido","Porque o SERIAL preenche o id sozinho","Porque o id é sempre zero","Porque é um erro do exemplo"],
      answer: 1,
      explain: "SERIAL gera 1, 2, 3... automaticamente.",
    },
    {
      q: "Qual consulta traz apenas as colunas nome e preco?",
      options: ["SELECT nome, preco FROM produtos;","SELECT produtos FROM nome, preco;","GET nome, preco IN produtos;","FROM produtos SELECT *;"],
      answer: 0,
      explain: "A ordem é sempre SELECT (o quê) e FROM (de onde).",
    },
    {
      q: "Para que serve o AS em  nome AS produto ?",
      options: ["Apagar a coluna","Somar valores","Dar um apelido à coluna no resultado","Ordenar o resultado"],
      answer: 2,
      explain: "AS cria um apelido (alias) que só existe no resultado da consulta.",
    }
  ],
};
