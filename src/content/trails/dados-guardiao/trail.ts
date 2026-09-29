import type { Trail } from '@/domain/trail/types';
import { dadosGuardiaoModules } from './modules';

/**
 * Lua do Guardião (Etapa 14A): segunda lua da Era dos Dados. Recebeu os módulos avançados
 * que antes fechavam a ilha principal: índices, transações, views, segurança e o projeto
 * final (os ids não mudaram; o progresso foi junto, ver `content/relocations.ts`). Chefe e
 * insígnia: Etapa 14C.
 */
export const dadosGuardiaoTrail: Trail = {
  id: 'dados-guardiao',
  title: 'Lua do Guardião',
  tagline: 'Um banco de verdade precisa ser rápido, consistente e bem trancado.',
  symbol: 'data-guard',
  accent: '#3ee0a1',
  eyebrow: 'Satélite dos Dados · Lua do Guardião',
  intro: [
    'Viajante, esta é a lua de quem cuida do banco depois que ele está no ar. Aqui ninguém pergunta só "funciona?", pergunta também "aguenta?".',
    'O Eco deixou armadilhas: consultas lentas, transações pela metade e portas abertas para quem não devia entrar.',
    'Vamos acelerar com índices, fechar transações do jeito certo e dar a cada pessoa só a permissão que ela precisa. No fim, um projeto inteiro seu. Bora?',
  ],
  modules: dadosGuardiaoModules,
  lab: 'sql',
  bossFight: {
    bossName: 'O Impasse',
    tagline: 'TUDO TRAVADO, TUDO ABERTO',
    intro: [
      'O Impasse é um fragmento do Eco feito de cadeados. Ele deixa as consultas lentas, larga transações pela metade e, ao mesmo tempo, dá a chave de tudo para qualquer um.',
      'Para passar, você precisa cuidar do banco como um guardião: acelerar o que é lento, fechar o que ficou aberto e trancar o que não devia estar à mostra.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'impasse.sql',
    rounds: [
      {
        title: 'Rodada 1 — A consulta que trava',
        description: 'SELECT * FROM pedidos WHERE cliente_id = 7 está lenta numa tabela enorme. Qual comando ajuda?',
        talk: 'Lento é bom. Dá tempo de pensar.',
        hint: 'O índice vai na coluna usada no WHERE.',
        check: ['^create\\s+index\\s+\\w+\\s+on\\s+pedidos\\s*\\(\\s*cliente_id\\s*\\);?$'],
        choices: {
          correct: 'CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);',
          wrong: ['CREATE INDEX idx_pedidos_total ON pedidos (total);', 'DROP TABLE pedidos;', 'SELECT * FROM pedidos;'],
        },
      },
      {
        title: 'Rodada 2 — A transferência pela metade',
        description: 'Dentro de uma transação, você tirou 100 da conta 1, mas deu erro antes de colocar na conta 2. Como desfazer tudo?',
        talk: 'Confirma assim mesmo. Dinheiro sumido é problema de outro.',
        hint: 'COMMIT confirma; o outro comando desfaz tudo desde o BEGIN.',
        check: ['^rollback;?$'],
        choices: { correct: 'ROLLBACK;', wrong: ['COMMIT;', 'BEGIN;', 'END;'] },
      },
      {
        title: 'Rodada 3 — Golpe final: a porta escancarada',
        description: 'O usuário relatorio só precisa ler a tabela pedidos. Qual permissão dar?',
        talk: 'Dá tudo para todo mundo. Ninguém vai reclamar.',
        hint: 'Só a leitura, só naquela tabela.',
        check: ['^grant\\s+select\\s+on\\s+pedidos\\s+to\\s+relatorio;?$'],
        choices: {
          correct: 'GRANT SELECT ON pedidos TO relatorio;',
          wrong: [
            'GRANT ALL PRIVILEGES ON pedidos TO relatorio;',
            'GRANT SELECT, DELETE ON pedidos TO relatorio;',
            'GRANT SELECT ON ALL TABLES IN SCHEMA public TO relatorio;',
          ],
        },
      },
    ],
    badgeId: 'sql-guardiao-transacoes',
    badgeTitle: 'Guardião das Transações',
    badgeDescription: 'Destravou o Impasse com índice, transação e a permissão certa: a coroa da Lua do Guardião.',
  },
};
