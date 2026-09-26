import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Conhecendo a interface").
 * O widget de montar tabela virou o jogo `criar-tabela` (CreateTableBuilderWidget).
 */
export const modInterface: Module = {
  id: "interface",
  short: "Conhecendo a interface",
  title: "Conhecendo a interface: cliques ou código",
  lead: "Dá para criar uma tabela sem escrever uma linha de código. E dá para criar só com código. Vamos ver os dois lados.",
  level: "Base",
  blocks: [
    { t: 'h', x: "Primeiros passos" },
    { t: 'ol', items: ["Baixe o instalador em <code>postgresql.org/download</code>. Ele já inclui o servidor, o <b>pgAdmin</b> e o <b>psql</b>.","Durante a instalação, defina uma <b>senha</b> para o usuário <code>postgres</code> e anote. Deixe a porta padrão <code>5432</code>.","Abra o pgAdmin, conecte no servidor local e digite a senha. Pronto: você está dentro."] },
    { t: 'h', x: "Duas portas para o mesmo lugar" },
    { t: 'cards', items: [{"h":"Modo visual","x":"Você clica com o botão direito em Tables, escolhe Create, preenche formulários e salva. Ótimo para explorar e para os primeiros dias."},{"h":"Modo código","x":"Você abre a Query Tool (ou o psql), escreve comandos SQL e executa. É o que se usa no trabalho de verdade."}] },
    { t: 'p', x: "O segredo é que os dois fazem a <b>mesma coisa</b>. Cada clique no pgAdmin vira um comando SQL por baixo dos panos. Teste na tela abaixo: monte uma tabela no modo visual e depois olhe a aba <b>Código SQL</b>." },
    { t: 'gui', widget: 'criar-tabela' },
    { t: 'note', k: "Dica", x: "No pgAdmin real, toda janela de criação tem uma aba <b>SQL</b> que mostra o comando gerado. É uma das melhores formas de aprender SQL: faça por cliques e leia o código que apareceu." },
    { t: 'h', x: "Por que quem trabalha na área prefere código?" },
    { t: 'ul', items: ["<b>Repetível</b>: o mesmo script cria o banco igual em qualquer computador.","<b>Versionável</b>: você guarda o script no Git e vê quem mudou o quê.","<b>Portátil</b>: funciona em servidores sem interface gráfica."] },
    { t: 'h', x: "O terminal do PostgreSQL (psql)" },
    { t: 'code', file: "psql — atalhos que você vai usar", x: "-- comandos do psql começam com barra invertida\n\\l              -- lista os bancos de dados\n\\c loja_dev     -- conecta no banco loja_dev\n\\dt             -- lista as tabelas do banco atual\n\\d produtos     -- mostra a estrutura da tabela produtos\n\\q              -- sai do psql" }
  ],
  quiz: [
    {
      id: 'q1',
      q: "Quando você cria uma tabela clicando no pgAdmin, o que acontece por baixo dos panos?",
      options: ["Nada: o pgAdmin guarda em um arquivo próprio","O pgAdmin gera e executa um comando SQL","O Windows cria a tabela","O banco é reiniciado"],
      answer: 1,
      explain: "A interface só facilita: ela monta o SQL e envia para o PostgreSQL.",
    },
    {
      id: 'q2',
      q: "Qual é uma vantagem de criar o banco por scripts de código?",
      options: ["É impossível errar","Não precisa de senha","Pode ser repetido e versionado no Git","Só funciona no Mac"],
      answer: 2,
      explain: "Scripts são repetíveis e podem ser guardados e revisados como qualquer código.",
    },
    {
      id: 'q3',
      q: "Complete: qual comando do psql lista as tabelas do banco atual?",
      fill: true,
      pre: "",
      post: "",
      accept: ["\\dt"],
      wrong: ["\\l", "\\q", "\\c"],
      placeholder: "\\?",
      explain: "\\dt (de \"display tables\") lista as tabelas.",
      hint: "Está na lista de atalhos do psql, logo acima: começa com barra invertida.",
    }
  ],
};
