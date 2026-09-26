import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Arquitetura do SGBD").
 */
export const modArquitetura: Module = {
  id: "arquitetura",
  short: "Arquitetura do SGBD",
  title: "Arquitetura de um SGBD",
  lead: "Por dentro do sistema: camadas, servidores, os três níveis de visão e onde o banco guarda a descrição de si mesmo.",
  level: "Base",
  blocks: [
    { t: 'h', x: "Software em três camadas" },
    { t: 'p', x: "Aplicações modernas separam responsabilidades. Cada parte muda sem quebrar as outras, e a camada de dados fica protegida atrás das demais." },
    { t: 'cards', items: [{"h":"Apresentação","x":"O que o usuário vê e toca: telas, formulários, botões. No seu caminho: React."},{"h":"Negócio","x":"As regras do sistema: validar um pedido, calcular desconto, decidir quem pode o quê. No seu caminho: Spring Boot."},{"h":"Persistência","x":"Guarda os dados de forma permanente. No seu caminho: PostgreSQL."}] },
    { t: 'flow', items: ["Usuário","React","API Spring Boot","PostgreSQL"] },
    { t: 'h', x: "Onde o SGBD roda" },
    { t: 'cards', items: [{"h":"Centralizado","x":"Tudo em um único computador. Simples, mas limitado por uma máquina só."},{"h":"Cliente-servidor","x":"O servidor guarda os dados, controla concorrência e recupera falhas; os clientes fazem pedidos pela rede. É o PostgreSQL: seu programa conecta na porta 5432."},{"h":"Paralelo","x":"Vários processadores e discos trabalhando juntos para consultar volumes enormes ou atender milhares de transações por segundo."},{"h":"Distribuído","x":"Vários bancos parcialmente independentes, em lugares diferentes, que compartilham um esquema e coordenam as transações."}] },
    { t: 'note', k: "Curiosidade", x: "Nem todo banco é um servidor. O <b>SQLite</b> é uma biblioteca que grava tudo em um arquivo. O laboratório desta trilha usa o <b>PGlite</b>: o PostgreSQL compilado para rodar dentro do navegador." },
    { t: 'h', x: "Arquitetura de três esquemas" },
    { t: 'p', x: "Para separar quem usa os dados de como eles são guardados, o banco trabalha em três níveis de abstração:" },
    { t: 'table', cols: ["Nível","Quem enxerga","O que descreve"], rows: [["Externo (visões)","Usuários e programas","Só a parte dos dados que cada grupo precisa. Em SQL: views e permissões."],["Conceitual (lógico)","Analistas e DBA","Entidades, relacionamentos, tipos e restrições. Em SQL: as tabelas e constraints."],["Interno (físico)","Equipe do SGBD","Arquivos, páginas em disco, índices e caminhos de acesso."]], mac: false },
    { t: 'cards', items: [{"h":"Independência lógica","x":"Dá para mudar o esquema conceitual (ex.: acrescentar uma coluna) sem quebrar as visões dos usuários."},{"h":"Independência física","x":"Dá para mudar o armazenamento (ex.: criar um índice, mover o arquivo) sem alterar as tabelas nem os programas."}] },
    { t: 'h', x: "Catálogo do sistema e dicionário de dados" },
    { t: 'p', x: "O banco guarda a descrição de si mesmo em tabelas especiais: os <b>metadados</b>, \"dados sobre dados\". Essa área se chama <b>catálogo do sistema</b>. No PostgreSQL você consulta com SQL, usando o <code>information_schema</code>:" },
    { t: 'code', file: "catalogo.sql", x: "-- lista todas as colunas do seu banco: o catálogo em ação\nSELECT table_name, column_name, data_type, is_nullable\nFROM information_schema.columns\nWHERE table_schema = 'public'\nORDER BY table_name, ordinal_position;" },
    { t: 'p', x: "O <b>dicionário de dados</b> é a versão documentada disso, escrita para pessoas: para cada atributo, o nome, o tipo, o tamanho, se é obrigatório, se é chave e o que significa. Ele mantém o projeto compreensível meses depois." },
    { t: 'table', cols: ["Tabela.coluna","Tipo","Obrigatório","Chave","Descrição"], rows: [["produtos.id","SERIAL","Sim","PK","Identificador único do produto"],["produtos.nome","VARCHAR(120)","Sim","","Nome comercial exibido ao cliente"],["produtos.preco","NUMERIC(10,2)","Sim","","Preço de venda em reais. Nunca negativo (CHECK)"],["produtos.categoria_id","INTEGER","Não","FK → categorias.id","Categoria do produto"]], mac: false }
  ],
  quiz: [
    {
      id: 'q1',
      q: "Qual camada de uma aplicação é responsável por guardar os dados de forma permanente?",
      options: ["Apresentação","Persistência","Negócio","Rede"],
      answer: 1,
      explain: "A camada de persistência é a que grava e recupera dados. O banco de dados vive nela.",
    },
    {
      id: 'q2',
      q: "No PostgreSQL, quem controla concorrência e recuperação de falhas?",
      options: ["O cliente (o navegador)","O servidor do banco","O sistema operacional do usuário","O arquivo CSV"],
      answer: 1,
      explain: "Na arquitetura cliente-servidor, o servidor faz o trabalho pesado: acessos, transações, concorrência e recuperação.",
    },
    {
      id: 'q3',
      q: "Adicionar um índice sem precisar mexer nas tabelas nem nos programas demonstra...",
      options: ["Independência lógica","Independência física","Redundância","Normalização"],
      answer: 1,
      explain: "Mudou o nível interno (armazenamento) sem afetar os níveis acima: independência física de dados.",
    },
    {
      id: 'q4',
      kind: "output",
      q: "O catálogo guarda metadados: dados que descrevem outros dados. O que esta consulta devolve?",
      lang: "sql",
      code: "SELECT data_type\nFROM information_schema.columns\nWHERE table_name = 'produtos'\n  AND column_name = 'preco';",
      options: ["numeric", "249.90", "preco", "produtos"],
      answer: 0,
      explain: "Metadados descrevem a estrutura do banco, como nomes de tabelas, colunas e tipos. O catálogo responde o <b>tipo</b> da coluna preco (numeric), não os preços.",
    },
  ],
};
