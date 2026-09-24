import { describe, expect, it } from 'vitest';
import { trailSchema } from '@/domain/trail';
import { badgeCatalog } from '@/content/badges/catalog';
import { phpTrail } from './trail';
import { phpModules } from './modules';

/**
 * Teste de conteúdo da Lua de PHP: 8 faróis, o chefe Malabari (regexes válidas),
 * o vínculo com o catálogo de insígnias, e a validação Zod exigida pela seção 11
 * do CLAUDE.md (um erro de conteúdo quebra o CI, não a tela do aluno).
 */
describe('conteúdo da Lua de PHP', () => {
  it('tem os 8 faróis esperados, na ordem certa', () => {
    expect(phpModules).toHaveLength(8);
    expect(phpModules.map((m) => m.id)).toEqual([
      'nascimento-php',
      'sintaxe-tipos-php',
      'operadores-condicoes-php',
      'loops-php',
      'arrays-php',
      'funcoes-php',
      'poo-php',
      'superglobais-web-php',
    ]);
  });

  it('cada módulo tem pelo menos um bloco e 5 itens de quiz', () => {
    for (const mod of phpModules) {
      expect(mod.blocks.length, `módulo ${mod.id} sem blocos`).toBeGreaterThan(0);
      expect(mod.quiz.length, `módulo ${mod.id} com menos de 5 itens de quiz`).toBeGreaterThanOrEqual(5);
    }
  });

  it('nenhum id de módulo colide com os de outras trilhas (o catálogo de insígnias casa por id global)', () => {
    const ids = phpModules.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo bloco de código é marcado nolab: true (esta trilha não reusa o laboratório da Era da Lógica)', () => {
    expect(phpTrail.lab).toBeNull();
    for (const mod of phpModules) {
      for (const block of mod.blocks) {
        if (block.t === 'code') {
          expect(block.nolab, `bloco ${block.file} do módulo ${mod.id} sem nolab`).toBe(true);
        }
      }
    }
  });

  it('valida a trilha inteira contra o esquema Zod de conteúdo', () => {
    expect(() => trailSchema.parse(phpTrail)).not.toThrow();
  });

  it('usa o símbolo "php" e não tem laboratório ainda', () => {
    expect(phpTrail.symbol).toBe('php');
    expect(phpTrail.lab).toBeNull();
  });

  it('a conversa de chegada com a Senhorita Sintaxe é uma sequência de falas curtas', () => {
    expect(Array.isArray(phpTrail.intro)).toBe(true);
    expect(phpTrail.intro!.length).toBeGreaterThanOrEqual(2);
    expect(phpTrail.intro!.length).toBeLessThanOrEqual(4);
    for (const line of phpTrail.intro!) {
      expect(line.length).toBeGreaterThan(0);
    }
  });
});

describe('chefe de fase da Lua de PHP (Malabari)', () => {
  it('tem o formato single-shot com 8 rodadas e a insígnia certa', () => {
    const bossFight = phpTrail.bossFight;
    expect(bossFight).toBeDefined();
    expect(bossFight?.bossName).toBe('Malabari');
    expect(bossFight?.mode).toBe('single-shot');
    expect(bossFight?.rounds).toHaveLength(8);
    expect(bossFight?.intro.length).toBeGreaterThanOrEqual(2);
    expect(bossFight?.badgeId).toBe('php-malabari');
  });

  it('cada padrão de cada rodada é uma fonte de regex válida', () => {
    const rounds = phpTrail.bossFight?.mode === 'single-shot' ? phpTrail.bossFight.rounds : [];
    expect(rounds.length).toBeGreaterThan(0);
    for (const round of rounds) {
      for (const pattern of round.check) {
        expect(() => new RegExp(pattern)).not.toThrow();
      }
    }
  });

  it('o golpe final prova a versão real do PHP que corrigiu a comparação solta (PHP 8)', () => {
    const rounds = phpTrail.bossFight?.mode === 'single-shot' ? phpTrail.bossFight.rounds : [];
    const finalRound = rounds[rounds.length - 1];
    expect(finalRound.check.some((p) => new RegExp(p).test('8'))).toBe(true);
  });
});

describe('insígnias da Lua de PHP', () => {
  it('tem 9 insígnias no catálogo (8 faróis + 1 coroa), todas com arquivo próprio', () => {
    const phpBadges = badgeCatalog.filter((b) => b.trail === 'php');
    expect(phpBadges).toHaveLength(9);
    expect(phpBadges.filter((b) => b.crown)).toHaveLength(1);
    for (const badge of phpBadges) {
      expect(badge.file.startsWith('php/')).toBe(true);
    }
  });

  it('cada módulo (exceto o chefe) desbloqueia exatamente uma insígnia do catálogo', () => {
    const phpBadges = badgeCatalog.filter((b) => b.trail === 'php' && !b.crown);
    const moduleIds = phpModules.map((m) => m.id);
    for (const moduleId of moduleIds) {
      expect(phpBadges.filter((b) => b.unlockedBy === moduleId)).toHaveLength(1);
    }
  });

  it('a insígnia da coroa bate com o badgeId do chefe de fase', () => {
    const crown = badgeCatalog.find((b) => b.trail === 'php' && b.crown);
    expect(crown?.id).toBe(phpTrail.bossFight?.badgeId);
  });
});
