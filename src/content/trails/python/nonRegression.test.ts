import { describe, expect, it } from 'vitest';
import { trailSchema } from '@/domain/trail';
import { badgeCatalog } from '@/content/badges/catalog';
import { pythonTrail } from './trail';
import { pythonModules } from './modules';

/**
 * Teste de conteúdo da Lua de Python: 8 faróis, o chefe Onduluk (regexes válidas),
 * o vínculo com o catálogo de insígnias, e a validação Zod exigida pela seção 11
 * do CLAUDE.md (um erro de conteúdo quebra o CI, não a tela do aluno).
 */
describe('conteúdo da Lua de Python', () => {
  it('tem os 8 faróis esperados, na ordem certa', () => {
    expect(pythonModules).toHaveLength(8);
    expect(pythonModules.map((m) => m.id)).toEqual([
      'nascimento-python',
      'sintaxe-e-tipos',
      'operadores-condicoes',
      'loops-python',
      'colecoes',
      'funcoes-python',
      'modulos-e-arquivos',
      'poo-python',
    ]);
  });

  it('cada módulo tem pelo menos um bloco e 5 itens de quiz', () => {
    for (const mod of pythonModules) {
      expect(mod.blocks.length, `módulo ${mod.id} sem blocos`).toBeGreaterThan(0);
      expect(mod.quiz.length, `módulo ${mod.id} com menos de 5 itens de quiz`).toBeGreaterThanOrEqual(5);
    }
  });

  it('nenhum id de módulo colide com os de outras trilhas (o catálogo de insígnias casa por id global)', () => {
    const ids = pythonModules.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo bloco de código é marcado nolab: true (a trilha ainda não tem laboratório)', () => {
    expect(pythonTrail.lab).toBeNull();
    for (const mod of pythonModules) {
      for (const block of mod.blocks) {
        if (block.t === 'code') {
          expect(block.nolab, `bloco ${block.file} do módulo ${mod.id} sem nolab`).toBe(true);
        }
      }
    }
  });

  it('valida a trilha inteira contra o esquema Zod de conteúdo', () => {
    expect(() => trailSchema.parse(pythonTrail)).not.toThrow();
  });

  it('usa o símbolo "python" e não tem laboratório ainda', () => {
    expect(pythonTrail.symbol).toBe('python');
    expect(pythonTrail.lab).toBeNull();
  });

  it('a conversa de chegada com a Senhorita Sintaxe é uma sequência de falas curtas', () => {
    expect(Array.isArray(pythonTrail.intro)).toBe(true);
    expect(pythonTrail.intro!.length).toBeGreaterThanOrEqual(2);
    expect(pythonTrail.intro!.length).toBeLessThanOrEqual(4);
    for (const line of pythonTrail.intro!) {
      expect(line.length).toBeGreaterThan(0);
    }
  });
});

describe('chefe de fase da Lua de Python (Onduluk)', () => {
  it('tem o formato single-shot com 8 rodadas e a insígnia certa', () => {
    const bossFight = pythonTrail.bossFight;
    expect(bossFight).toBeDefined();
    expect(bossFight?.bossName).toBe('Onduluk');
    expect(bossFight?.mode).toBe('single-shot');
    expect(bossFight?.rounds).toHaveLength(8);
    expect(bossFight?.intro.length).toBeGreaterThanOrEqual(2);
    expect(bossFight?.badgeId).toBe('py-onduluk');
  });

  it('cada padrão de cada rodada é uma fonte de regex válida', () => {
    const rounds = pythonTrail.bossFight?.mode === 'single-shot' ? pythonTrail.bossFight.rounds : [];
    expect(rounds.length).toBeGreaterThan(0);
    for (const round of rounds) {
      for (const pattern of round.check) {
        expect(() => new RegExp(pattern)).not.toThrow();
      }
    }
  });

  it('o golpe final prova a origem real do nome Python (Monty Python)', () => {
    const rounds = pythonTrail.bossFight?.mode === 'single-shot' ? pythonTrail.bossFight.rounds : [];
    const finalRound = rounds[rounds.length - 1];
    expect(finalRound.check.some((p) => new RegExp(p).test('monty python'))).toBe(true);
  });
});

describe('insígnias da Lua de Python', () => {
  it('tem 9 insígnias no catálogo (8 faróis + 1 coroa), todas com arquivo próprio', () => {
    const pythonBadges = badgeCatalog.filter((b) => b.trail === 'python');
    expect(pythonBadges).toHaveLength(9);
    expect(pythonBadges.filter((b) => b.crown)).toHaveLength(1);
    for (const badge of pythonBadges) {
      expect(badge.file.startsWith('python/')).toBe(true);
    }
  });

  it('cada módulo (exceto o chefe) desbloqueia exatamente uma insígnia do catálogo', () => {
    const pythonBadges = badgeCatalog.filter((b) => b.trail === 'python' && !b.crown);
    const moduleIds = pythonModules.map((m) => m.id);
    for (const moduleId of moduleIds) {
      expect(pythonBadges.filter((b) => b.unlockedBy === moduleId)).toHaveLength(1);
    }
  });

  it('a insígnia da coroa bate com o badgeId do chefe de fase', () => {
    const crown = badgeCatalog.find((b) => b.trail === 'python' && b.crown);
    expect(crown?.id).toBe(pythonTrail.bossFight?.badgeId);
  });
});
