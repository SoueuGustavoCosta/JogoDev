import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Normalização").
 */
export const modNorm: Module = {
  id: "norm",
  short: "Normalização",
  title: "Normalização: arrumando a casa",
  lead: "Como projetar tabelas para não repetir dados e não criar contradições.",
  level: "Intermediário",
  blocks: [
    { t: 'p', x: "Normalizar é organizar as tabelas seguindo regras chamadas <b>formas normais</b>. Comece olhando esta tabela problemática:" },
    { t: 'table', cols: ["id_pedido","cliente","telefones","produtos"], rows: [["501","Ana","3199999;3188888","Mouse, Teclado"]], file: "pedido_bruto — como uma planilha" },
    { t: 'h', x: "As três primeiras formas normais" },
    { t: 'cards', items: [{"h":"1FN — valores atômicos","x":"Uma célula, um valor. \"3199999;3188888\" e \"Mouse, Teclado\" são listas escondidas: viram linhas em tabelas próprias (<code>cliente_telefone</code>, <code>item_pedido</code>)."},{"h":"2FN — sem dependência parcial","x":"Se a chave tem duas colunas (venda + produto), o nome do produto depende só do produto. Ele sai para a tabela <code>produto</code>."},{"h":"3FN — sem dependência transitiva","x":"Se o salário depende da categoria e a categoria depende do funcionário, o salário vai para uma tabela <code>categoria</code>."}] },
    { t: 'code', file: "16_normalizado.sql", x: "-- depois da 1FN e 2FN\nCREATE TABLE pedido (\n    id_pedido  SERIAL PRIMARY KEY,\n    cliente    VARCHAR(100) NOT NULL\n);\n\nCREATE TABLE produto (\n    cod_produto    SERIAL PRIMARY KEY,\n    nome_produto   VARCHAR(100) NOT NULL,\n    preco_produto  NUMERIC(10, 2) NOT NULL\n);\n\nCREATE TABLE item_pedido (\n    id_pedido    INTEGER REFERENCES pedido (id_pedido),\n    cod_produto  INTEGER REFERENCES produto (cod_produto),\n    qtd          INTEGER NOT NULL,\n    PRIMARY KEY (id_pedido, cod_produto)\n);" },
    { t: 'note', k: "Regra prática", x: "Cada fato deve morar em <b>um só lugar</b>. Se você precisa mudar o preço do Mouse Gamer e tem que editar em vários lugares, a modelagem ainda pode melhorar." },
    { t: 'h', x: "A base de tudo: dependência funcional" },
    { t: 'p', x: "Dizemos que <b>X → Y</b> (\"X determina Y\") quando, se duas linhas têm o mesmo valor de X, elas necessariamente têm o mesmo valor de Y. Exemplos: <code>cpf → nome</code>; <code>cod_produto → nome_produto, preco</code>; <code>(cod_venda, cod_produto) → qtd</code>. As formas normais são regras sobre quais dependências podem existir dentro de uma tabela." },
    { t: 'h', x: "BCNF: a forma normal de Boyce-Codd" },
    { t: 'p', x: "Uma tabela está em <b>BCNF</b> quando, para toda dependência funcional X → Y não trivial, X é uma superchave. É mais rigorosa que a 3FN: toda tabela em BCNF está em 3FN, mas nem toda em 3FN está em BCNF. Exemplo clássico, em que cada professor leciona uma única disciplina:" },
    { t: 'table', cols: ["aluno","disciplina","professor"], rows: [["Ana","Banco de Dados","Prof. Lima"],["Bia","Banco de Dados","Prof. Lima"],["Ana","Redes","Prof. Souza"]], file: "ensina — está em 3FN, mas não em BCNF" },
    { t: 'p', x: "Aqui <code>professor → disciplina</code>, mas professor não é chave da tabela, então viola a BCNF. Repare na redundância: \"Prof. Lima leciona Banco de Dados\" aparece repetido. A solução é decompor sem perder informação:" },
    { t: 'code', file: "17_bcnf.sql", x: "CREATE TABLE professor_disciplina (\n    professor   VARCHAR(80) PRIMARY KEY,\n    disciplina  VARCHAR(80) NOT NULL\n);\n\nCREATE TABLE aluno_professor (\n    aluno      VARCHAR(80) NOT NULL,\n    professor  VARCHAR(80) NOT NULL REFERENCES professor_disciplina (professor),\n    PRIMARY KEY (aluno, professor)\n);" },
    { t: 'note', k: "Cuidado ao decompor", x: "Uma boa decomposição não pode gerar linhas <b>espúrias</b> quando você junta as tabelas de novo (uma junção sem perdas). Sempre confira, juntando as partes, se volta exatamente à tabela original." },
    { t: 'h', x: "4FN e além" },
    { t: 'p', x: "Quando um empregado tem vários idiomas <b>e</b> vários hobbies, independentes entre si, guardar tudo na mesma tabela obriga a repetir todas as combinações. Isso é uma <b>dependência multivalorada</b>, e a <b>4FN</b> manda separar em duas tabelas (empregado-idioma e empregado-hobby). A 5FN (dependências de junção) e a DKNF existem, mas são pouco usadas na prática." },
    { t: 'h', x: "Desnormalizar de propósito" },
    { t: 'p', x: "Normalizar reduz redundância, mas pode exigir muitos JOINs. Em relatórios e sistemas muito lidos, às vezes se guarda um dado repetido ou calculado (como o <code>total</code> do pedido, que poderia ser a soma dos itens) para ganhar velocidade. Isso se chama <b>redundância controlada</b>. Regra: só duplique sabendo o motivo e mantenha a cópia sincronizada, por transação ou trigger." }
  ],
  quiz: [
    {
      id: 'q1',
      kind: "bug",
      q: "Uma destas linhas fere a 1FN. Toque nela.",
      lines: ["INSERT INTO pedido (id_pedido, cliente, produtos)", "VALUES (1, 'Ana', 'Mouse, Teclado');"],
      bugLine: 2,
      explain: "A 1FN exige valores atômicos: um valor por célula. \"Mouse, Teclado\" são dois produtos numa célula só.",
    },
    {
      id: 'q2',
      q: "A chave é (cod_venda, cod_produto), mas nome_produto depende só de cod_produto. Qual forma é violada?",
      options: ["1FN","2FN","3FN","BCNF"],
      answer: 1,
      explain: "Dependência parcial da chave composta viola a 2FN.",
    },
    {
      id: 'q3',
      q: "O salário depende da categoria, que depende do funcionário. Isso é...",
      options: ["Dependência transitiva (3FN)","Valor não atômico (1FN)","Chave duplicada","Um tipo de JOIN"],
      answer: 0,
      explain: "Dependência de um atributo não-chave em outro atributo não-chave: 3FN.",
    },
    {
      id: 'q4',
      q: "Ler \"cpf → nome\" significa que...",
      options: ["O nome determina o CPF","Duas linhas com o mesmo CPF têm o mesmo nome","O CPF é uma chave estrangeira","O nome é obrigatório"],
      answer: 1,
      explain: "X → Y: o valor de X determina o de Y. Mesmo CPF, mesmo nome.",
    },
    {
      id: 'q5',
      q: "Uma tabela em 3FN garante estar em BCNF?",
      options: ["Sim, sempre","Não: a BCNF é mais rigorosa","Só se tiver PK composta","Só em PostgreSQL"],
      answer: 1,
      explain: "BCNF implica 3FN, mas o contrário não vale.",
    }
  ],
};
