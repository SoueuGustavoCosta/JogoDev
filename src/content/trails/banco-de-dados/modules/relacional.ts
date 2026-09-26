import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Modelo relacional e chaves").
 */
export const modRelacional: Module = {
  id: "relacional",
  short: "Modelo relacional e chaves",
  title: "O modelo relacional e as chaves",
  lead: "A teoria que sustenta as tabelas: relações, tuplas, domínios e as regras de integridade que o banco impõe.",
  level: "Intermediário",
  blocks: [
    { t: 'p', x: "No modelo relacional, o dado é organizado em <b>relações</b>. Na prática, cada relação é uma tabela, mas os nomes formais aparecem em provas e livros. Aprenda os dois vocabulários:" },
    { t: 'table', cols: ["Termo formal","Na prática","Exemplo"], rows: [["Relação","Tabela","<code>produtos</code>"],["Tupla","Linha (registro)","Uma linha do Mouse Gamer"],["Atributo","Coluna (campo)","<code>preco</code>"],["Domínio","Conjunto de valores permitidos","Números decimais maiores ou iguais a 0"],["Grau","Quantidade de colunas","Grau 7 se a tabela tem 7 colunas"],["Cardinalidade da relação","Quantidade de linhas","4 produtos"],["Valor nulo","Ausente ou desconhecido","<code>NULL</code>"]], mac: false },
    { t: 'note', k: "Detalhe teórico", x: "Uma relação é um <b>conjunto</b>: não tem ordem entre as linhas nem linhas repetidas. Cada valor é <b>atômico</b> (indivisível). O SQL na prática deixa você quebrar essas regras, mas uma boa chave primária protege o modelo." },
    { t: 'h', x: "A família das chaves" },
    { t: 'cards', items: [{"h":"Superchave","x":"Qualquer conjunto de atributos que identifica uma linha de forma única. (cpf), (cpf, nome) e (id, cpf) podem ser superchaves."},{"h":"Chave candidata","x":"Superchave mínima: se tirar qualquer atributo, deixa de identificar. Uma tabela pode ter várias."},{"h":"Chave primária (PK)","x":"A candidata que você escolhe como identificador oficial. Única e nunca nula."},{"h":"Chave alternativa","x":"As candidatas que sobraram. Em SQL, viram colunas <code>UNIQUE</code>."},{"h":"Chave estrangeira (FK)","x":"Atributo que aponta para a chave primária de outra tabela e cria o relacionamento."},{"h":"Chave composta","x":"PK formada por mais de uma coluna, como (pedido_id, produto_id)."}] },
    { t: 'note', k: "Natural x substituta", x: "Uma chave <b>natural</b> vem do mundo real (CPF, e-mail) e pode mudar ou ter exceções. Uma chave <b>substituta</b> (surrogate), como o <code>SERIAL</code>, é um número sem significado criado só para identificar a linha. A maioria dos projetos usa substituta como PK e guarda a natural como <code>UNIQUE</code>." },
    { t: 'h', x: "Integridade: as regras que o banco defende" },
    { t: 'table', cols: ["Integridade","Regra","Como o PostgreSQL impõe"], rows: [["De domínio","O valor precisa pertencer ao domínio da coluna","Tipo de dado, <code>NOT NULL</code>, <code>CHECK</code>"],["De entidade","Toda linha tem uma PK única e não nula","<code>PRIMARY KEY</code>"],["Referencial","Uma FK só aponta para uma linha que existe (ou é nula)","<code>REFERENCES</code> / <code>FOREIGN KEY</code>"],["Definida pelo usuário","Regras do negócio (ex.: saldo não pode ficar negativo)","<code>CHECK</code>, triggers"]], mac: false },
    { t: 'p', x: "Teste você mesmo: abra este bloco no laboratório, com a Loja de exemplo, e rode um comando por vez. Cada um quebra de propósito uma regra diferente. Leia as mensagens de erro: elas são uma aula de integridade." },
    { t: 'code', file: "quebrando_regras.sql", x: "-- 1) integridade de entidade: id 1 já existe\nINSERT INTO produtos (id, nome, preco) VALUES (1, 'Repetido', 10);\n\n-- 2) integridade referencial: categoria 99 não existe\nINSERT INTO produtos (nome, preco, categoria_id) VALUES ('Fantasma', 10, 99);\n\n-- 3) integridade de domínio: preço negativo\nINSERT INTO produtos (nome, preco) VALUES ('Negativo', -5);\n\n-- 4) coluna obrigatória sem valor\nINSERT INTO produtos (nome) VALUES ('Sem preço');", expectError: true }
  ],
  quiz: [
    {
      id: 'q1',
      q: "Na terminologia formal, uma linha de tabela é chamada de...",
      options: ["Atributo","Domínio","Relação","Tupla"],
      answer: 3,
      explain: "Tupla é a linha, atributo é a coluna e relação é a tabela.",
    },
    {
      id: 'q2',
      q: "Uma tabela tem CPF e e-mail, ambos únicos. Você escolhe o CPF como PK. O e-mail é uma chave...",
      options: ["Estrangeira","Alternativa","Composta","Primária"],
      answer: 1,
      explain: "O e-mail é uma chave candidata que não foi escolhida como primária: chave alternativa (UNIQUE).",
    },
    {
      id: 'q3',
      kind: "bug",
      q: "O banco recusa este INSERT por integridade referencial. Toque na linha que causa isso.",
      lines: ["-- clientes cadastrados: 1 Ana, 2 Bruno, 3 Carla", "INSERT INTO pedidos (id, cliente_id, total)", "VALUES (104, 999, 50.00);"],
      bugLine: 3,
      explain: "A chave estrangeira <code>cliente_id = 999</code> aponta para um cliente que não existe: integridade referencial.",
    },
    {
      id: 'q4',
      kind: "order",
      q: "Monte a regra de domínio que proíbe preço negativo na coluna preco",
      pieces: ["CHECK", "(", "preco", ">=", "0", ")"],
      distractors: ["UNIQUE", "<"],
      explain: "CHECK restringe os valores permitidos na coluna, isto é, o domínio (integridade de domínio).",
    },
  ],
};
