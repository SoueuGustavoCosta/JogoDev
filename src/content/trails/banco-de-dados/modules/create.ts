import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "CREATE DATABASE e TABLE").
 */
export const modCreate: Module = {
  id: "create",
  short: "CREATE DATABASE e TABLE",
  title: "CREATE DATABASE e CREATE TABLE",
  lead: "Chegou a hora de construir: primeiro o banco, depois as tabelas.",
  level: "Base",
  blocks: [
    { t: 'h', x: "1. Criando o banco" },
    { t: 'code', file: "01_criar_banco.sql", x: "-- cria um banco vazio chamado loja_dev\nCREATE DATABASE loja_dev;\n\n-- no psql, entre nele:\n-- \\c loja_dev" },
    { t: 'note', k: "No pgAdmin", x: "Clique com o botão direito em <b>Databases</b>, escolha <b>Create → Database</b>, digite o nome e salve. Mesmo resultado, sem código." },
    { t: 'h', x: "2. Criando tabelas" },
    { t: 'p', x: "Dentro do banco, cada tabela descreve uma \"coisa\" do mundo real: categorias, produtos, clientes. Cada coluna tem <b>nome</b>, <b>tipo</b> e, se preciso, <b>regras</b>." },
    { t: 'code', file: "02_criar_tabelas.sql", x: "CREATE TABLE categorias (\n    id    SERIAL PRIMARY KEY,\n    nome  VARCHAR(60) NOT NULL UNIQUE\n);\n\nCREATE TABLE produtos (\n    id            SERIAL PRIMARY KEY,\n    nome          VARCHAR(120) NOT NULL,\n    descricao     TEXT,\n    preco         NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),\n    estoque       INTEGER NOT NULL DEFAULT 0,\n    ativo         BOOLEAN DEFAULT TRUE,\n    criado_em     TIMESTAMP DEFAULT NOW(),\n    categoria_id  INTEGER REFERENCES categorias (id)\n);" },
    { t: 'h', x: "As regras (constraints) em uma olhada" },
    { t: 'cards', items: [{"h":"PRIMARY KEY","x":"Identifica cada linha de forma única. Não repete e não pode ser vazia."},{"h":"NOT NULL","x":"A coluna é obrigatória. Sem valor, o banco recusa a linha."},{"h":"UNIQUE","x":"Não deixa dois registros com o mesmo valor, como dois e-mails iguais."},{"h":"DEFAULT","x":"Valor usado quando você não informa nada, como estoque 0."},{"h":"CHECK","x":"Uma condição que precisa ser verdadeira, como preço maior ou igual a zero."},{"h":"REFERENCES","x":"Chave estrangeira: aponta para uma linha de outra tabela. Veremos no módulo de relacionamentos."}] },
    { t: 'h', x: "Mudando e apagando" },
    { t: 'code', file: "03_alterar.sql", x: "-- adiciona uma coluna\nALTER TABLE produtos ADD COLUMN peso_kg NUMERIC(6, 2);\n\n-- apaga uma tabela inteira (sem volta!)\nDROP TABLE produtos;\n\n-- apaga o banco inteiro (sem volta!)\nDROP DATABASE loja_dev;" },
    { t: 'note', k: "Cuidado", x: "<code>DROP</code> apaga estrutura <b>e</b> dados, e não existe lixeira. Só use em bancos de estudo ou depois de ter um backup.", warn: true },
    { t: 'h', x: "Chaves compostas, nomes de restrições e ON DELETE" },
    { t: 'p', x: "Restrições também podem ser declaradas no fim da tabela e receber um nome, o que ajuda a entender mensagens de erro e a alterar depois. A cláusula <code>ON DELETE</code> diz o que fazer com as linhas filhas quando a linha pai é apagada." },
    { t: 'code', file: "05_matriculas.sql", x: "CREATE TABLE alunos (\n    id    SERIAL PRIMARY KEY,\n    nome  VARCHAR(80) NOT NULL\n);\n\nCREATE TABLE disciplinas (\n    id    SERIAL PRIMARY KEY,\n    nome  VARCHAR(80) NOT NULL\n);\n\n-- relação N:N com chave primária composta\nCREATE TABLE matriculas (\n    aluno_id       INTEGER NOT NULL,\n    disciplina_id  INTEGER NOT NULL,\n    nota           NUMERIC(4, 2),\n    CONSTRAINT pk_matriculas PRIMARY KEY (aluno_id, disciplina_id),\n    CONSTRAINT fk_mat_aluno  FOREIGN KEY (aluno_id)\n        REFERENCES alunos (id) ON DELETE CASCADE,\n    CONSTRAINT fk_mat_disc   FOREIGN KEY (disciplina_id)\n        REFERENCES disciplinas (id) ON DELETE RESTRICT,\n    CONSTRAINT ck_nota CHECK (nota BETWEEN 0 AND 10)\n);" },
    { t: 'cards', items: [{"h":"ON DELETE CASCADE","x":"Apagou o pai, apaga os filhos junto. Apagar um aluno remove as matrículas dele."},{"h":"ON DELETE RESTRICT","x":"Impede apagar o pai enquanto existirem filhos. Não dá para apagar uma disciplina com matrículas."},{"h":"ON DELETE SET NULL","x":"Apagou o pai, as FKs dos filhos viram NULL. A coluna precisa aceitar nulo."}] },
    { t: 'h', x: "A mesma ideia, dialetos diferentes" },
    { t: 'p', x: "A apostila da faculdade e muitos livros usam uma sintaxe genérica, com detalhes de MySQL, Oracle ou SQL Server. O PostgreSQL segue mais de perto o padrão SQL. Em prova, siga a sintaxe que o professor usa; no PostgreSQL, use a coluna da direita." },
    { t: 'table', cols: ["Conceito","Apostila / outros bancos","PostgreSQL"], rows: [["Numeração automática","<code>AUTO_INCREMENT</code> (MySQL)","<code>SERIAL</code> ou <code>GENERATED ALWAYS AS IDENTITY</code>"],["Mudar o tipo de uma coluna","<code>ALTER TABLE t MODIFY col tipo</code>","<code>ALTER TABLE t ALTER COLUMN col TYPE tipo</code>"],["Negar permissão","<code>DENY</code> (SQL Server)","Não existe. Use <code>REVOKE</code> e roles"],["Limitar linhas","<code>TOP n</code> (SQL Server)","<code>LIMIT n</code>"],["Juntar textos","<code>CONCAT()</code> ou <code>+</code>","<code>||</code> (ou <code>CONCAT()</code>)"],["Data e hora atuais","<code>GETDATE()</code> (SQL Server)","<code>NOW()</code> ou <code>CURRENT_TIMESTAMP</code>"],["Verdadeiro/falso","<code>TINYINT(1)</code> (MySQL)","<code>BOOLEAN</code> nativo"]], mac: false },
    { t: 'note', k: "Por que a apostila diz que CREATE DATABASE é DCL?", x: "Na verdade <code>CREATE DATABASE</code> é DDL (define estrutura). O que a apostila quer dizer é que só usuários com <b>permissão</b> podem executá-lo, e permissões são controladas pela DCL. No PostgreSQL, essa permissão é o atributo <code>CREATEDB</code> de um role." }
  ],
  quiz: [
    {
      q: "Complete o comando para criar um banco chamado loja:",
      fill: true,
      pre: "CREATE",
      post: "loja;",
      accept: ["database"],
      wrong: ["table", "index", "view"],
      placeholder: "?",
      explain: "CREATE DATABASE nome; cria o banco.",
    },
    {
      q: "Qual regra impede dois clientes com o mesmo e-mail?",
      options: ["NOT NULL","DEFAULT","UNIQUE","CHECK"],
      answer: 2,
      explain: "UNIQUE não aceita valores repetidos na coluna.",
    },
    {
      q: "O que faz a linha  estoque INTEGER NOT NULL DEFAULT 0 ?",
      options: ["Estoque é opcional e começa em 0","Estoque é obrigatório e, se não informado, vale 0","Estoque só aceita o número 0","Estoque é texto"],
      answer: 1,
      explain: "NOT NULL torna obrigatório e DEFAULT 0 preenche o valor quando você não informa.",
    },
    {
      q: "Ao apagar um aluno, você quer que as matrículas dele sumam automaticamente. Qual cláusula usar na FK?",
      options: ["ON DELETE RESTRICT","ON DELETE CASCADE","ON UPDATE CASCADE","UNIQUE"],
      answer: 1,
      explain: "CASCADE propaga a exclusão do pai para os filhos.",
    },
    {
      q: "Qual é o equivalente PostgreSQL do AUTO_INCREMENT do MySQL?",
      options: ["SERIAL / IDENTITY","TOP","DENY","MODIFY"],
      answer: 0,
      explain: "SERIAL (ou GENERATED ... AS IDENTITY) numera automaticamente as linhas.",
    }
  ],
};
