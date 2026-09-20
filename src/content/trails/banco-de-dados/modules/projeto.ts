import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Projeto final").
 */
export const modProjeto: Module = {
  id: "projeto",
  short: "Projeto final",
  title: "Projeto final: da ideia ao banco",
  lead: "Juntar tudo: partir de um problema em português e chegar a um banco modelado, normalizado, populado e consultado.",
  level: "Avançado",
  blocks: [
    { t: 'p', x: "Todo projeto de banco segue o mesmo caminho. Use esta lista como checklist em qualquer trabalho da faculdade ou do emprego:" },
    { t: 'table', cols: ["Etapa","O que fazer","Entrega"], rows: [["1. Requisitos","Conversar com quem vai usar. Que perguntas o sistema precisa responder?","Lista de requisitos"],["2. Modelo conceitual","Identificar entidades, atributos, relacionamentos e cardinalidades","DER"],["3. Modelo lógico","Mapear o DER para tabelas, PKs e FKs","Esquema relacional"],["4. Normalização","Chegar à 3FN (ou BCNF) e justificar qualquer redundância","Esquema revisado"],["5. Dicionário de dados","Documentar cada coluna: tipo, obrigatoriedade, regras","Dicionário"],["6. Modelo físico","Escrever o DDL com tipos, constraints e índices","Script <code>.sql</code>"],["7. Carga de dados","Popular com dados de teste realistas","INSERTs"],["8. Consultas","Responder as perguntas do passo 1 com SQL","Consultas e resultados"],["9. Segurança e backup","Roles com menor privilégio e rotina de backup","Permissões e plano"]], mac: false },
    { t: 'h', x: "Estudo de caso: biblioteca universitária" },
    { t: 'p', x: "<b>Requisitos:</b> a biblioteca tem livros; cada livro pode ter vários exemplares físicos. Alunos fazem empréstimos de exemplares, com data de retirada e de devolução. A bibliotecária quer saber quais exemplares estão emprestados, quais empréstimos estão atrasados e quais livros são mais emprestados." },
    { t: 'p', x: "<b>Entidades:</b> LIVRO, EXEMPLAR (entidade fraca: só existe por causa de um livro), ALUNO, EMPRÉSTIMO (associativa entre aluno e exemplar). <b>Relações:</b> LIVRO 1:N EXEMPLAR; ALUNO 1:N EMPRÉSTIMO; EXEMPLAR 1:N EMPRÉSTIMO. Rode no laboratório com o <b>Banco vazio</b>:" },
    { t: 'code', file: "biblioteca_ddl.sql", x: "CREATE TABLE livros (\n    id      SERIAL PRIMARY KEY,\n    titulo  VARCHAR(150) NOT NULL,\n    autor   VARCHAR(100) NOT NULL,\n    isbn    VARCHAR(20) UNIQUE\n);\n\nCREATE TABLE exemplares (\n    id        SERIAL PRIMARY KEY,\n    livro_id  INTEGER NOT NULL REFERENCES livros (id),\n    codigo    VARCHAR(20) NOT NULL UNIQUE\n);\n\nCREATE TABLE alunos (\n    id         SERIAL PRIMARY KEY,\n    nome       VARCHAR(100) NOT NULL,\n    matricula  VARCHAR(20) NOT NULL UNIQUE\n);\n\nCREATE TABLE emprestimos (\n    id            SERIAL PRIMARY KEY,\n    aluno_id      INTEGER NOT NULL REFERENCES alunos (id),\n    exemplar_id   INTEGER NOT NULL REFERENCES exemplares (id),\n    retirada      DATE NOT NULL DEFAULT CURRENT_DATE,\n    prazo         DATE NOT NULL,\n    devolucao     DATE,\n    CHECK (prazo >= retirada)\n);\n\nCREATE INDEX idx_emprestimos_exemplar ON emprestimos (exemplar_id);" },
    { t: 'code', file: "biblioteca_dados.sql", x: "INSERT INTO livros (titulo, autor, isbn) VALUES\n    ('Sistemas de Banco de Dados', 'Silberschatz', '978-0000000001'),\n    ('Projeto de Banco de Dados', 'Heuser', '978-0000000002');\n\nINSERT INTO exemplares (livro_id, codigo) VALUES (1, 'E-001'), (1, 'E-002'), (2, 'E-003');\n\nINSERT INTO alunos (nome, matricula) VALUES ('Ana', '2026001'), ('Bruno', '2026002');\n\nINSERT INTO emprestimos (aluno_id, exemplar_id, retirada, prazo, devolucao) VALUES\n    (1, 1, '2026-08-01', '2026-08-15', '2026-08-14'),\n    (1, 3, '2026-08-20', '2026-09-03', NULL),\n    (2, 1, '2026-09-01', '2026-09-15', NULL);" },
    { t: 'code', file: "biblioteca_consultas.sql", x: "-- exemplares emprestados agora (sem devolução)\nSELECT a.nome, l.titulo, e.codigo, em.prazo\nFROM emprestimos em\nJOIN alunos a      ON a.id = em.aluno_id\nJOIN exemplares e  ON e.id = em.exemplar_id\nJOIN livros l      ON l.id = e.livro_id\nWHERE em.devolucao IS NULL\nORDER BY em.prazo;\n\n-- livros mais emprestados\nSELECT l.titulo, COUNT(*) AS emprestimos\nFROM emprestimos em\nJOIN exemplares e ON e.id = em.exemplar_id\nJOIN livros l     ON l.id = e.livro_id\nGROUP BY l.titulo\nORDER BY emprestimos DESC;" },
    { t: 'note', k: "Sua vez", x: "Escolha um sistema que você conheça de verdade (almoxarifado, agenda de clínica, controle de medições, campeonato) e percorra as 9 etapas. Anote o DER, escreva o SQL e teste as consultas no laboratório. Esse projeto vira um item de portfólio." }
  ],
  quiz: [
    {
      q: "Na biblioteca, por que EXEMPLAR é considerada uma entidade fraca?",
      options: ["Porque tem poucos atributos","Porque só existe por causa de um livro","Porque não tem chave","Porque é opcional"],
      answer: 1,
      explain: "Um exemplar depende de um livro para existir: entidade fraca.",
    },
    {
      q: "Qual é a ordem correta das etapas de um projeto de banco?",
      options: ["DDL, DER, requisitos, normalização","Requisitos, DER, tabelas, normalização, DDL","Normalização, DDL, requisitos, DER","DER, DDL, requisitos, tabelas"],
      answer: 1,
      explain: "Do abstrato ao concreto: requisitos, modelo conceitual, lógico, normalização e só então o SQL.",
    },
    {
      q: "A tabela emprestimos liga alunos a exemplares. Que papel ela cumpre?",
      options: ["Entidade forte independente","Tabela associativa de uma relação N:N","Dicionário de dados","View"],
      answer: 1,
      explain: "Um aluno pega vários exemplares e um exemplar é pego por vários alunos ao longo do tempo: N:N resolvido por uma tabela associativa.",
    },
    {
      q: "Qual consulta acha os empréstimos ainda em aberto?",
      options: ["WHERE devolucao = NULL","WHERE devolucao IS NULL","WHERE devolucao > 0","WHERE NOT devolucao"],
      answer: 1,
      explain: "NULL só se testa com IS NULL.",
    }
  ],
};
