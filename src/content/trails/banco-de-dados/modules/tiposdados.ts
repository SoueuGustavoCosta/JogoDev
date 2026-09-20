import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Tipos de dados").
 */
export const modTiposdados: Module = {
  id: "tiposdados",
  short: "Tipos de dados",
  title: "Tipos de dados: INT, VARCHAR e companhia",
  lead: "Cada coluna precisa dizer que tipo de coisa vai guardar. É o que o banco usa para proteger seus dados de erros.",
  level: "Base",
  blocks: [
    { t: 'p', x: "Uma coluna <code>idade</code> não deveria aceitar \"banana\". Definir o tipo é como colocar cada coisa na gaveta certa. Estes são os que você mais vai usar:" },
    { t: 'table', cols: ["Tipo","Guarda","Exemplo"], rows: [["INTEGER (INT)","Números inteiros","<code>42</code>, <code>-7</code>"],["BIGINT","Inteiros muito grandes","<code>9000000000</code>"],["SERIAL","Inteiro que se numera sozinho (1, 2, 3...). Perfeito para ids","<code>1</code>, <code>2</code>, <code>3</code>"],["NUMERIC(10,2)","Decimal exato: 10 dígitos no total, 2 depois da vírgula. Use para dinheiro","<code>249.90</code>"],["VARCHAR(n)","Texto de até n caracteres","<code>'Ana Souza'</code>"],["TEXT","Texto de qualquer tamanho","uma descrição longa"],["BOOLEAN","Verdadeiro ou falso","<code>TRUE</code>, <code>FALSE</code>"],["DATE","Só a data","<code>'2026-09-19'</code>"],["TIMESTAMP","Data e hora","<code>'2026-09-19 14:30:00'</code>"],["UUID","Identificador único longo e aleatório","<code>a0eebc99-9c0b-...</code>"],["JSONB","Um bloco JSON pesquisável","<code>{\"cor\":\"azul\"}</code>"]], mac: false },
    { t: 'h', x: "Escolhas que quebram a cabeça de iniciantes" },
    { t: 'cards', items: [{"h":"Dinheiro","x":"Use <code>NUMERIC(10,2)</code>. Tipos como REAL e DOUBLE guardam valores aproximados e podem gerar centavos fantasmas."},{"h":"CPF e telefone","x":"Use <code>VARCHAR</code>. Não fazemos conta com eles e um CPF pode começar com zero, que um INTEGER apagaria."},{"h":"VARCHAR ou TEXT?","x":"No PostgreSQL o desempenho é o mesmo. Use VARCHAR(n) quando existe um limite natural (nome, e-mail) e TEXT quando não existe."},{"h":"Datas","x":"Nunca guarde data como texto. Com <code>DATE</code> e <code>TIMESTAMP</code> você pode somar dias, comparar e ordenar direito."}] }
  ],
  quiz: [
    {
      q: "Qual tipo é o mais indicado para o preço de um produto?",
      options: ["VARCHAR(10)","NUMERIC(10,2)","BOOLEAN","DATE"],
      answer: 1,
      explain: "NUMERIC guarda decimais de forma exata, o que importa para dinheiro.",
    },
    {
      q: "Por que o CPF deve ser VARCHAR e não INTEGER?",
      options: ["Porque INTEGER é lento","Porque CPF tem zero à esquerda e não fazemos conta com ele","Porque INTEGER não existe no PostgreSQL","Porque CPF é sempre texto longo"],
      answer: 1,
      explain: "Um INTEGER descartaria o zero inicial. CPF é identificador, não número para somar.",
    },
    {
      q: "Qual tipo numera sozinho 1, 2, 3... a cada nova linha?",
      options: ["SERIAL","VARCHAR","TIMESTAMP","JSONB"],
      answer: 0,
      explain: "SERIAL cria uma sequência automática, ótima para chaves primárias.",
    }
  ],
};
