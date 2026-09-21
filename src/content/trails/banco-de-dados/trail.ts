import type { Trail } from '@/domain/trail/types';
import { bancoDeDadosModules } from './modules';
import { bancoDeDadosMissions } from './missions';

export const bancoDeDadosTrail: Trail = {
  id: 'banco-de-dados',
  title: 'Banco de Dados',
  tagline: 'Do primeiro CREATE TABLE às transações: PostgreSQL de verdade, no seu navegador.',
  symbol: 'database-cylinder',
  accent: '#9b4dff',
  modules: bancoDeDadosModules,
  missions: bancoDeDadosMissions,
  lab: 'sql',
  bossFight: {
    bossName: 'O Auditor',
    tagline: 'AUDITORIA FINAL',
    intro: [
      'Essa é a última parada da Era dos Dados. Um auditor chamado <b>O Auditor</b> guarda a saída — e ele não deixa passar quem só decorou sintaxe.',
      'O Eco tentou enganá-lo antes de você, com atalhos e gambiarra. Não funcionou: O Auditor lembra de cada dado malfeito.',
      'Três rodadas: modelar, consultar, corrigir com segurança. Erre com calma, acerte com certeza. Bora provar que você aprendeu de verdade?',
    ],
    lifeLabel: '☕',
    mode: 'single-shot',
    rounds: [
      {
        title: 'Rodada 1 — Modele sem redundância',
        description: 'Crie a tabela "pedidos" com uma chave estrangeira apontando para "clientes".',
        talk: 'Vamos ver se você sabe modelar ou só decorou sintaxe.',
        hint: 'Precisa de CREATE TABLE pedidos (... , FOREIGN KEY (cliente_id) REFERENCES clientes(id));',
        check: ['create\\s+table', 'pedidos', 'foreign\\s+key', 'references'],
      },
      {
        title: 'Rodada 2 — Junte as pontas',
        description:
          'Traga nome do cliente e total do pedido, só dos pedidos acima de 100, do mais caro pro mais barato.',
        talk: 'Boa. Mas modelar é fácil — agora prove que sabe consultar.',
        hint: 'SELECT clientes.nome, pedidos.total FROM clientes JOIN pedidos ON ... WHERE pedidos.total > 100 ORDER BY pedidos.total DESC;',
        check: ['select', 'join', 'where', 'order\\s+by'],
      },
      {
        title: 'Rodada 3 — Corrija com segurança',
        description: 'Atualize o status do pedido 42 para "enviado" sem arriscar os outros pedidos.',
        talk: 'Certo. Última rodada: mexer em produção sem destruir nada.',
        hint: "UPDATE pedidos SET status = 'enviado' WHERE id = 42;",
        // O último padrão é uma negação (lookahead): reprova quem usar DELETE, igual ao protótipo.
        check: ['update', 'set', 'where', '42', '^(?!.*delete)[\\s\\S]*$'],
      },
    ],
    badgeId: 'guardiao-banco-de-dados',
    badgeTitle: 'Guardião do Banco de Dados',
    badgeDescription:
      'Concedida a quem modela, consulta e altera dados sem quebrar nada — nas três frentes da Era do Banco de Dados.',
  },
};
