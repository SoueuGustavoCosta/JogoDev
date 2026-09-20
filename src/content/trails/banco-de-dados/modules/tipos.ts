import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Tipos de bancos").
 */
export const modTipos: Module = {
  id: "tipos",
  short: "Tipos de bancos",
  title: "Tipos de bancos e por que PostgreSQL",
  lead: "Existem várias famílias de bancos. Vamos ver as principais e escolher a nossa.",
  level: "Base",
  blocks: [
    { t: 'h', x: "As famílias mais comuns" },
    { t: 'cards', items: [{"h":"Relacional","x":"Tabelas com linhas e colunas ligadas por chaves. PostgreSQL, MySQL, SQL Server. Ideal para cadastros, pedidos e finanças."},{"h":"Documento","x":"Guarda blocos flexíveis parecidos com JSON. MongoDB. Bom quando cada registro tem formato diferente."},{"h":"Chave-valor","x":"Como um dicionário gigante e rapidíssimo. Redis. Usado para cache e sessões de login."},{"h":"Grafo","x":"Foca nas conexões entre as coisas. Neo4j. Bom para redes sociais e recomendações."}] },
    { t: 'h', x: "Por que vamos usar PostgreSQL" },
    { t: 'ul', items: ["É <b>gratuito e open source</b>, com mais de 30 anos de história e uma comunidade enorme.","É muito <b>confiável</b>: respeita as propriedades ACID, que garantem que seus dados não ficam pela metade quando algo dá errado (veremos no módulo avançado).","Tem <b>tipos ricos</b>: JSONB, arrays, UUID, datas com fuso horário. Você aprende o básico agora e cresce sem trocar de banco.","Combina com o caminho de Java (Spring/JPA) e Python (FastAPI), e é o banco por trás de serviços como o Supabase."] },
    { t: 'h', x: "SQL, PostgreSQL, pgAdmin e psql: quem é quem?" },
    { t: 'table', cols: ["Nome","O que é"], rows: [["SQL","A <b>linguagem</b> usada para conversar com bancos relacionais."],["PostgreSQL","O <b>SGBD</b>: o motor que guarda e processa os dados."],["pgAdmin","Uma <b>interface visual</b> para usar o PostgreSQL com cliques."],["psql","O <b>terminal</b> do PostgreSQL: você digita comandos SQL nele."]], mac: false },
    { t: 'h', x: "Um pouco de história: modelos de dados" },
    { t: 'cards', items: [{"h":"Hierárquico","x":"Dados em árvore: cada registro filho tem um único pai. Rápido para caminhos fixos, ruim quando o mesmo dado pertence a dois lugares. Exemplo clássico: o IMS da IBM."},{"h":"Em rede","x":"Evolução do hierárquico: um registro pode ter vários pais, formando um grafo. Mais flexível, mas o programador precisa navegar pelos caminhos."},{"h":"Relacional","x":"Tabelas ligadas por valores, sem caminhos fixos e com base matemática (álgebra relacional). Trouxe a independência entre dados e programas."},{"h":"Objeto-relacional","x":"Relacional com recursos de objetos: tipos próprios, herança entre tabelas. O PostgreSQL se descreve assim."}] },
    { t: 'h', x: "Bancos que você vai encontrar por aí" },
    { t: 'table', cols: ["SGBD","Tipo","Onde costuma aparecer"], rows: [["Oracle Database","Relacional","Grandes corporações e sistemas críticos"],["SQL Server","Relacional","Ambiente Microsoft, empresas e governo"],["MySQL / MariaDB","Relacional","Web e hospedagens compartilhadas"],["PostgreSQL","Relacional (objeto-relacional)","Web, SaaS, dados geográficos, muita variedade"],["SQLite","Relacional embutido","Aplicativos, celulares e navegadores: o banco é um arquivo"],["MongoDB","Documento (NoSQL)","Dados JSON flexíveis"],["Redis","Chave-valor em memória","Cache, sessões, filas, rankings"],["Cassandra","Colunar distribuído (NoSQL)","Volumes gigantes espalhados em muitos servidores"],["InfluxDB","Séries temporais","Métricas e sensores em ordem cronológica"],["Neo4j","Grafo","Recomendações e redes de relacionamento"]], mac: false }
  ],
  quiz: [
    {
      q: "O Redis pertence a qual família de bancos?",
      options: ["Relacional","Chave-valor","Grafo","Documento"],
      answer: 1,
      explain: "Redis guarda pares chave-valor e é muito usado como cache.",
    },
    {
      q: "Qual tipo de banco é o mais indicado para clientes, pedidos e produtos ligados entre si?",
      options: ["Chave-valor","Grafo","Relacional","Nenhum, use uma planilha"],
      answer: 2,
      explain: "Dados com relações bem definidas combinam com o modelo relacional.",
    },
    {
      q: "Qual afirmação está correta?",
      options: ["SQL é o programa que guarda os dados","PostgreSQL é uma linguagem de programação","pgAdmin é uma interface visual para o PostgreSQL","psql é um tipo de dado"],
      answer: 2,
      explain: "SQL é a linguagem, PostgreSQL é o SGBD, pgAdmin é a interface visual e psql é o terminal.",
    },
    {
      q: "Em qual modelo cada registro filho tem um único pai, formando uma árvore?",
      options: ["Relacional","Em rede","Chave-valor","Hierárquico"],
      answer: 3,
      explain: "No modelo hierárquico, os registros formam uma árvore de pais e filhos. O modelo em rede permitiu vários pais.",
    }
  ],
};
