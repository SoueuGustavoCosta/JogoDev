import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Relacionamentos e JOIN").
 */
export const modJoin: Module = {
  id: "join",
  short: "Relacionamentos e JOIN",
  title: "Relacionamentos e JOIN",
  lead: "O \"relacional\" do banco relacional: tabelas conversando entre si por chaves.",
  level: "Intermediário",
  blocks: [
    { t: 'p', x: "Em vez de repetir o nome do cliente em cada pedido, guardamos o nome uma vez em <code>clientes</code> e, no pedido, só o <b>número</b> do cliente. Esse número é a <b>chave estrangeira</b> (FK): ela aponta para a chave primária (PK) de outra tabela." },
    { t: 'code', file: "11_clientes_pedidos.sql", x: "CREATE TABLE clientes (\n    id    SERIAL PRIMARY KEY,\n    nome  VARCHAR(100) NOT NULL,\n    email VARCHAR(150) UNIQUE\n);\n\nCREATE TABLE pedidos (\n    id          SERIAL PRIMARY KEY,\n    cliente_id  INTEGER NOT NULL REFERENCES clientes (id),\n    total       NUMERIC(10, 2) NOT NULL\n);" },
    { t: 'cards', items: [{"h":"1 : 1","x":"Uma pessoa tem um CPF e cada CPF é de uma pessoa."},{"h":"1 : N","x":"Um cliente faz vários pedidos, cada pedido é de um cliente. É o caso mais comum: a FK fica no lado \"N\"."},{"h":"N : N","x":"Alunos e disciplinas. Precisa de uma <b>tabela associativa</b> no meio, com duas FKs (ex.: <code>matriculas</code>)."}] },
    { t: 'h', x: "JOIN: juntando as tabelas na consulta" },
    { t: 'p', x: "Suponha estes dados: clientes Ana (1), Bruno (2) e Carla (3); pedidos 101 e 102 da Ana, e 103 do Bruno. A Carla ainda não comprou nada." },
    { t: 'code', file: "12_inner_join.sql", x: "SELECT c.nome, p.id AS pedido, p.total\nFROM clientes c\nINNER JOIN pedidos p\n    ON p.cliente_id = c.id;" },
    { t: 'table', cols: ["nome","pedido","total"], rows: [["Ana","101","250.00"],["Ana","102","80.00"],["Bruno","103","129.90"]], file: "INNER JOIN — só quem tem pedido" },
    { t: 'code', file: "13_left_join.sql", x: "SELECT c.nome, p.id AS pedido, p.total\nFROM clientes c\nLEFT JOIN pedidos p\n    ON p.cliente_id = c.id;" },
    { t: 'table', cols: ["nome","pedido","total"], rows: [["Ana","101","250.00"],["Ana","102","80.00"],["Bruno","103","129.90"],["Carla","NULL","NULL"]], file: "LEFT JOIN — todos os clientes" },
    { t: 'note', k: "Como lembrar", x: "<b>INNER JOIN</b> traz só o que combina dos dois lados. <b>LEFT JOIN</b> traz tudo da tabela da esquerda (<code>FROM</code>) e completa com NULL onde não achou par. As letras <code>c</code> e <code>p</code> são apelidos de tabela, para escrever menos." },
    { t: 'h', x: "Todos os tipos de junção" },
    { t: 'table', cols: ["Junção","Resultado"], rows: [["<code>INNER JOIN</code>","Só as linhas que combinam nos dois lados"],["<code>LEFT JOIN</code>","Tudo da esquerda; NULL onde a direita não combina"],["<code>RIGHT JOIN</code>","Tudo da direita; NULL onde a esquerda não combina"],["<code>FULL JOIN</code>","Tudo dos dois lados, combinando quando possível"],["<code>CROSS JOIN</code>","Todas as combinações possíveis (produto cartesiano), sem condição"]], mac: false },
    { t: 'h', x: "Autorrelacionamento: a tabela junta com ela mesma" },
    { t: 'p', x: "Para mostrar cada funcionário com o nome do seu gerente, a mesma tabela aparece duas vezes na consulta, com apelidos diferentes: <code>f</code> para o funcionário e <code>g</code> para o gerente." },
    { t: 'code', file: "14_self_join.sql", x: "CREATE TABLE funcionarios (\n    id          SERIAL PRIMARY KEY,\n    nome        VARCHAR(80) NOT NULL,\n    gerente_id  INTEGER REFERENCES funcionarios (id)\n);\n\nINSERT INTO funcionarios (nome, gerente_id) VALUES\n    ('Maria', NULL), ('João', 1), ('Paula', 1), ('Rui', 2);\n\nSELECT f.nome AS funcionario, g.nome AS gerente\nFROM funcionarios f\nLEFT JOIN funcionarios g ON g.id = f.gerente_id\nORDER BY f.id;" },
    { t: 'table', cols: ["funcionario","gerente"], rows: [["Maria","NULL"],["João","Maria"],["Paula","Maria"],["Rui","João"]], file: "Data Output — 4 linhas" }
  ],
  quiz: [
    {
      q: "Na tabela pedidos, a coluna cliente_id é...",
      options: ["Chave primária","Chave estrangeira","Um tipo de dado","Um índice"],
      answer: 1,
      explain: "Ela aponta para o id da tabela clientes: é uma chave estrangeira.",
    },
    {
      q: "Qual JOIN mostraria a Carla mesmo sem pedidos?",
      options: ["INNER JOIN","LEFT JOIN de clientes para pedidos","DROP JOIN","Nenhum"],
      answer: 1,
      explain: "LEFT JOIN mantém todas as linhas da tabela da esquerda.",
    },
    {
      q: "Alunos fazem várias disciplinas e disciplinas têm vários alunos. Como modelar?",
      options: ["Uma coluna com lista de disciplinas no aluno","Uma tabela associativa entre alunos e disciplinas","Duas tabelas idênticas","Não é possível"],
      answer: 1,
      explain: "Relações N:N viram uma tabela no meio, com FK para cada lado.",
    },
    {
      q: "Em um autorrelacionamento (funcionário e seu gerente), como o SQL resolve?",
      options: ["Com dois bancos de dados","Com UNION","Com um JOIN da tabela com ela mesma, usando apelidos","Não é possível"],
      answer: 2,
      explain: "A mesma tabela é usada duas vezes no FROM, com apelidos diferentes, ligadas pela FK.",
    }
  ],
};
