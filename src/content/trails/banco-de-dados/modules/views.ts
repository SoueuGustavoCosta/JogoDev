import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Views, funções e triggers").
 */
export const modViews: Module = {
  id: "views",
  short: "Views, funções e triggers",
  title: "Views, funções e triggers",
  lead: "Dar nome a consultas, guardar lógica dentro do banco e reagir automaticamente a mudanças.",
  level: "Avançado",
  blocks: [
    { t: 'h', x: "View: uma consulta com nome" },
    { t: 'p', x: "Uma <b>view</b> é uma consulta salva que se usa como se fosse uma tabela. Ela não guarda dados: executa a consulta toda vez. Serve para simplificar consultas repetidas e para <b>esconder colunas</b> (a visão externa do modelo de três esquemas)." },
    { t: 'code', file: "23_view.sql", x: "CREATE VIEW produtos_disponiveis AS\nSELECT id, nome, preco\nFROM produtos\nWHERE estoque > 0 AND ativo;\n\nSELECT * FROM produtos_disponiveis ORDER BY id;" },
    { t: 'table', cols: ["id","nome","preco"], rows: [["1","Teclado Mecânico","249.90"],["2","Mouse Gamer","129.90"],["3","Monitor 24 pol","899.00"]], file: "Data Output — 3 linhas" },
    { t: 'note', k: "View materializada", x: "Uma <code>MATERIALIZED VIEW</code> guarda o resultado no disco, e você o atualiza com <code>REFRESH MATERIALIZED VIEW</code>. É mais rápida para relatórios pesados, mas pode ficar desatualizada." },
    { t: 'h', x: "Função: lógica guardada no banco" },
    { t: 'code', file: "24_funcao.sql", x: "CREATE OR REPLACE FUNCTION valor_com_desconto(valor NUMERIC, pct NUMERIC)\nRETURNS NUMERIC AS $$\nBEGIN\n    RETURN ROUND(valor * (1 - pct / 100), 2);\nEND;\n$$ LANGUAGE plpgsql;\n\nSELECT nome, preco, valor_com_desconto(preco, 10) AS com_desconto\nFROM produtos\nORDER BY id;" },
    { t: 'table', cols: ["nome","preco","com_desconto"], rows: [["Teclado Mecânico","249.90","224.91"],["Mouse Gamer","129.90","116.91"],["Monitor 24 pol","899.00","809.10"],["Teclado Compacto","179.90","161.91"]], file: "Data Output — 4 linhas" },
    { t: 'p', x: "<code>plpgsql</code> é a linguagem procedural do PostgreSQL: tem variáveis, <code>IF</code>, laços e tratamento de erro. Além de funções, existem <b>procedures</b> (chamadas com <code>CALL</code>, podem controlar transações)." },
    { t: 'h', x: "Trigger: reagir automaticamente" },
    { t: 'p', x: "Um <b>trigger</b> dispara uma função quando acontece um <code>INSERT</code>, <code>UPDATE</code> ou <code>DELETE</code>. Um uso clássico é a <b>auditoria</b>: registrar quem mudou o preço, quando, de quanto para quanto." },
    { t: 'code', file: "25_trigger.sql", x: "CREATE TABLE log_precos (\n    id            SERIAL PRIMARY KEY,\n    produto_id    INTEGER,\n    preco_antigo  NUMERIC(10, 2),\n    preco_novo    NUMERIC(10, 2),\n    alterado_em   TIMESTAMP DEFAULT NOW()\n);\n\nCREATE OR REPLACE FUNCTION registrar_preco() RETURNS TRIGGER AS $$\nBEGIN\n    IF NEW.preco <> OLD.preco THEN\n        INSERT INTO log_precos (produto_id, preco_antigo, preco_novo)\n        VALUES (OLD.id, OLD.preco, NEW.preco);\n    END IF;\n    RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\nCREATE TRIGGER trg_preco\nAFTER UPDATE ON produtos\nFOR EACH ROW EXECUTE FUNCTION registrar_preco();\n\nUPDATE produtos SET preco = 139.90 WHERE id = 2;\n\nSELECT produto_id, preco_antigo, preco_novo FROM log_precos;" },
    { t: 'table', cols: ["produto_id","preco_antigo","preco_novo"], rows: [["2","129.90","139.90"]], file: "Data Output — 1 linha" },
    { t: 'note', k: "Use com moderação", x: "Triggers rodam \"escondidos\": quem lê o <code>UPDATE</code> não vê o efeito. Muita lógica de negócio dentro do banco também dificulta testes e versionamento. Use para auditoria e regras de integridade, e deixe as regras de negócio para a aplicação.", warn: true }
  ],
  quiz: [
    {
      id: 'q1',
      kind: "output",
      q: "Uma view guarda os dados em disco? Veja o que aparece depois de mudar um preço:",
      lang: "sql",
      code: "CREATE VIEW caros AS\n  SELECT nome FROM produtos WHERE preco > 800;\n\nUPDATE produtos SET preco = 1000\nWHERE nome = 'Mouse Gamer';\n\nSELECT COUNT(*) FROM caros;",
      options: ["1", "2", "0", "Erro"],
      answer: 1,
      explain: "A view comum é uma consulta salva: roda de novo a cada uso e já vê o Mouse Gamer caro (Monitor + Mouse = 2). Só a MATERIALIZED VIEW guarda o resultado.",
    },
    {
      id: 'q2',
      afterBlock: 11,
      q: "Qual é um uso clássico de trigger?",
      options: ["Criar tabelas","Auditoria: registrar mudanças automaticamente","Instalar o PostgreSQL","Fazer backup"],
      answer: 1,
      explain: "Triggers reagem a INSERT/UPDATE/DELETE, ótimo para logs de auditoria.",
    },
    {
      id: 'q3',
      q: "O analista só pode ver os produtos disponíveis. Complete para dar permissão na view, e não na tabela:",
      fill: true,
      pre: "GRANT SELECT ON",
      post: "TO analista;",
      accept: ["produtos_disponiveis"],
      wrong: ["produtos", "clientes", "pedidos"],
      placeholder: "?",
      explain: "Você dá permissão na view e não na tabela: o usuário só enxerga as colunas e linhas que a view mostra.",
    },
  ],
};
