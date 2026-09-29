import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import {
  buildCodePreview,
  webBossSchema,
  webBranchSchema,
  webEraTrailSchema,
  webMoonSchema,
  type CodeMission,
  type WebMission,
} from '@/domain/webEra';
import { gemSvg } from '@/presentation/design-system/gemSvg';
import { badgeCatalog } from './badges/catalog';
import { ecoBoss, webBranches, webEraCopy, webEraGems, webEraTrails, webMoons } from './webEra';

/** Todas as missões, com um rótulo para as mensagens de erro. */
const missions: [string, WebMission][] = [
  ...webEraTrails.flatMap((t) => t.rounds.map((r, i): [string, WebMission] => [`${t.id} #${i + 1}`, r])),
  ...ecoBoss.rounds.map((r, i): [string, WebMission] => [`eco #${i + 1}`, r]),
  ...webMoons.flatMap((m) => [
    ...m.trails.flatMap((t) => t.rounds.map((r, i): [string, WebMission] => [`${t.id} #${i + 1}`, r])),
    ...m.boss.rounds.map((r, i): [string, WebMission] => [`${m.boss.id} #${i + 1}`, r]),
  ]),
];
const codeMissions = missions.filter((m): m is [string, CodeMission] => m[1].type === 'code');

describe('Era da Web: conteúdo', () => {
  it('valida contra os esquemas Zod', () => {
    for (const t of webEraTrails) expect(() => webEraTrailSchema.parse(t), t.id).not.toThrow();
    expect(() => webBossSchema.parse(ecoBoss)).not.toThrow();
    for (const m of webMoons) expect(() => webMoonSchema.parse(m), m.id).not.toThrow();
    for (const b of webBranches) expect(() => webBranchSchema.parse(b), b.id).not.toThrow();
  });

  it('tem 10 trilhas, o Eco com 6 missões e 3 luas (HTML, CSS, JS) com 5 trilhas + chefe', () => {
    expect(webEraTrails).toHaveLength(10);
    expect(ecoBoss.rounds).toHaveLength(6);
    expect(webMoons.map((m) => m.short)).toEqual(['HTML', 'CSS', 'JS']);
    for (const m of webMoons) expect(m.trails, m.id).toHaveLength(5);
  });

  it('ids de etapa únicos em toda a era (o progresso é guardado por eles)', () => {
    const ids = [...webEraTrails.map((t) => t.id), ecoBoss.id, ...webMoons.flatMap((m) => [...m.trails.map((t) => t.id), m.boss.id])];
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of webMoons) expect(m.boss.id, m.id).toBe(`${m.id}-chefe`);
    expect(ecoBoss.id).toBe('eco');
  });

  it('cada trilha libera uma peça diferente do portfólio', () => {
    const pieces = webEraTrails.map((t) => t.piece);
    expect(new Set(pieces).size).toBe(10);
  });

  it('as 15 insígnias-gema existem no catálogo compartilhado, e só elas são da era', () => {
    const ids = webEraGems.map((g) => g.badgeId);
    expect(new Set(ids).size).toBe(15);
    for (const g of webEraGems) {
      const b = badgeCatalog.find((x) => x.id === g.badgeId);
      expect(b, g.badgeId).toBeDefined();
      expect(b?.name, g.badgeId).toBe(g.name);
      expect(b?.trail, g.badgeId).toBe('web');
    }
    expect(badgeCatalog.filter((b) => b.trail === 'web').map((b) => b.id).sort()).toEqual([...ids].sort());
    expect(webEraGems.filter((g) => g.tier === 'rara')).toHaveLength(1);
    expect(webEraGems.filter((g) => g.tier === 'lendaria')).toHaveLength(1);
    expect(webEraGems.filter((g) => g.tier === 'lua')).toHaveLength(3);
  });

  it('o arquivo SVG de cada insígnia (public/badges/web) é o que o gerador desenha', () => {
    // Para redesenhar depois de mudar uma gema: UPDATE_WEB_BADGES=1 npx vitest run src/content/webEra.test.ts
    for (const g of webEraGems) {
      const file = badgeCatalog.find((b) => b.id === g.badgeId)!.file;
      const path = resolve(process.cwd(), 'public/badges', file);
      const svg = `${gemSvg(g, g.badgeId)}\n`;
      if (process.env.UPDATE_WEB_BADGES) {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, svg);
      }
      expect(existsSync(path), file).toBe(true);
      expect(readFileSync(path, 'utf8'), file).toBe(svg);
    }
  });

  it('Ramificações: React, Next.js (ramo do React), Vue, Angular e Node.js como porta do Back-end', () => {
    expect(webBranches.map((b) => b.id)).toEqual(['react', 'next', 'vue', 'angular', 'node']);
    expect(webBranches.find((b) => b.id === 'next')?.parent).toBe('react');
    expect(webBranches.filter((b) => b.future).map((b) => b.id)).toEqual(['node']);
  });

  it('mais ação, menos leitura: falas curtas da Sintaxe (no máximo 2 balões por entrada)', () => {
    const says = [...webEraTrails.map((t) => t.say), ecoBoss.say, ...webMoons.flatMap((m) => [m.boss.say, ...m.trails.map((t) => t.say)])];
    for (const say of says) {
      expect(say.length, say.join(' | ')).toBeLessThanOrEqual(2);
      for (const line of say) expect(line.length, line).toBeLessThanOrEqual(120);
    }
    for (const line of webEraCopy.intro) expect(line.length, line).toBeLessThanOrEqual(120);
  });

  it('missões de pegar: a meta cabe na variedade de itens certos', () => {
    for (const [id, m] of missions) if (m.type === 'catch') expect(m.need, id).toBeLessThanOrEqual(m.good.length * 3);
  });
});

/**
 * Cada missão de código tem uma resposta certa (`solution`): ela precisa passar na conferência,
 * e o código inicial sozinho não. O jsdom executa HTML e JS de verdade, mas não calcula o
 * CSS (cascata, grid, media query) como um navegador; as missões de CSS foram conferidas no
 * Chromium (ver docs/eras/web/README.md) e aqui só se confere que a resposta existe.
 */
describe('Era da Web: missões de código', () => {
  const run = (m: CodeMission, src: string) => {
    const dom = new JSDOM(buildCodePreview(m, src), { runScripts: 'dangerously' });
    const win = dom.window as unknown as Window & { __err?: string | null };
    try {
      return m.check({ win, doc: win.document, src });
    } finally {
      dom.window.close();
    }
  };

  it.each(codeMissions.filter(([, m]) => m.lang !== 'css'))('%s: a resposta passa e o código inicial não', (_id, m) => {
    expect(run(m, m.solution)).toBe(true);
    expect(run(m, m.start ?? '')).not.toBe(true);
  });

  it('toda missão de CSS tem resposta e começa diferente dela', () => {
    for (const [id, m] of codeMissions.filter(([, x]) => x.lang === 'css')) {
      expect(m.solution.trim(), id).not.toBe((m.start ?? '').trim());
    }
  });

  it('o que o viajante escreve vai para o portfólio (nome, bio, título, links)', () => {
    const captured = codeMissions.filter(([, m]) => m.capture && m.lang === 'html').map(([, m]) => {
      const dom = new JSDOM(buildCodePreview(m, m.solution));
      const win = dom.window as unknown as Window;
      return m.capture!({ win, doc: win.document, src: m.solution });
    });
    const merged = Object.assign({}, ...captured);
    expect(merged).toMatchObject({ title: 'Portfólio de Ana', name: 'Ana Souza', bio: 'Estudo programação e crio sites.' });
    expect(merged.links).toEqual([{ href: 'https://github.com/seuusuario', t: 'GitHub' }]);
  });
});
