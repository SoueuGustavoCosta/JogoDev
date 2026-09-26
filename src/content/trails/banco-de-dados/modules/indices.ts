import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Índices e desempenho").
 */
export const modIndices: Module = {
  id: "indices",
  short: "Índices e desempenho",
  title: "Índices e desempenho",
  lead: "Como o banco acha uma linha entre milhões sem ler tudo, e como você enxerga o que ele está fazendo.",
  level: "Avançado",
  blocks: [
    { t: 'p', x: "Sem índice, para achar um cliente por e-mail o banco lê a tabela inteira, linha por linha (<b>varredura sequencial</b>). Um <b>índice</b> é como o índice remissivo de um livro: uma estrutura auxiliar ordenada que aponta direto para o lugar certo." },
    { t: 'p', x: "O tipo padrão do PostgreSQL é a <b>B-tree</b>, uma árvore balanceada que encontra qualquer valor em poucos passos, mesmo com milhões de linhas." },
    { t: 'code', file: "18_indice.sql", x: "CREATE INDEX idx_clientes_nome\n    ON clientes (nome);\n\n-- índice único: além de acelerar, impede repetição\nCREATE UNIQUE INDEX idx_produtos_nome\n    ON produtos (nome);" },
    { t: 'h', x: "Veja o índice trabalhando com EXPLAIN" },
    { t: 'p', x: "<code>EXPLAIN</code> mostra o <b>plano de execução</b>: o caminho que o banco escolheu. Rode este bloco no laboratório. Ele cria 50 mil linhas de teste, pede o plano sem índice, cria o índice e pede o plano de novo." },
    { t: 'code', file: "19_explain.sql", x: "CREATE TABLE teste_indice AS\nSELECT g AS id, 'cliente ' || g AS nome\nFROM generate_series(1, 50000) AS g;\n\nANALYZE teste_indice;\n\nEXPLAIN SELECT * FROM teste_indice WHERE id = 25000;\n\nCREATE INDEX idx_teste_id ON teste_indice (id);\n\nEXPLAIN SELECT * FROM teste_indice WHERE id = 25000;" },
    { t: 'p', x: "Antes do índice o plano começa com <code>Seq Scan</code> (lê tudo). Depois, aparece <code>Index Scan</code> ou <code>Bitmap Index Scan</code> usando <code>idx_teste_id</code>. Use <code>EXPLAIN ANALYZE</code> para executar de verdade e ver o tempo real." },
    { t: 'h', x: "Quando criar e quando evitar" },
    { t: 'cards', items: [{"h":"Vale a pena","x":"Colunas muito usadas em <code>WHERE</code>, em <code>JOIN</code> (as FKs!) e em <code>ORDER BY</code>, em tabelas grandes e com valores bem variados."},{"h":"Evite","x":"Tabelas pequenas, colunas com poucos valores diferentes (como sexo ou ativo/inativo) e tabelas com muita escrita: cada INSERT e UPDATE também precisa atualizar os índices."}] },
    { t: 'table', cols: ["Tipo de índice","Bom para"], rows: [["B-tree (padrão)","Igualdade, faixas (<code>&lt;</code>, <code>BETWEEN</code>) e ordenação"],["Hash","Só igualdade"],["GIN","JSONB, arrays e busca em texto"],["GiST / BRIN","Dados geográficos e colunas muito ordenadas, como datas em logs"]], mac: false },
    { t: 'note', k: "Índice composto", x: "Em <code>(sobrenome, nome)</code>, a ordem importa: o índice serve para buscas por sobrenome ou por sobrenome e nome, mas não ajuda em buscas só por nome." }
  ],
  quiz: [
    {
      id: 'q1',
      q: "Complete para acelerar as buscas de clientes por nome:",
      fill: true,
      pre: "CREATE",
      post: "idx_clientes_nome\n  ON clientes (nome);",
      accept: ["INDEX"],
      wrong: ["TABLE", "VIEW", "BACKUP"],
      placeholder: "?",
      explain: "O índice permite achar linhas sem ler a tabela inteira.",
    },
    {
      id: 'q2',
      q: "Qual é o principal custo de ter muitos índices?",
      options: ["Deixam as leituras lentas","Deixam INSERT, UPDATE e DELETE mais lentos e ocupam espaço","Impedem JOINs","Apagam dados"],
      answer: 1,
      explain: "Toda escrita precisa atualizar também os índices.",
    },
    {
      id: 'q3',
      q: "Complete para ver o plano de execução da consulta:",
      fill: true,
      pre: "",
      post: "SELECT * FROM clientes WHERE nome = 'Ana';",
      accept: ["EXPLAIN"],
      wrong: ["SHOW PLAN", "DESCRIBE", "PROFILE"],
      placeholder: "?",
      explain: "EXPLAIN mostra como o banco pretende executar. EXPLAIN ANALYZE executa e mede.",
    },
    {
      id: 'q4',
      q: "Em qual coluna um índice traz MENOS benefício?",
      options: ["Uma FK muito usada em JOIN","Um e-mail único","Uma coluna ativo (só true ou false) em tabela pequena","Uma data usada em ORDER BY"],
      answer: 2,
      explain: "Poucos valores diferentes e tabela pequena: ler tudo já é barato.",
    }
  ],
};
