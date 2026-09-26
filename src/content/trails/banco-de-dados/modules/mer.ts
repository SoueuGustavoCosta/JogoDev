import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Modelagem MER e DER").
 */
export const modMer: Module = {
  id: "mer",
  short: "Modelagem MER e DER",
  title: "Modelagem: MER e DER",
  lead: "Antes de criar tabelas, desenhe. O modelo entidade-relacionamento é o mapa que evita retrabalho.",
  level: "Intermediário",
  blocks: [
    { t: 'p', x: "Um bom projeto de banco avança por níveis, do mais abstrato ao mais concreto:" },
    { t: 'flow', items: ["Requisitos","Modelo conceitual (MER/DER)","Modelo lógico (tabelas)","Modelo físico (SQL)"] },
    { t: 'p', x: "O <b>MER</b> (Modelo Entidade-Relacionamento) é a teoria: entidades, atributos, relacionamentos. O <b>DER</b> (Diagrama Entidade-Relacionamento) é o desenho desse modelo. Ele é conversado com quem pediu o sistema, então não fala de tabelas nem de tipos." },
    { t: 'h', x: "Os blocos do modelo" },
    { t: 'cards', items: [{"h":"Entidade","x":"Algo do mundo real sobre o qual guardamos dados (cliente, pedido). <b>Forte</b>: existe sozinha. <b>Fraca</b>: depende de outra (item de pedido). <b>Associativa</b>: nasce de uma relação N:N."},{"h":"Atributo","x":"Característica da entidade. <b>Simples</b> (nome), <b>composto</b> (endereço = rua + número), <b>multivalorado</b> (vários telefones), <b>derivado</b> (idade, calculada da data de nascimento) e <b>identificador</b> (a chave)."},{"h":"Relacionamento","x":"A associação entre entidades, geralmente um verbo: cliente <i>faz</i> pedido. Pode ter atributos próprios (quantidade)."},{"h":"Cardinalidade","x":"Quantas ocorrências participam. Máxima: 1 ou N. Mínima: 0 (opcional) ou 1 (obrigatória). Escreve-se (mín, máx)."}] },
    { t: 'raw', file: "der_loja.svg", x: "<svg viewBox=\"0 0 820 320\" role=\"img\" aria-label=\"Diagrama entidade-relacionamento da loja: Cliente faz Pedido, Pedido contém Produto\">\n    <g class=\"der-l\">\n      <line x1=\"55\" y1=\"66\" x2=\"55\" y2=\"135\"/><line x1=\"145\" y1=\"66\" x2=\"145\" y2=\"135\"/><line x1=\"100\" y1=\"254\" x2=\"100\" y2=\"185\"/>\n      <line x1=\"370\" y1=\"66\" x2=\"370\" y2=\"135\"/><line x1=\"450\" y1=\"66\" x2=\"450\" y2=\"135\"/>\n      <line x1=\"670\" y1=\"66\" x2=\"670\" y2=\"135\"/><line x1=\"750\" y1=\"66\" x2=\"750\" y2=\"135\"/><line x1=\"710\" y1=\"254\" x2=\"710\" y2=\"185\"/>\n      <line x1=\"170\" y1=\"160\" x2=\"205\" y2=\"160\"/><line x1=\"295\" y1=\"160\" x2=\"340\" y2=\"160\"/>\n      <line x1=\"480\" y1=\"160\" x2=\"515\" y2=\"160\"/><line x1=\"605\" y1=\"160\" x2=\"640\" y2=\"160\"/>\n      <line x1=\"560\" y1=\"192\" x2=\"560\" y2=\"254\"/>\n    </g>\n    <rect class=\"der-e\" x=\"30\" y=\"135\" width=\"140\" height=\"50\" rx=\"4\"/><text x=\"100\" y=\"165\" text-anchor=\"middle\">CLIENTE</text>\n    <rect class=\"der-e\" x=\"340\" y=\"135\" width=\"140\" height=\"50\" rx=\"4\"/><text x=\"410\" y=\"165\" text-anchor=\"middle\">PEDIDO</text>\n    <rect class=\"der-e\" x=\"640\" y=\"135\" width=\"140\" height=\"50\" rx=\"4\"/><text x=\"710\" y=\"165\" text-anchor=\"middle\">PRODUTO</text>\n    <polygon class=\"der-r\" points=\"250,128 295,160 250,192 205,160\"/><text x=\"250\" y=\"165\" text-anchor=\"middle\">faz</text>\n    <polygon class=\"der-r\" points=\"560,128 605,160 560,192 515,160\"/><text x=\"560\" y=\"165\" text-anchor=\"middle\">contém</text>\n    <g class=\"der-a\">\n      <ellipse cx=\"55\" cy=\"50\" rx=\"32\" ry=\"16\"/><ellipse cx=\"145\" cy=\"50\" rx=\"32\" ry=\"16\"/><ellipse cx=\"100\" cy=\"270\" rx=\"32\" ry=\"16\"/>\n      <ellipse cx=\"370\" cy=\"50\" rx=\"32\" ry=\"16\"/><ellipse cx=\"450\" cy=\"50\" rx=\"32\" ry=\"16\"/>\n      <ellipse cx=\"670\" cy=\"50\" rx=\"32\" ry=\"16\"/><ellipse cx=\"750\" cy=\"50\" rx=\"32\" ry=\"16\"/><ellipse cx=\"710\" cy=\"270\" rx=\"32\" ry=\"16\"/>\n      <ellipse cx=\"560\" cy=\"270\" rx=\"44\" ry=\"16\"/>\n    </g>\n    <text class=\"der-k\" x=\"55\" y=\"55\" text-anchor=\"middle\">id</text><text x=\"145\" y=\"55\" text-anchor=\"middle\">nome</text><text x=\"100\" y=\"275\" text-anchor=\"middle\">email</text>\n    <text class=\"der-k\" x=\"370\" y=\"55\" text-anchor=\"middle\">id</text><text x=\"450\" y=\"55\" text-anchor=\"middle\">data</text>\n    <text class=\"der-k\" x=\"670\" y=\"55\" text-anchor=\"middle\">id</text><text x=\"750\" y=\"55\" text-anchor=\"middle\">nome</text><text x=\"710\" y=\"275\" text-anchor=\"middle\">preço</text>\n    <text x=\"560\" y=\"275\" text-anchor=\"middle\">quantidade</text>\n    <text class=\"der-c\" x=\"187\" y=\"150\" text-anchor=\"middle\">(0,N)</text><text class=\"der-c\" x=\"318\" y=\"150\" text-anchor=\"middle\">(1,1)</text>\n    <text class=\"der-c\" x=\"497\" y=\"150\" text-anchor=\"middle\">(1,N)</text><text class=\"der-c\" x=\"622\" y=\"150\" text-anchor=\"middle\">(0,N)</text>\n  </svg>" },
    { t: 'p', x: "Como ler o desenho: um cliente faz zero ou muitos pedidos <b>(0,N)</b>; cada pedido é feito por exatamente um cliente <b>(1,1)</b>. Um pedido contém um ou mais produtos <b>(1,N)</b>; um produto pode estar em zero ou muitos pedidos <b>(0,N)</b>. Como pedido e produto são N:N, a relação <i>contém</i> vai virar uma tabela." },
    { t: 'note', k: "Autorrelacionamento", x: "Uma entidade pode se relacionar com ela mesma. Exemplo: <b>funcionário gerencia funcionário</b>. Vira uma FK que aponta para a própria tabela (<code>gerente_id</code>)." },
    { t: 'h', x: "Do DER para as tabelas" },
    { t: 'ol', items: ["Cada <b>entidade</b> vira uma tabela; cada <b>atributo simples</b> vira uma coluna; o <b>identificador</b> vira a chave primária.","Relacionamento <b>1:N</b>: a chave do lado \"1\" vira FK na tabela do lado \"N\".","Relacionamento <b>N:N</b>: cria-se uma <b>tabela associativa</b> com as duas FKs (juntas, formam a PK) e os atributos do relacionamento.","Relacionamento <b>1:1</b>: uma FK com <code>UNIQUE</code> em um dos lados (ou fundir as tabelas).","Atributo <b>multivalorado</b>: vira uma tabela própria com FK para a entidade.","Atributo <b>composto</b>: vira várias colunas. Atributo <b>derivado</b>: normalmente não se armazena, calcula-se na consulta.","<b>Autorrelacionamento</b>: FK para a própria tabela."] },
    { t: 'p', x: "Aplicando a regra do N:N ao nosso DER, a relação <i>contém</i> vira <code>itens_pedido</code>. Rode no laboratório com a Loja de exemplo:" },
    { t: 'code', file: "11_itens_pedido.sql", x: "CREATE TABLE itens_pedido (\n    pedido_id   INTEGER REFERENCES pedidos (id),\n    produto_id  INTEGER REFERENCES produtos (id),\n    quantidade  INTEGER NOT NULL CHECK (quantidade > 0),\n    preco_unit  NUMERIC(10, 2) NOT NULL,\n    PRIMARY KEY (pedido_id, produto_id)\n);\n\nINSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unit) VALUES\n    (101, 1, 1, 249.90),\n    (102, 2, 1,  80.00),\n    (103, 2, 1, 129.90);\n\nSELECT p.id AS pedido, pr.nome AS produto, i.quantidade, i.preco_unit\nFROM itens_pedido i\nJOIN pedidos  p  ON p.id  = i.pedido_id\nJOIN produtos pr ON pr.id = i.produto_id\nORDER BY p.id;" },
    { t: 'table', cols: ["pedido","produto","quantidade","preco_unit"], rows: [["101","Teclado Mecânico","1","249.90"],["102","Mouse Gamer","1","80.00"],["103","Mouse Gamer","1","129.90"]], file: "Data Output — 3 linhas" },
    { t: 'note', k: "Por que preco_unit está no item?", x: "O preço do produto muda com o tempo. Guardar o preço <b>no momento da compra</b> no item preserva o histórico: o pedido 102 pagou 80,00 mesmo que hoje o Mouse Gamer custe 129,90." }
  ],
  quiz: [
    {
      id: 'q1',
      afterBlock: 9,
      q: "Um cliente faz vários pedidos; cada pedido é de um cliente (1:N). A FK fica em pedidos. Complete a coluna:",
      fill: true,
      pre: "cliente_id INTEGER",
      post: "clientes (id)",
      accept: ["REFERENCES"],
      wrong: ["UNIQUE", "PRIMARY KEY", "DEFAULT"],
      placeholder: "?",
      explain: "É 1:N. A FK (cliente_id) fica no lado N, isto é, na tabela pedidos, e aponta com REFERENCES para clientes.",
    },
    {
      id: 'q2',
      afterBlock: 11,
      q: "Alunos cursam várias disciplinas e disciplinas têm vários alunos. Para implementar em SQL você precisa de...",
      options: ["Uma coluna com lista de disciplinas","Duas FKs em alunos","Uma tabela associativa entre as duas","Um atributo derivado"],
      answer: 2,
      explain: "Relação N:N vira uma tabela no meio, com FK para cada lado.",
    },
    {
      id: 'q3',
      kind: "output",
      q: "A idade não precisa ser guardada: é um atributo derivado da data de nascimento. O que aparece?",
      lang: "sql",
      code: "SELECT EXTRACT(YEAR FROM AGE(DATE '2026-01-01', DATE '2000-06-15'));",
      options: ["25", "26", "2000", "Erro"],
      answer: 0,
      explain: "Derivado: pode ser calculado de outro atributo, então normalmente não é armazenado. De 15/06/2000 a 01/01/2026 são 25 anos completos.",
    },
    {
      id: 'q4',
      q: "Na notação (mín, máx), o que significa (1,N)?",
      options: ["Opcional e no máximo um","Obrigatório e no máximo um","Opcional e vários","Pelo menos um e no máximo vários"],
      answer: 3,
      explain: "Mínimo 1 (obrigatório) e máximo N (vários).",
    }
  ],
};
