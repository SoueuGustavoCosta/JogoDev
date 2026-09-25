import type { Trail } from '@/domain/trail/types';
import { bancoDeDadosModules } from './modules';
import { bancoDeDadosMissions } from './missions';

export const bancoDeDadosTrail: Trail = {
  id: 'banco-de-dados',
  title: 'Banco de Dados',
  tagline: 'Do primeiro CREATE TABLE às transações: PostgreSQL de verdade, no seu navegador.',
  symbol: 'database-cylinder',
  accent: '#9b4dff',
  eyebrow: 'Era 1 · 1963 → hoje',
  intro: [
    'Viajante, chegamos à <b>Era dos Dados</b> — 1963, o ano da lista de peças do foguete Saturn V. Antes de qualquer linha de SQL, existia só um monte de papel tentando não se perder.',
    'O Eco esteve aqui primeiro. Duplicou listas, escreveu o mesmo nome de três jeitos diferentes e deixou uma bagunça que nem a NASA soube resolver sozinha — até alguém inventar o modelo relacional.',
    'Vamos reorganizar essa bagunça, tabela por tabela, até você estar pronto para provar que sabe reconstruir tudo isso sem a era inteira do seu lado: o <b>Arquivista</b> está esperando. Bora?',
  ],
  modules: bancoDeDadosModules,
  missions: bancoDeDadosMissions,
  lab: 'sql',
  bossFight: {
    bossName: 'O Arquivista',
    tagline: 'O ARQUIVISTA GUARDA A SAÍDA',
    intro: [
      'O Eco não deixou só um bug aqui — deixou uma era inteira de dados soltos, sem forma, exatamente como ele encontrou antes de qualquer tabela existir.',
      'Ao vencer as três missões da era, um guardião nasceu da própria estrutura que você criou: o <b>Arquivista</b>, feito de tabelas e chaves que só existem porque você as desenhou — a prova de que a bagunça do Eco não teve a última palavra.',
      'Ele não é seu inimigo. Mas só vai te deixar passar se você souber reconstruir tudo isso de cabeça, sem a era inteira do seu lado.',
    ],
    lifeLabel: '☕',
    mode: 'single-shot',
    codeFile: 'desafio.sql',
    rounds: [
      {
        title: 'Rodada 1 — Modele sem redundância',
        description: 'Crie a tabela "pedidos" com uma chave estrangeira apontando para "clientes".',
        talk: 'Vamos ver se você sabe modelar ou só decorou sintaxe.',
        hint: 'Precisa de CREATE TABLE pedidos (... , FOREIGN KEY (cliente_id) REFERENCES clientes(id));',
        check: ['create\\s+table', 'pedidos', 'foreign\\s+key', 'references'],
        choices: { correct: 'CREATE TABLE pedidos (id SERIAL PRIMARY KEY, cliente_id INT, FOREIGN KEY (cliente_id) REFERENCES clientes(id));', wrong: ['CREATE TABLE pedidos (id SERIAL PRIMARY KEY, cliente_id INT);', 'SELECT * FROM pedidos JOIN clientes ON pedidos.cliente_id = clientes.id;', 'INSERT INTO pedidos (cliente_id) REFERENCES clientes(id);'] },
      },
      {
        title: 'Rodada 2 — Junte as pontas',
        description:
          'Traga nome do cliente e total do pedido, só dos pedidos acima de 100, do mais caro pro mais barato.',
        talk: 'Boa. Mas modelar é fácil — agora prove que sabe consultar.',
        hint: 'SELECT clientes.nome, pedidos.total FROM clientes JOIN pedidos ON ... WHERE pedidos.total > 100 ORDER BY pedidos.total DESC;',
        check: ['select', 'join', 'where', 'order\\s+by'],
        choices: { correct: 'SELECT clientes.nome, pedidos.total FROM clientes JOIN pedidos ON pedidos.cliente_id = clientes.id WHERE pedidos.total > 100 ORDER BY pedidos.total DESC;', wrong: ['SELECT clientes.nome, pedidos.total FROM clientes JOIN pedidos ON pedidos.cliente_id = clientes.id ORDER BY pedidos.total DESC;', 'SELECT nome, total FROM pedidos WHERE total > 100;', 'SELECT clientes.nome, pedidos.total FROM clientes JOIN pedidos ON pedidos.cliente_id = clientes.id WHERE pedidos.total > 100;'] },
      },
      {
        title: 'Rodada 3 — Corrija com segurança',
        description: 'Atualize o status do pedido 42 para "enviado" sem arriscar os outros pedidos.',
        talk: 'Certo. Última rodada: mexer em produção sem destruir nada.',
        hint: "UPDATE pedidos SET status = 'enviado' WHERE id = 42;",
        // O último padrão é uma negação (lookahead): reprova quem usar DELETE, igual ao protótipo.
        check: ['update', 'set', 'where', '42', '^(?!.*delete)[\\s\\S]*$'],
        choices: { correct: 'UPDATE pedidos SET status = \'enviado\' WHERE id = 42;', wrong: ['UPDATE pedidos SET status = \'enviado\';', 'DELETE FROM pedidos WHERE id = 42;', 'SELECT status FROM pedidos WHERE id = 42;'] },
      },
    ],
    badgeId: 'sql-mestre',
    badgeTitle: 'Guardião do Banco de Dados',
    badgeDescription:
      'Concedida a quem modela, consulta e altera dados sem quebrar nada — nas três frentes da Era do Banco de Dados.',
  },
};
