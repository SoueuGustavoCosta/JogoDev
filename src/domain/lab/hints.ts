/**
 * Traduz mensagens de erro comuns do PostgreSQL em dicas para iniciantes.
 * Migrado sem alterações de legacy/Trilha_PostgreSQL_com_Laboratorio.html (hintFor).
 */
export function hintFor(msg: string): string {
  let m: RegExpMatchArray | null;
  if ((m = msg.match(/relation "(.+?)" does not exist/))) {
    return `A tabela "${m[1]}" não existe. Digite \\dt para listar as tabelas disponíveis, ou confira se você já rodou o CREATE TABLE.`;
  }
  if ((m = msg.match(/column "(.+?)" (?:of relation "(.+?)" )?does not exist/))) {
    return `A coluna "${m[1]}" não existe${m[2] ? ' em ' + m[2] : ''}. Use \\d nome_da_tabela para ver as colunas.`;
  }
  if ((m = msg.match(/syntax error at or near "(.*?)"/))) {
    return `Erro de sintaxe perto de "${m[1]}". Procure uma vírgula faltando ou sobrando, parêntese aberto, aspas sem fechar ou palavra digitada errada.`;
  }
  if (/syntax error at end of input/.test(msg)) {
    return 'O comando terminou antes da hora: falta fechar um parêntese ou completar uma cláusula.';
  }
  if ((m = msg.match(/null value in column "(.+?)".*not-null/))) {
    return `A coluna "${m[1]}" é obrigatória (NOT NULL). Informe um valor para ela.`;
  }
  if (/duplicate key value/.test(msg)) {
    return 'Esse valor já existe em uma coluna PRIMARY KEY ou UNIQUE. Use outro valor.';
  }
  if (/violates foreign key constraint/.test(msg)) {
    return 'Chave estrangeira: o registro apontado não existe, ou ainda está sendo usado por outra tabela.';
  }
  if (/violates check constraint/.test(msg)) {
    return 'Um valor quebrou a regra CHECK da tabela (por exemplo, preço negativo).';
  }
  if (/already exists/.test(msg)) {
    return 'Esse nome já existe. Escolha outro nome ou apague o antigo com DROP. Dica: o botão "Banco vazio" recomeça do zero.';
  }
  if (/invalid input syntax/.test(msg)) {
    return 'O valor não combina com o tipo da coluna (por exemplo, texto onde se esperava número).';
  }
  if (/current transaction is aborted/.test(msg)) {
    return 'Você tem uma transação com erro aberta. Rode ROLLBACK; para desfazê-la e continuar.';
  }
  if (/must appear in the GROUP BY/.test(msg)) {
    return 'Toda coluna do SELECT que não está dentro de COUNT/SUM/AVG precisa estar no GROUP BY.';
  }
  if (/ambiguous/.test(msg)) {
    return 'O nome da coluna existe em mais de uma tabela. Diga de qual: tabela.coluna.';
  }
  return '';
}
