import { describe, expect, it } from 'vitest';
import { badgeCatalogSchema } from '@/domain/badges';
import { badgeCatalog } from './catalog';

/**
 * Teste de não regressão do catálogo compartilhado de insígnias (ver manifest.json fornecido
 * pelo autor): as 51 insígnias originais do manifesto continuam intactas, mais 10 para cada
 * uma das três luas satélite (Python, Java, PHP), no modelo de 3 níveis pedido pelo autor —
 * até 8 insígnias comuns (uma por módulo), 1 rara (ao concluir a trilha inteira, antes do
 * chefe) e 1 lendária/coroa (ao vencer o chefe) — arte própria em SVG, ver
 * public/badges/<lua>/. Total: 81. Coroas: uma por chefe de fase já ligado (Ilha da Lógica,
 * banco de dados, git-github, e as três luas; "outras" não tem chefe, então não tem coroa).
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

  it('se distribui pelas trilhas do manifesto original (logica: 13, sql: 16, git: 18, outras: 4) mais python: 10, java: 10 e php: 10', () => {
    const byTrail = (trail: string) => badgeCatalog.filter((b) => b.trail === trail).length;
    expect(byTrail('logica')).toBe(13);
    expect(byTrail('sql')).toBe(16);
    expect(byTrail('git')).toBe(18);
    expect(byTrail('outras')).toBe(4);
    expect(byTrail('python')).toBe(10);
    expect(byTrail('java')).toBe(10);
    expect(byTrail('php')).toBe(10);
  });

  it('tem uma insígnia-coroa (lendária) por chefe de fase já existente', () => {
    const crowns = badgeCatalog.filter((b) => b.crown).map((b) => b.id);
    // Chefes das eras e luas, mais os das Ramificações (Evento Nexus, `ram-*`).
    expect(crowns.sort()).toEqual([
      'git-mestre',
      'java-nulo',
      'php-malabari',
      'problemas',
      'py-onduluk',
      'ram-codeigniter-faisca',
      'ram-django-monolito',
      'ram-fastapi-hidra',
      'ram-flask-borbulha',
      'ram-javalin-fantasma',
      'ram-laravel-artesao',
      'ram-quarkus-partida',
      'ram-spring-colecionador',
      'ram-symfony-sinfonia',
      // Luas da Era dos Dados (Etapa 14C)
      'sql-arquiteto',
      'sql-guardiao-transacoes',
      'sql-mestre',
      // Era da Web: a lendária do Eco e as coroas das 3 luas.
      'web-coroa-marcacao',
      'web-motor-eventos',
      'web-prisma-cascata',
      'web-tecelao-www',
    ]);
  });

  // Insígnias dos Cometas de tecnologia (expansão Nexus): a rara vem do chefe vencido durante
  // o evento (unlockedBy "boss"), não do troféu; ficam de fora das regras das luas.
  const isComet = (b: { trail: string }) => b.trail.startsWith('cometa-');
  // Era da Web: a rara vem do chefe Eco (e a lendária, dele sem perder coração), não do troféu.
  const isWeb = (b: { trail: string }) => b.trail === 'web';

  it('tem exatamente 3 insígnias raras de lua: uma por lua satélite (Python, Java, PHP)', () => {
    const rares = badgeCatalog.filter((b) => b.rare && !isComet(b) && !isWeb(b)).map((b) => b.id);
    expect(rares.sort()).toEqual(['java-rara', 'php-rara', 'py-rara']);
  });

  it('cada cometa tem uma insígnia rara e uma comum, as duas pelo chefe', () => {
    const comet = badgeCatalog.filter(isComet);
    expect(comet.filter((b) => b.rare).map((b) => b.id).sort()).toEqual(['cometa-docker-rara', 'cometa-git-rara', 'cometa-linux-rara']);
    expect(comet.filter((b) => !b.rare).map((b) => b.id).sort()).toEqual(['cometa-docker-comum', 'cometa-git-comum', 'cometa-linux-comum']);
    for (const b of comet) expect(b.unlockedBy, b.id).toBe('boss');
  });

  it('coroas usam unlockedBy "boss" e raras "trophy" (a legenda da carteira depende desses valores)', () => {
    for (const b of badgeCatalog.filter((x) => x.crown && x.unlockedBy !== null)) expect(b.unlockedBy, b.id).toBe('boss');
    for (const b of badgeCatalog.filter((x) => x.rare && !isComet(x) && !isWeb(x))) expect(b.unlockedBy, b.id).toBe('trophy');
  });

  it('nenhuma insígnia rara é também coroa (são níveis distintos)', () => {
    expect(badgeCatalog.every((b) => !(b.rare && b.crown))).toBe(true);
  });

  it('a Era da Web tem 15 insígnias: 10 das trilhas, a rara e a lendária do Eco e 3 das luas', () => {
    const web = badgeCatalog.filter(isWeb);
    expect(web).toHaveLength(15);
    expect(web.filter((b) => b.rare).map((b) => b.id)).toEqual(['web-guardiao-portfolio']);
    for (const b of web.filter((x) => x.rare)) expect(b.unlockedBy, b.id).toBe('boss');
  });

  it('"outras" não tem nenhuma insígnia com unlockedBy: nenhuma trilha existe ainda para elas', () => {
    const outras = badgeCatalog.filter((b) => b.trail === 'outras');
    expect(outras.every((b) => b.unlockedBy === null)).toBe(true);
  });
});
