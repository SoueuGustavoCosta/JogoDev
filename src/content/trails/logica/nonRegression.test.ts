import { describe, expect, it } from 'vitest';
import { trailSchema } from '@/domain/trail';
import { logicaTrail } from './trail';
import { logicaModules } from './modules';

/**
 * Teste de não regressão do conteúdo migrado de Ilha_da_Logica_PHP_1.html: os 10 faróis,
 * na mesma ordem, com quiz preservado, além da validação Zod exigida pela seção 11 do
 * CLAUDE.md (um erro de conteúdo quebra o CI, não a tela do aluno).
 */
describe('conteúdo da Era da Lógica (logica)', () => {
  it('preserva os 10 faróis do protótipo, na mesma ordem', () => {
    expect(logicaModules).toHaveLength(10);
    expect(logicaModules.map((m) => m.id)).toEqual([
      'origem',
      'ola',
      'variaveis',
      'operadores',
      'decisoes',
      'loops',
      'arrays',
      'funcoes',
      'web',
      'velha',
    ]);
  });

  it('cada módulo tem pelo menos um bloco e um item de quiz', () => {
    for (const mod of logicaModules) {
      expect(mod.blocks.length, `módulo ${mod.id} sem blocos`).toBeGreaterThan(0);
      expect(mod.quiz.length, `módulo ${mod.id} sem quiz`).toBeGreaterThan(0);
    }
  });

  // Decisão do autor (Etapa 4): a contagem exata (31 múltipla escolha + 23 completar) virou
  // "nenhuma pergunta sumiu e o total não diminui". Uma pergunta pode mudar de formato (ex.:
  // múltipla escolha -> montar a linha) levando o id junto, e perguntas novas podem entrar.
  it('não perde nenhuma das 54 perguntas do protótipo (total ≥ 54; formatos podem mudar)', () => {
    const allQuiz = logicaModules.flatMap((m) => m.quiz);
    expect(allQuiz.length).toBeGreaterThanOrEqual(54);
    // Ids das perguntas do protótipo em cada módulo (q1..qN, Etapa 3.5): todos continuam existindo.
    const original: Record<string, number> = { origem: 5, ola: 5, variaveis: 6, operadores: 6, decisoes: 5, loops: 6, arrays: 6, funcoes: 6, web: 5, velha: 4 };
    for (const mod of logicaModules) {
      const ids = mod.quiz.map((q) => q.id);
      for (let n = 1; n <= (original[mod.id] ?? 0); n++) expect(ids, `${mod.id} perdeu a pergunta q${n}`).toContain(`q${n}`);
    }
    expect(Object.values(original).reduce((a, b) => a + b, 0)).toBe(54);
  });

  it('valida a trilha inteira contra o esquema Zod de conteúdo', () => {
    expect(() => trailSchema.parse(logicaTrail)).not.toThrow();
  });

  it('a trilha tem o laboratório de PHP e usa o símbolo "logic-diamond"', () => {
    expect(logicaTrail.lab).toBe('php');
    expect(logicaTrail.symbol).toBe('logic-diamond');
  });

  it('a conversa de chegada com a Senhorita Sintaxe é uma sequência de falas curtas', () => {
    expect(Array.isArray(logicaTrail.intro)).toBe(true);
    expect(logicaTrail.intro!.length).toBeGreaterThanOrEqual(2);
    expect(logicaTrail.intro!.length).toBeLessThanOrEqual(4);
    for (const line of logicaTrail.intro!) {
      expect(line.length).toBeGreaterThan(0);
    }
  });
});

describe('boss fight da Era da Lógica (Loopus Infinitus)', () => {
  it('tem o formato single-shot com as 10 rodadas do protótipo', () => {
    const bossFight = logicaTrail.bossFight;
    expect(bossFight).toBeDefined();
    expect(bossFight?.bossName).toBe('Loopus Infinitus');
    expect(bossFight?.mode).toBe('single-shot');
    expect(bossFight?.rounds).toHaveLength(10);
    expect(bossFight?.intro.length).toBeGreaterThanOrEqual(2);
    expect(bossFight?.badgeId).toBe('problemas');
  });

  it('cada padrão de cada rodada é uma fonte de regex válida', () => {
    const rounds = logicaTrail.bossFight?.mode === 'single-shot' ? logicaTrail.bossFight.rounds : [];
    expect(rounds.length).toBeGreaterThan(0);
    for (const round of rounds) {
      for (const pattern of round.check) {
        expect(() => new RegExp(pattern)).not.toThrow();
      }
    }
  });
});
