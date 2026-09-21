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
    bossName: 'O Arquivista',
    tagline: 'O ARQUIVISTA GUARDA A SAÍDA',
    intro: [
      'Antes de você chegar, ninguém tinha dado forma aos dados dessa era — só ruído solto no tempo.',
      'Ao vencer as três missões da ilha, um guardião nasceu da própria estrutura que você criou: o <b>Arquivista</b>, feito de tabelas e chaves que só existem porque você as desenhou.',
      'Ele não é seu inimigo — é a prova de que a era pode seguir em frente. Mas só vai te deixar passar se você souber reconstruir tudo isso de cabeça, sem a ilha inteira do seu lado.',
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
    badgeId: 'sql-mestre',
    badgeTitle: 'Guardião do Banco de Dados',
    badgeDescription:
      'Concedida a quem modela, consulta e altera dados sem quebrar nada — nas três frentes da Era do Banco de Dados.',
  },
};
