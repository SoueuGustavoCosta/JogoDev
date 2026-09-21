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

  it('preserva os 54 itens de quiz do protótipo (31 múltipla escolha + 23 completar)', () => {
    const allQuiz = logicaModules.flatMap((m) => m.quiz);
    expect(allQuiz).toHaveLength(54);
    const fillCount = allQuiz.filter((q) => 'fill' in q).length;
    expect(fillCount).toBe(23);
    expect(allQuiz.length - fillCount).toBe(31);
  });

  it('valida a trilha inteira contra o esquema Zod de conteúdo', () => {
    expect(() => trailSchema.parse(logicaTrail)).not.toThrow();
  });

  it('a trilha não tem laboratório e usa o símbolo "logic-diamond"', () => {
    expect(logicaTrail.lab).toBeNull();
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
