import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "UPDATE e DELETE").
 */
export const modUpdate: Module = {
  id: "update",
  short: "UPDATE e DELETE",
  title: "UPDATE e DELETE: mexer com cuidado",
  lead: "Alterar e apagar dados é poderoso e perigoso. Aprenda o hábito que salva carreiras.",
  level: "Intermediário",
  blocks: [
    { t: 'code', file: "09_alterar_dados.sql", x: "-- vendeu 1 mouse: diminui o estoque do produto 2\nUPDATE produtos\nSET estoque = estoque - 1\nWHERE id = 2;\n\n-- remove produtos desativados\nDELETE FROM produtos\nWHERE ativo = FALSE;" },
    { t: 'note', k: "Regra número 1", x: "Sem <code>WHERE</code>, o <code>UPDATE</code> e o <code>DELETE</code> atingem <b>todas as linhas</b> da tabela. <code>UPDATE produtos SET preco = 0;</code> zera o preço de tudo.", warn: true },
    { t: 'h', x: "O hábito que protege você" },
    { t: 'ol', items: ["Escreva primeiro um <code>SELECT</code> com o mesmo <code>WHERE</code> e confira quais linhas voltam.","Só então troque o SELECT por UPDATE ou DELETE, mantendo o WHERE.","Em mudanças importantes, use uma <b>transação</b> e confira antes de confirmar."] },
    { t: 'code', file: "10_transacao.sql", x: "BEGIN;                       -- abre uma \"área de teste\"\n\nUPDATE produtos SET preco = 0;   -- oops, esqueci o WHERE!\n\nSELECT * FROM produtos;      -- vejo o estrago\nROLLBACK;                    -- desfaz tudo, como se nada tivesse acontecido\n-- (se estivesse certo, usaria COMMIT; para confirmar)" },
    { t: 'note', k: "DELETE x DROP", x: "<code>DELETE</code> remove <b>linhas</b> e a tabela continua existindo. <code>DROP TABLE</code> remove a <b>tabela inteira</b>." }
  ],
  quiz: [
    {
      q: "O que acontece com  UPDATE produtos SET preco = 0;  ?",
      options: ["Erro: falta o WHERE","Altera só a primeira linha","Zera o preço de todas as linhas","Nada, precisa de COMMIT"],
      answer: 2,
      explain: "Sem WHERE, todas as linhas são atingidas.",
    },
    {
      q: "Qual é uma boa forma de conferir o que um DELETE vai apagar?",
      options: ["Rodar e torcer","Rodar um SELECT com o mesmo WHERE antes","Trocar DELETE por DROP","Apagar o banco e recriar"],
      answer: 1,
      explain: "O SELECT mostra exatamente as linhas que seriam afetadas.",
    },
    {
      q: "Qual comando desfaz as mudanças de uma transação aberta?",
      options: ["COMMIT","BEGIN","ROLLBACK","SELECT"],
      answer: 2,
      explain: "ROLLBACK cancela tudo que foi feito desde o BEGIN.",
    }
  ],
};
