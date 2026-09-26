import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Sintaxe e indentação").
 * O bloco `{ t: 'syntax' }` renderiza o SqlStyleCompareWidget (compacto x formatado).
 */
export const modSintaxe: Module = {
  id: "sintaxe",
  short: "Sintaxe e indentação",
  title: "Sintaxe e indentação: escrever SQL que gente lê",
  lead: "O PostgreSQL entende SQL de qualquer jeito. Pessoas, não. Aprenda as regras e as boas maneiras.",
  level: "Base",
  blocks: [
    { t: 'h', x: "A família SQL: DDL, DML, DQL, DCL e TCL" },
    { t: 'p', x: "O SQL é uma linguagem só, mas seus comandos se organizam em grupos por finalidade. Vale decorar, porque aparece em toda prova." },
    { t: 'table', cols: ["Grupo","Nome","Serve para","Comandos"], rows: [["DDL","Definição de dados","Criar e alterar a estrutura","<code>CREATE</code> <code>ALTER</code> <code>DROP</code> <code>TRUNCATE</code>"],["DML","Manipulação de dados","Inserir, alterar e remover linhas","<code>INSERT</code> <code>UPDATE</code> <code>DELETE</code>"],["DQL","Consulta de dados","Ler dados","<code>SELECT</code>"],["DCL","Controle de dados","Dar e tirar permissões","<code>GRANT</code> <code>REVOKE</code>"],["TCL","Controle de transações","Confirmar ou desfazer","<code>BEGIN</code> <code>COMMIT</code> <code>ROLLBACK</code>"]], mac: false },
    { t: 'note', k: "Atenção em prova", x: "Alguns autores, como a apostila da faculdade, incluem o <code>SELECT</code> dentro da DML. Outros o separam como DQL. Use a classificação do seu professor." },
    { t: 'h', x: "As regras que o banco exige" },
    { t: 'ul', items: ["Todo comando termina com <code>;</code> (ponto e vírgula).","Textos ficam entre <b>aspas simples</b>: <code>'Ana'</code>. Aspas duplas são para nomes de colunas e tabelas, e é melhor evitar.","Comentários: <code>-- uma linha</code> ou <code>/* vários trechos */</code>. O banco ignora tudo isso.","Sem aspas, o PostgreSQL trata nomes como minúsculos: <code>Produtos</code> e <code>produtos</code> são a mesma tabela."] },
    { t: 'h', x: "As boas maneiras (convenções)" },
    { t: 'ul', items: ["Palavras da linguagem em <b>MAIÚSCULAS</b> (<code>SELECT</code>, <code>FROM</code>) e nomes que você inventa em <b>minúsculas</b> com underline: <code>data_pedido</code>. Isso se chama snake_case.","Uma <b>cláusula por linha</b>: <code>SELECT</code>, <code>FROM</code>, <code>WHERE</code> cada uma começando uma linha nova.","<b>Indentação</b> de 4 espaços (ou 2, mas escolha um e mantenha) para tudo que pertence a uma cláusula.","Uma coluna por linha quando a lista for longa, com a vírgula no fim da linha."] },
    { t: 'p', x: "Veja a mesma consulta escrita de dois jeitos. As duas funcionam exatamente igual. Clique nas abas e responda: em qual você acharia um erro mais rápido?" },
    { t: 'syntax' },
    { t: 'note', k: "Regra de ouro", x: "Espaços e quebras de linha não mudam o resultado. Então use-os a seu favor: o código é lido muito mais vezes do que é escrito." }
  ],
  quiz: [
    {
      id: 'q1',
      kind: "bug",
      q: "O banco reclama que a coluna \"Ana\" não existe. Toque na linha com o bug.",
      lines: ["SELECT nome, email", "FROM clientes", "WHERE nome = \"Ana\";"],
      bugLine: 3,
      explain: "Textos (strings) usam aspas simples: <code>'Ana'</code>. Com aspas duplas, o PostgreSQL entende \"Ana\" como nome de coluna.",
    },
    {
      id: 'q2',
      kind: "output",
      q: "A consulta foi escrita toda quebrada em linhas. O que ela devolve?",
      lang: "sql",
      code: "SELECT\n        nome\n   FROM\nclientes\n     WHERE id = 1;",
      options: ["Ana", "Erro", "nome", "Nada"],
      answer: 0,
      explain: "O SQL ignora espaços extras e quebras de linha. A indentação é um cuidado com quem vai ler, não muda o resultado.",
    },
    {
      id: 'q3',
      q: "Complete: todo comando SQL termina com...",
      fill: true,
      pre: "SELECT 1",
      post: "",
      accept: [";"],
      wrong: [".", ",", ":"],
      placeholder: "?",
      explain: "O ponto e vírgula marca o fim do comando.",
    },
    {
      id: 'q4',
      q: "GRANT e REVOKE pertencem a qual grupo do SQL?",
      options: ["DDL","DML","TCL","DCL"],
      answer: 3,
      explain: "DCL é a linguagem de controle de dados: dar e retirar permissões.",
    }
  ],
};
