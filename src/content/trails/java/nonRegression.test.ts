import { describe, expect, it } from 'vitest';
import { trailSchema } from '@/domain/trail';
import { badgeCatalog } from '@/content/badges/catalog';
import { javaTrail } from './trail';
import { javaModules } from './modules';

/**
 * Teste de conteúdo da Lua de Java: 8 faróis, o chefe Nulo (regexes válidas),
 * o vínculo com o catálogo de insígnias, e a validação Zod exigida pela seção 11
 * do CLAUDE.md (um erro de conteúdo quebra o CI, não a tela do aluno).
 */
describe('conteúdo da Lua de Java', () => {
  it('tem os 8 faróis esperados, na ordem certa', () => {
    expect(javaModules).toHaveLength(8);
    expect(javaModules.map((m) => m.id)).toEqual([
      'nascimento-java',
      'sintaxe-tipos-java',
      'operadores-condicoes-java',
      'loops-java',
      'arrays-colecoes-java',
      'metodos-java',
      'classes-objetos-java',
      'heranca-interfaces-java',
    ]);
  });

  it('cada módulo tem pelo menos um bloco e 5 itens de quiz', () => {
    for (const mod of javaModules) {
      expect(mod.blocks.length, `módulo ${mod.id} sem blocos`).toBeGreaterThan(0);
      expect(mod.quiz.length, `módulo ${mod.id} com menos de 5 itens de quiz`).toBeGreaterThanOrEqual(5);
    }
  });

  it('nenhum id de módulo colide com os de outras trilhas (o catálogo de insígnias casa por id global)', () => {
    const ids = javaModules.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo bloco de código é marcado nolab: true (a trilha ainda não tem laboratório)', () => {
    expect(javaTrail.lab).toBeNull();
    for (const mod of javaModules) {
      for (const block of mod.blocks) {
        if (block.t === 'code') {
          expect(block.nolab, `bloco ${block.file} do módulo ${mod.id} sem nolab`).toBe(true);
        }
      }
    }
  });

  it('valida a trilha inteira contra o esquema Zod de conteúdo', () => {
    expect(() => trailSchema.parse(javaTrail)).not.toThrow();
  });

  it('usa o símbolo "java" e não tem laboratório ainda', () => {
    expect(javaTrail.symbol).toBe('java');
    expect(javaTrail.lab).toBeNull();
  });

  it('a conversa de chegada com a Senhorita Sintaxe é uma sequência de falas curtas', () => {
    expect(Array.isArray(javaTrail.intro)).toBe(true);
    expect(javaTrail.intro!.length).toBeGreaterThanOrEqual(2);
    expect(javaTrail.intro!.length).toBeLessThanOrEqual(4);
    for (const line of javaTrail.intro!) {
      expect(line.length).toBeGreaterThan(0);
    }
  });
});

describe('chefe de fase da Lua de Java (Nulo)', () => {
  it('tem o formato single-shot com 8 rodadas e a insígnia certa', () => {
    const bossFight = javaTrail.bossFight;
    expect(bossFight).toBeDefined();
    expect(bossFight?.bossName).toBe('Nulo');
    expect(bossFight?.mode).toBe('single-shot');
    expect(bossFight?.rounds).toHaveLength(8);
    expect(bossFight?.intro.length).toBeGreaterThanOrEqual(2);
    expect(bossFight?.badgeId).toBe('java-nulo');
  });

  it('cada padrão de cada rodada é uma fonte de regex válida', () => {
    const rounds = javaTrail.bossFight?.mode === 'single-shot' ? javaTrail.bossFight.rounds : [];
    expect(rounds.length).toBeGreaterThan(0);
    for (const round of rounds) {
      for (const pattern of round.check) {
        expect(() => new RegExp(pattern)).not.toThrow();
      }
    }
  });

  it('o golpe final prova a origem real do null (Tony Hoare)', () => {
    const rounds = javaTrail.bossFight?.mode === 'single-shot' ? javaTrail.bossFight.rounds : [];
    const finalRound = rounds[rounds.length - 1];
    expect(finalRound.check.some((p) => new RegExp(p).test('tony hoare'))).toBe(true);
  });
});

describe('insígnias da Lua de Java', () => {
  it('tem 10 insígnias no catálogo (8 comuns + 1 rara + 1 lendária), todas com arquivo próprio', () => {
    const javaBadges = badgeCatalog.filter((b) => b.trail === 'java');
    expect(javaBadges).toHaveLength(10);
    expect(javaBadges.filter((b) => b.crown)).toHaveLength(1);
    expect(javaBadges.filter((b) => b.rare)).toHaveLength(1);
    for (const badge of javaBadges) {
      expect(badge.file.startsWith('java/')).toBe(true);
    }
  });

  it('a insígnia rara bate com o completionBadgeId da trilha', () => {
    const rare = badgeCatalog.find((b) => b.trail === 'java' && b.rare);
    expect(rare?.id).toBe(javaTrail.completionBadgeId);
  });

  it('cada módulo (exceto o chefe) desbloqueia exatamente uma insígnia do catálogo', () => {
    const javaBadges = badgeCatalog.filter((b) => b.trail === 'java' && !b.crown);
    const moduleIds = javaModules.map((m) => m.id);
    for (const moduleId of moduleIds) {
      expect(javaBadges.filter((b) => b.unlockedBy === moduleId)).toHaveLength(1);
    }
  });

  it('a insígnia da coroa bate com o badgeId do chefe de fase', () => {
    const crown = badgeCatalog.find((b) => b.trail === 'java' && b.crown);
    expect(crown?.id).toBe(javaTrail.bossFight?.badgeId);
  });
});
