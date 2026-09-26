import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Transações e concorrência").
 */
export const modTransacoes: Module = {
  id: "transacoes",
  short: "Transações e concorrência",
  title: "Transações, ACID e concorrência",
  lead: "Como o banco garante que dinheiro não some e que duas pessoas mexendo ao mesmo tempo não se atropelam.",
  level: "Avançado",
  blocks: [
    { t: 'p', x: "Uma transferência de dinheiro tem dois passos: tirar de uma conta e colocar em outra. Se a luz cair entre eles, o dinheiro sumiria. A <b>transação</b> agrupa os passos: ou todos acontecem, ou nenhum." },
    { t: 'code', file: "20_transferencia.sql", x: "BEGIN;\n\nUPDATE contas SET saldo = saldo - 100 WHERE id = 1;\nUPDATE contas SET saldo = saldo + 100 WHERE id = 2;\n\nCOMMIT;\n\nSELECT titular, saldo FROM contas ORDER BY id;" },
    { t: 'table', cols: ["titular","saldo"], rows: [["Conta 1","400.00"],["Conta 2","400.00"]], file: "Data Output — 2 linhas" },
    { t: 'cards', items: [{"h":"A — Atomicidade","x":"Tudo ou nada."},{"h":"C — Consistência","x":"O banco sai de um estado válido para outro válido; as constraints sempre são respeitadas."},{"h":"I — Isolamento","x":"Transações simultâneas não enxergam o trabalho incompleto umas das outras."},{"h":"D — Durabilidade","x":"Depois do COMMIT, o dado sobrevive a quedas. O PostgreSQL grava antes num log de escrita (WAL)."}] },
    { t: 'h', x: "Consistência na prática: CHECK e ROLLBACK" },
    { t: 'p', x: "Vamos proibir saldo negativo e tentar um débito impossível. O banco recusa, e o <code>ROLLBACK</code> desfaz o que já tinha sido feito dentro da transação." },
    { t: 'code', file: "21_saldo_check.sql", x: "ALTER TABLE contas\n    ADD CONSTRAINT saldo_nao_negativo CHECK (saldo >= 0);\n\nBEGIN;\nUPDATE contas SET saldo = saldo + 1000 WHERE id = 2;\nUPDATE contas SET saldo = saldo - 1000 WHERE id = 1;  -- vai falhar\nROLLBACK;\n\nSELECT titular, saldo FROM contas ORDER BY id;", expectError: true },
    { t: 'p', x: "O segundo UPDATE falha porque a conta 1 ficaria com saldo negativo. O <code>ROLLBACK</code> desfaz também o crédito de 1000 já feito na conta 2: as duas contas voltam ao que eram. Para desfazer só uma parte, use <code>SAVEPOINT nome</code> e <code>ROLLBACK TO nome</code>." },
    { t: 'h', x: "O que dá errado quando duas transações se misturam" },
    { t: 'cards', items: [{"h":"Leitura suja","x":"Você lê um dado que outra transação alterou mas ainda não confirmou. Se ela desfizer, você leu algo que nunca existiu."},{"h":"Leitura não repetível","x":"Você lê a mesma linha duas vezes na transação e o valor mudou, porque outra transação confirmou uma alteração no meio."},{"h":"Leitura fantasma","x":"Você repete uma consulta e aparecem linhas novas que satisfazem o filtro."},{"h":"Atualização perdida","x":"Duas transações leem o mesmo saldo, calculam e gravam: a segunda sobrescreve a primeira e a mudança da primeira some."}] },
    { t: 'h', x: "Níveis de isolamento" },
    { t: 'table', cols: ["Nível (padrão SQL)","Leitura suja","Não repetível","Fantasma"], rows: [["READ UNCOMMITTED","Possível","Possível","Possível"],["READ COMMITTED","Não","Possível","Possível"],["REPEATABLE READ","Não","Não","Possível"],["SERIALIZABLE","Não","Não","Não"]], mac: false },
    { t: 'note', k: "No PostgreSQL", x: "O nível padrão é <b>READ COMMITTED</b>. Leitura suja nunca acontece: pedir READ UNCOMMITTED dá o mesmo que READ COMMITTED. O PostgreSQL usa <b>MVCC</b> (controle de concorrência multiversão): cada transação enxerga uma versão consistente dos dados, então quem lê não bloqueia quem escreve, e vice-versa." },
    { t: 'code', file: "22_isolamento.sql", x: "BEGIN ISOLATION LEVEL SERIALIZABLE;\nSELECT SUM(saldo) FROM contas;\nCOMMIT;\n\n-- travar uma linha para evitar a atualização perdida\nBEGIN;\nSELECT saldo FROM contas WHERE id = 1 FOR UPDATE;\nUPDATE contas SET saldo = saldo - 50 WHERE id = 1;\nCOMMIT;" },
    { t: 'p', x: "<code>SELECT ... FOR UPDATE</code> trava a linha até o fim da transação: outra transação que tente alterá-la espera. Quando duas transações esperam uma pela outra, temos um <b>deadlock</b>; o PostgreSQL detecta, cancela uma delas e você precisa tentar de novo." }
  ],
  quiz: [
    {
      id: 'q1',
      q: "O que garante a Atomicidade em uma transferência bancária?",
      options: ["Os dois passos acontecem ou nenhum acontece","Só um usuário pode usar o banco","O saldo é sempre positivo","O banco tem backup"],
      answer: 0,
      explain: "Atomicidade é tudo ou nada.",
    },
    {
      id: 'q2',
      q: "Duas transações leem o mesmo saldo (100), cada uma soma 10 e grava 110. O resultado deveria ser 120. Esse problema é...",
      options: ["Leitura suja","Leitura fantasma","Atualização perdida","Deadlock"],
      answer: 2,
      explain: "A segunda gravação sobrescreveu a primeira: atualização perdida. FOR UPDATE ou SERIALIZABLE evitam.",
    },
    {
      id: 'q3',
      q: "Qual é o nível de isolamento padrão do PostgreSQL?",
      options: ["READ UNCOMMITTED","READ COMMITTED","REPEATABLE READ","SERIALIZABLE"],
      answer: 1,
      explain: "READ COMMITTED é o padrão: cada comando vê os dados já confirmados.",
    },
    {
      id: 'q4',
      q: "Qual comando desfaz tudo o que foi feito desde o BEGIN?",
      options: ["COMMIT","SAVEPOINT","ROLLBACK","FOR UPDATE"],
      answer: 2,
      explain: "ROLLBACK cancela a transação inteira.",
    }
  ],
};
