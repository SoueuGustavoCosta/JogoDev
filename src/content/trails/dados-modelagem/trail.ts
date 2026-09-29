import type { Trail } from '@/domain/trail/types';
import { dadosModelagemModules } from './modules';

/**
 * Lua da Modelagem (Etapa 14A): primeira lua da Era dos Dados. Recebeu os módulos de
 * modelagem que antes ficavam no fim da ilha principal (os ids não mudaram; o progresso
 * foi junto, ver `content/relocations.ts`). Chefe e insígnia: Etapa 14C.
 */
export const dadosModelagemTrail: Trail = {
  id: 'dados-modelagem',
  title: 'Lua da Modelagem',
  tagline: 'Antes do primeiro CREATE TABLE, alguém precisa desenhar o banco.',
  symbol: 'data-model',
  accent: '#c9a2ff',
  eyebrow: 'Satélite dos Dados · Lua da Modelagem',
  intro: [
    'Viajante, esta lua gira em volta da Era dos Dados. Lá embaixo você aprendeu a escrever SQL. Aqui a pergunta é outra: <b>como decidir que tabelas criar</b>?',
    'O Eco adora este lugar. Ele copia o mesmo dado em três tabelas e depois ri quando uma cópia discorda da outra. Modelar direito é o que tira esse poder dele.',
    'Vamos desenhar entidades, ligar relacionamentos e arrumar tabela bagunçada até nada se repetir à toa. Bora?',
  ],
  modules: dadosModelagemModules,
  lab: 'sql',
  bossFight: {
    bossName: 'O Duplicador',
    tagline: 'TODO DADO EM DOIS LUGARES, NENHUM CERTO',
    intro: [
      'O Duplicador é uma cópia do Eco que não sabe fazer nada uma vez só. Ele escreve o nome do cliente em cada pedido, o e-mail em três tabelas e ri quando uma cópia discorda da outra.',
      'Ele só perde para quem sabe desenhar o banco: quem enxerga as entidades, liga os relacionamentos certos e tira a repetição.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'duplicador.sql',
    rounds: [
      {
        title: 'Rodada 1 — Quem é quem',
        description:
          'Uma escola guarda alunos (com nome e e-mail), cursos e em quais cursos cada aluno está matriculado. Quais são as entidades?',
        talk: 'Entidade? Cada campo vira uma tabela, oras!',
        hint: 'Entidade é uma "coisa" sobre a qual se guardam dados. Nome e e-mail são atributos do aluno.',
        check: ['^aluno,\\s*curso\\s+e\\s+matr[ií]cula$'],
        choices: {
          correct: 'Aluno, Curso e Matrícula',
          wrong: ['Nome, E-mail e Curso', 'Escola, Nome e E-mail', 'Aluno, Nome e E-mail'],
        },
      },
      {
        title: 'Rodada 2 — O laço certo',
        description: 'Um cliente faz vários pedidos, e cada pedido é de um cliente só. Que relacionamento é esse?',
        talk: 'Liga tudo com tudo. N:N em todo lugar!',
        hint: 'Um lado tem muitos, o outro tem um só.',
        check: ['^1\\s*:\\s*n$'],
        choices: { correct: '1:N', wrong: ['N:N', '1:1', '0:0'] },
      },
      {
        title: 'Rodada 3 — Golpe final: a tabela bagunçada',
        description:
          'A tabela pedidos(id, cliente_nome, cliente_email, produto) repete o nome e o e-mail do cliente em todo pedido. O que a normalização manda fazer?',
        talk: 'Repetir é mais seguro. Se uma cópia sumir, tem outra!',
        hint: 'Os dados do cliente moram numa tabela só; o pedido guarda só a chave dele.',
        check: ['^criar a tabela clientes e guardar s[oó] o cliente_id em pedidos$'],
        choices: {
          correct: 'Criar a tabela clientes e guardar só o cliente_id em pedidos',
          wrong: [
            'Repetir o e-mail em mais uma coluna para garantir',
            'Juntar nome e e-mail numa coluna de texto só',
            'Apagar a coluna de e-mail dos pedidos e pronto',
          ],
        },
      },
    ],
    badgeId: 'sql-arquiteto',
    badgeTitle: 'Arquiteto de Dados',
    badgeDescription: 'Desmontou o Duplicador com entidades, relacionamentos e normalização: a coroa da Lua da Modelagem.',
  },
};
