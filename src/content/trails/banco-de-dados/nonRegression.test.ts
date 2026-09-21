import { describe, expect, it } from 'vitest';
import { trailSchema } from '@/domain/trail';
import { PgliteEngine } from '@/infrastructure/sql';
import { bancoDeDadosTrail } from './trail';
import { bancoDeDadosModules } from './modules';
import { bancoDeDadosMissions } from './missions';

/**
 * Teste de não regressão exigido pela seção 1 (item 4) do CLAUDE-TEMPO.md e pela
 * seção 11 do CLAUDE.md: a migração de legacy/Trilha_PostgreSQL_com_Laboratorio.html
 * não pode perder nenhum dos 22 módulos, nenhum quiz, nenhuma das 12 missões, e todo
 * bloco de código deve continuar executando no PGlite como no protótipo original.
 */
describe('conteúdo da Era dos Dados (migração do protótipo)', () => {
  it('preserva os 22 módulos do protótipo, na mesma ordem final', () => {
    expect(bancoDeDadosModules).toHaveLength(22);
    expect(bancoDeDadosModules.map((m) => m.id)).toEqual([
      'porque',
      'tipos',
      'arquitetura',
      'interface',
      'sintaxe',
      'tiposdados',
      'relacional',
      'create',
      'insert',
      'where',
      'update',
      'mer',
      'join',
      'algebra',
      'agg',
      'subconsultas',
      'norm',
      'indices',
      'transacoes',
      'views',
      'seguranca',
      'projeto',
    ]);
  });

  it('preserva as 12 missões práticas do laboratório', () => {
    expect(bancoDeDadosMissions).toHaveLength(12);
    expect(bancoDeDadosMissions.map((m) => m.id)).toEqual([
      'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12',
    ]);
  });

  it('preserva os 84 itens de quiz do protótipo (81 múltipla escolha + 3 completar)', () => {
    const allQuiz = bancoDeDadosModules.flatMap((m) => m.quiz);
    expect(allQuiz).toHaveLength(84);
    const fillCount = allQuiz.filter((q) => 'fill' in q).length;
    expect(fillCount).toBe(3);
    expect(allQuiz.length - fillCount).toBe(81);
  });

  it('cada módulo tem pelo menos um bloco e um item de quiz', () => {
    for (const mod of bancoDeDadosModules) {
      expect(mod.blocks.length, `módulo ${mod.id} sem blocos`).toBeGreaterThan(0);
      expect(mod.quiz.length, `módulo ${mod.id} sem quiz`).toBeGreaterThan(0);
    }
  });

  it('valida a trilha inteira contra o esquema Zod de conteúdo', () => {
    expect(() => trailSchema.parse(bancoDeDadosTrail)).not.toThrow();
  });
});

describe('boss fight da Era dos Dados (O Arquivista)', () => {
  it('tem o formato single-shot com as 3 rodadas do protótipo', () => {
    const bossFight = bancoDeDadosTrail.bossFight;
    expect(bossFight).toBeDefined();
    expect(bossFight?.bossName).toBe('O Arquivista');
    expect(bossFight?.mode).toBe('single-shot');
    expect(bossFight?.rounds).toHaveLength(3);
    expect(bossFight?.intro.length).toBeGreaterThanOrEqual(2);
    expect(bossFight?.badgeId).toBe('sql-mestre');
  });

  it('cada padrão de cada rodada é uma fonte de regex válida', () => {
    const rounds = bancoDeDadosTrail.bossFight?.mode === 'single-shot' ? bancoDeDadosTrail.bossFight.rounds : [];
    expect(rounds.length).toBeGreaterThan(0);
    for (const round of rounds) {
      for (const pattern of round.check) {
        expect(() => new RegExp(pattern)).not.toThrow();
      }
    }
  });
});

describe('blocos de código da Era dos Dados executam no PGlite', () => {
  const SEEDED_TABLES = ['categorias', 'produtos', 'clientes', 'pedidos', 'contas'];

  /** Um módulo precisa do banco vazio quando recria, do zero, uma das tabelas seedadas. */
  function needsEmptyDataset(mod: (typeof bancoDeDadosModules)[number]): boolean {
    return mod.blocks.some(
      (b) =>
        b.t === 'code' &&
        !b.nolab &&
        SEEDED_TABLES.some((table) => new RegExp(`create\\s+table\\s+${table}\\b`, 'i').test(b.x)),
    );
  }

  /**
   * Módulos cujo dataset de partida é o banco vazio, porque ensinam a construir o
   * schema do zero (CREATE TABLE das mesmas tabelas do dataset "loja de exemplo").
   * Cada bloco do módulo roda em sequência dentro do mesmo dataset, mas cada
   * MÓDULO começa de um estado conhecido — os blocos não vazam efeito colateral
   * para o módulo seguinte (ex.: o módulo "create" também demonstra DROP TABLE
   * a título de exemplo de sintaxe, o que não deve afetar o módulo "insert").
   * O módulo "insert" entra aqui manualmente: ele não recria as tabelas, só as
   * povoa (usa o pré-requisito abaixo para criá-las primeiro).
   */
  const STARTS_EMPTY = new Set(['insert', ...bancoDeDadosModules.filter(needsEmptyDataset).map((m) => m.id)]);

  /**
   * O módulo "insert" povoa exatamente as tabelas criadas pelo bloco
   * 02_criar_tabelas.sql do módulo "create" — precisa delas já existindo antes
   * de rodar seus próprios blocos (o módulo "create" segue e também demonstra
   * ALTER/DROP mais adiante, o que não deve interferir aqui).
   */
  const PREREQUISITES: Record<string, { moduleId: string; file: string }[]> = {
    insert: [{ moduleId: 'create', file: '02_criar_tabelas.sql' }],
  };

  function findBlock(moduleId: string, file: string) {
    const mod = bancoDeDadosModules.find((m) => m.id === moduleId);
    const block = mod?.blocks.find((b) => b.t === 'code' && b.file === file);
    if (!block || block.t !== 'code') {
      throw new Error(`bloco de pré-requisito não encontrado: ${moduleId}/${file}`);
    }
    return block;
  }

  it('executa todo bloco `code` (exceto `nolab`) sem erro inesperado', async () => {
    const engine = new PgliteEngine();
    await engine.init();

    for (const mod of bancoDeDadosModules) {
      await engine.reset(STARTS_EMPTY.has(mod.id) ? 'vazio' : 'loja');

      for (const prereq of PREREQUISITES[mod.id] ?? []) {
        const prereqBlock = findBlock(prereq.moduleId, prereq.file);
        const setupResult = await engine.run(prereqBlock.x);
        const setupErrors = setupResult.filter((b) => b.kind === 'err');
        if (setupErrors.length) {
          throw new Error(
            `pré-requisito ${prereq.moduleId}/${prereq.file} para o módulo ${mod.id} falhou: ${setupErrors.map((b) => b.msg).join(' | ')}`,
          );
        }
      }

      for (const block of mod.blocks) {
        if (block.t !== 'code' || block.nolab) continue;

        // Limpa uma transação abortada deixada de propósito por um bloco anterior
        // (ex.: uma demonstração de erro seguida de ROLLBACK que não chegou a rodar).
        await engine.run('ROLLBACK');

        const result = await engine.run(block.x);
        const errorBlocks = result.filter((b) => b.kind === 'err');

        if (block.expectError) {
          expect(
            errorBlocks.length > 0,
            `esperava um erro proposital em ${mod.id}/${block.file}, mas o bloco rodou sem erro`,
          ).toBe(true);
        } else if (errorBlocks.length > 0) {
          const messages = errorBlocks.map((b) => b.msg).join(' | ');
          throw new Error(`Erro inesperado em ${mod.id}/${block.file}: ${messages}`);
        }
      }
    }
  }, 60000);
});

describe('missões práticas: a solução de referência executa no dataset indicado', () => {
  it.each(bancoDeDadosMissions.filter((m) => m.kind === 'select'))(
    'missão $id ($title): a query de referência roda sem erro no dataset "$ds"',
    async (mission) => {
      const engine = new PgliteEngine();
      await engine.reset(mission.ds);
      await expect(engine.query((mission as { solution: string }).solution)).resolves.toBeDefined();
    },
  );
});
