import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import {
  blocksSource,
  buildCodePreview,
  fillTemplate,
  webBossSchema,
  webBranchSchema,
  webEraTrailSchema,
  webMoonSchema,
  type BlocksMission,
  type FillMission,
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

describe('Era da Web: conteúdo', () => {
  it('valida contra os esquemas Zod', () => {
    for (const t of webEraTrails) expect(() => webEraTrailSchema.parse(t), t.id).not.toThrow();
    expect(() => webBossSchema.parse(ecoBoss)).not.toThrow();
    for (const m of webMoons) expect(() => webMoonSchema.parse(m), m.id).not.toThrow();
    for (const b of webBranches) expect(() => webBranchSchema.parse(b), b.id).not.toThrow();
  });

  it('tem 10 trilhas, o Eco com 7 missões e 3 luas (HTML, CSS, JS) com 5 trilhas + chefe', () => {
    expect(webEraTrails).toHaveLength(10);
    expect(ecoBoss.rounds).toHaveLength(7);
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

  it('mais ação, menos leitura: no máximo 2 falas por fase, com até 12 palavras cada', () => {
    const words = (line: string) => line.trim().split(/\s+/).length;
    const says = [
      ...webEraTrails.map((t) => t.say),
      ecoBoss.say,
      ...webMoons.flatMap((m) => [m.boss.say, ...m.trails.map((t) => t.say)]),
      webEraCopy.intro,
    ];
    for (const say of says) {
      expect(say.length, say.join(' | ')).toBeLessThanOrEqual(2);
      for (const line of say) expect(words(line), line).toBeLessThanOrEqual(12);
    }
  });

  it('nenhuma missão pede para digitar código: tudo é montado com blocos ou lacunas', () => {
    expect(missions.filter(([, m]) => m.type === 'code').map(([id]) => id)).toEqual([]);
  });

  it('peças com {NAME} e {USER} viram o nome do viajante', () => {
    expect(fillTemplate('Portfólio de {NAME}', 'Ana Souza')).toBe('Portfólio de Ana Souza');
    expect(fillTemplate('github.com/{USER}', 'Ána Souza')).toBe('github.com/anasouza');
  });

  it('missões de pegar: a meta cabe na variedade de itens certos', () => {
    for (const [id, m] of missions) if (m.type === 'catch') expect(m.need, id).toBeLessThanOrEqual(m.good.length * 3);
  });
});

/**
 * O jsdom executa HTML e JS de verdade (mas não calcula CSS como um navegador): aqui se confere
 * que o código montado com as peças certas funciona e mostra o resultado na prévia.
 */
describe('Era da Web: código montado', () => {
  const find = (title: string) => missions.find(([, m]) => m.title === title)![1];
  const assemble = (m: WebMission, name = 'Ana Souza') => {
    const t = (x: string) => fillTemplate(x, name);
    if (m.type === 'blocks') return blocksSource({ ...m, pre: t(m.pre ?? ''), post: t(m.post ?? '') }, m.tokens.map(t));
    if (m.type === 'fill') return t(m.pre) + t(Array.isArray(m.answer) ? m.answer[0]! : m.answer) + t(m.post);
    throw new Error(`sem montagem para ${m.type}`);
  };
  const open = (m: BlocksMission | FillMission) => {
    const dom = new JSDOM(buildCodePreview(m, assemble(m)), { runScripts: 'dangerously' });
    return dom.window as unknown as Window & { __err?: string | null };
  };

  it('Troque o título: o #titulo vira o nome do viajante', () => {
    const win = open(find('Troque o título') as BlocksMission);
    expect(win.__err ?? null).toBeNull();
    expect(win.document.querySelector('#titulo')?.textContent).toBe('Ana Souza');
  });

  it('Modo escuro e o golpe final do Eco: o clique liga e desliga a classe "escuro"', () => {
    for (const m of [webEraTrails[9]!.rounds.find((r) => r.title === 'Modo escuro')!, ecoBoss.rounds.at(-1)!]) {
      const win = open(m as BlocksMission);
      const b = win.document.querySelector<HTMLElement>('#tema')!;
      b.click();
      expect(win.document.body.classList.contains('escuro'), m.title).toBe(true);
      b.click();
      expect(win.document.body.classList.contains('escuro'), m.title).toBe(false);
    }
  });

  it('Devolva a voz: o rótulo fica ligado ao campo de e-mail', () => {
    const win = open(webMoons[0]!.boss.rounds.find((r) => r.title === 'Devolva a voz') as BlocksMission);
    const label = win.document.querySelector('form label[for]')!;
    expect((win.document.getElementById(label.getAttribute('for')!) as HTMLInputElement).type).toBe('email');
  });

  it('Golpe final do Loop Infinito: total([1, 2, 3]) mostra 6 na prévia', () => {
    const win = open(webMoons[2]!.boss.rounds.at(-1) as FillMission);
    expect(win.__err ?? null).toBeNull();
    expect(win.document.querySelector('pre')?.textContent).toBe('> 6');
  });

  it('o que o viajante monta vai para o portfólio (nome, bio, título, links)', () => {
    const name = 'Ana Souza';
    const t = (x: string) => fillTemplate(x, name);
    const htmlWithCapture = missions
      .map(([, m]) => m)
      .filter((m): m is BlocksMission | FillMission => (m.type === 'blocks' || m.type === 'fill') && m.lang === 'html' && Boolean(m.capture));
    const captured = htmlWithCapture.map((m) => {
      const src =
        m.type === 'blocks'
          ? blocksSource({ ...m, pre: t(m.pre ?? ''), post: t(m.post ?? '') }, m.tokens.map(t))
          : t(m.pre) + t(Array.isArray(m.answer) ? m.answer[0]! : m.answer) + t(m.post);
      const dom = new JSDOM(buildCodePreview(m, src));
      const win = dom.window as unknown as Window;
      return m.capture!({ win, doc: win.document, src });
    });
    const merged = Object.assign({}, ...captured);
    expect(merged).toMatchObject({ title: 'Portfólio de Ana Souza', name: 'Ana Souza', bio: 'Estudo programação e crio sites.' });
    expect(merged.links).toEqual([{ href: 'https://github.com/anasouza', t: 'Meu GitHub' }]);
  });

  it('blocos: montando as peças na ordem, o código funciona (JS roda sem erro)', () => {
    for (const [id, m] of missions) {
      if (m.type !== 'blocks' || m.lang !== 'js') continue;
      const dom = new JSDOM(buildCodePreview(m, blocksSource(m, m.tokens)), { runScripts: 'dangerously' });
      expect((dom.window as unknown as { __err?: string | null }).__err ?? null, id).toBeNull();
      dom.window.close();
    }
  });

  it('lacunas de JS: a peça certa roda sem erro e mostra a saída na prévia', () => {
    for (const [id, m] of missions) {
      if (m.type !== 'fill' || m.lang !== 'js') continue;
      const answer = Array.isArray(m.answer) ? m.answer[0]! : m.answer;
      const dom = new JSDOM(buildCodePreview(m, m.pre + answer + m.post), { runScripts: 'dangerously' });
      expect((dom.window as unknown as { __err?: string | null }).__err ?? null, id).toBeNull();
      dom.window.close();
    }
  });
});
