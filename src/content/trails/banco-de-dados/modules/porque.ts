import type { Module } from '@/domain/trail/types';

/**
 * Migrado de legacy/Trilha_PostgreSQL_com_Laboratorio.html (módulo "Por que existe um banco").
 */
export const modPorque: Module = {
  id: "porque",
  short: "Por que existe um banco",
  title: "Por que existe um banco de dados?",
  lead: "Antes de digitar qualquer comando, entenda o problema que os bancos vieram resolver.",
  level: "Base",
  blocks: [
    { t: 'h', x: "O problema: dados espalhados" },
    { t: 'p', x: "Imagine uma loja de bairro. No começo, os pedidos ficam num caderno. Depois viram uma planilha. Depois, três planilhas em três computadores, com o mesmo cliente escrito de três jeitos: \"Ana Souza\", \"ana souza\" e \"A. Souza\". Quando o negócio cresce, a bagunça cresce junto." },
    { t: 'cards', items: [{"h":"Duplicação","x":"O mesmo dado guardado em vários lugares, ocupando espaço e dando trabalho para atualizar."},{"h":"Inconsistência","x":"Um lugar diz que o estoque é 10, outro diz 7. Qual está certo?"},{"h":"Concorrência","x":"Duas pessoas editando o mesmo arquivo ao mesmo tempo e uma apagando o trabalho da outra."},{"h":"Segurança","x":"Como deixar o financeiro ver os valores sem deixar o estagiário apagar tudo?"},{"h":"Escala","x":"Uma planilha aguenta milhares de linhas. Um banco aguenta milhões e responde rápido."}] },
    { t: 'note', k: "Curiosidade", x: "Em 1970, Edgar F. Codd, pesquisador da IBM, propôs o <b>modelo relacional</b>: guardar dados em tabelas ligadas por valores em comum. Essa ideia é a base do PostgreSQL, MySQL, Oracle e SQL Server até hoje." },
    { t: 'h', x: "Três palavras que todo mundo confunde" },
    { t: 'cards', items: [{"h":"Dado","x":"Um fato solto. Por exemplo: \"Ana\" ou 42. Sozinho, não diz muita coisa."},{"h":"Banco de dados","x":"Um conjunto organizado de dados que se relacionam, como todos os clientes e pedidos de uma loja."},{"h":"SGBD","x":"Sistema Gerenciador de Banco de Dados: o programa que guarda, protege e responde perguntas sobre os dados. O PostgreSQL é um SGBD."}] },
    { t: 'note', k: "Analogia", x: "Pense numa biblioteca. Os <b>livros</b> são os dados, a <b>biblioteca</b> inteira é o banco de dados e o <b>bibliotecário</b> é o SGBD: ele sabe onde tudo está, controla quem pega o quê e não deixa dois leitores levarem o mesmo exemplar." },
    { t: 'h', x: "Do dado ao conhecimento" },
    { t: 'p', x: "Um <b>dado</b> sozinho não diz nada: <code>37,5</code>. Com contexto vira <b>informação</b>: \"a temperatura da Ana é 37,5 °C\". Quando alguém usa a informação para decidir, nasce o <b>conhecimento</b>: \"ela está com febre, é melhor procurar um médico\". O banco de dados guarda dados de um jeito que a informação possa ser extraída rápido e sem erros." },
    { t: 'flow', items: ["Dado","Processamento","Informação","Decisão","Conhecimento"] },
    { t: 'h', x: "As quatro operações básicas (CRUD)" },
    { t: 'table', cols: ["Operação","Em inglês","Comando SQL"], rows: [["Inserir","Create","<code>INSERT</code>"],["Consultar","Read","<code>SELECT</code>"],["Atualizar","Update","<code>UPDATE</code>"],["Remover","Delete","<code>DELETE</code>"]], mac: false },
    { t: 'h', x: "Quando um SGBD vale a pena" },
    { t: 'ul', items: ["<b>Menos redundância</b>: cada dado é guardado uma vez e compartilhado, em vez de copiado em vários arquivos.","<b>Mais consistência</b>: como o dado existe em um só lugar, não há versões diferentes da mesma informação.","<b>Compartilhamento</b>: várias pessoas e programas usam os mesmos dados ao mesmo tempo, com controle.","<b>Segurança</b>: cada perfil vê e altera só o que tem permissão.","<b>Integridade</b>: o banco recusa dados que quebram as regras (nota 37 quando o máximo é 10).","<b>Backup e recuperação</b>: existem rotinas para restaurar os dados depois de uma falha.","<b>Múltiplas visões</b>: os mesmos dados aparecem de formas diferentes para cada tipo de usuário."] },
    { t: 'h', x: "Quem trabalha com bancos de dados" },
    { t: 'cards', items: [{"h":"DBA","x":"Administrador de banco de dados: instala, monitora o desempenho, controla acessos e cuida dos backups."},{"h":"Projetista de BD","x":"Conversa com os usuários, descobre quais dados precisam ser guardados e desenha as tabelas."},{"h":"Desenvolvedor","x":"Escreve os programas (Java, Python...) que consultam e alteram o banco."},{"h":"Usuário final","x":"Quem usa o sistema no dia a dia, muitas vezes sem saber que existe um banco por trás."}] }
  ],
  quiz: [
    {
      id: 'q1',
      q: "Qual é o papel do SGBD?",
      options: ["Ser o arquivo onde os dados ficam escritos","Ser o programa que guarda, protege e consulta os dados","Ser a linguagem usada para escrever consultas","Ser o computador onde o banco roda"],
      answer: 1,
      explain: "SGBD é o software gerenciador. O PostgreSQL é um SGBD; SQL é a linguagem que usamos para conversar com ele.",
    },
    {
      id: 'q2',
      q: "O nome de um cliente escrito de três formas diferentes em planilhas separadas é qual problema?",
      options: ["Escala","Segurança","Inconsistência","Concorrência"],
      answer: 2,
      explain: "Dados que deveriam ser iguais aparecem diferentes: isso é inconsistência.",
    },
    {
      id: 'q3',
      q: "Quem propôs o modelo relacional em 1970?",
      options: ["Edgar F. Codd","Bill Gates","Linus Torvalds","Larry Ellison"],
      answer: 0,
      explain: "Codd, da IBM. O modelo relacional organiza dados em tabelas.",
    },
    {
      id: 'q4',
      q: "\"A temperatura da Ana é 37,5 °C\" é um exemplo de...",
      options: ["Dado","SGBD","Informação","Conhecimento"],
      answer: 2,
      explain: "O número 37,5 é o dado. Com o contexto (de quem, em que unidade) ele vira informação. Decidir ir ao médico já é conhecimento.",
    }
  ],
};
