import { describe, expect, it } from 'vitest';
import { badgeCatalogSchema } from '@/domain/badges';
import { badgeCatalog } from './catalog';

/**
 * Teste de não regressão do catálogo compartilhado de insígnias (ver manifest.json fornecido
 * pelo autor): as 51 insígnias originais do manifesto continuam intactas, mais 9 para cada
 * uma das três luas satélite (Python, Java, PHP — 8 faróis + 1 coroa cada, arte própria em
 * SVG, ver public/badges/<lua>/), totalizando 78. Coroas: uma por chefe de fase já ligado
 * (Ilha da Lógica, banco de dados, git-github, e as três luas; "outras" não tem chefe, então
 * não tem coroa).
 */
describe('catálogo compartilhado de insígnias', () => {
  it('valida contra o esquema Zod', () => {
    expect(() => badgeCatalogSchema.parse(badgeCatalog)).not.toThrow();
  });

  it('tem as 51 insígnias do manifesto original mais as novas trilhas de satélite', () => {
    expect(badgeCatalog.length).toBeGreaterThanOrEqual(51);
  });

  it('tem ids únicos', () => {
    const ids = badgeCatalog.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('se distribui pelas trilhas do manifesto original (logica: 13, sql: 16, git: 18, outras: 4) mais python: 9, java: 9 e php: 9', () => {
    const byTrail = (trail: string) => badgeCatalog.filter((b) => b.trail === trail).length;
    expect(byTrail('logica')).toBe(13);
    expect(byTrail('sql')).toBe(16);
    expect(byTrail('git')).toBe(18);
    expect(byTrail('outras')).toBe(4);
    expect(byTrail('python')).toBe(9);
    expect(byTrail('java')).toBe(9);
    expect(byTrail('php')).toBe(9);
  });

  it('tem exatamente 6 insígnias-coroa: uma por chefe de fase já existente', () => {
    const crowns = badgeCatalog.filter((b) => b.crown).map((b) => b.id);
    expect(crowns.sort()).toEqual(['git-mestre', 'java-nulo', 'php-malabari', 'problemas', 'py-onduluk', 'sql-mestre']);
  });

  it('"outras" não tem nenhuma insígnia com unlockedBy: nenhuma trilha existe ainda para elas', () => {
    const outras = badgeCatalog.filter((b) => b.trail === 'outras');
    expect(outras.every((b) => b.unlockedBy === null)).toBe(true);
  });
});
