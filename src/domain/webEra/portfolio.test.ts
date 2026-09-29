import { describe, expect, it } from 'vitest';
import { buildPortfolio, portfolioHost } from './portfolio';
import type { PortfolioPiece } from './types';

const build = (pieces: PortfolioPiece[], portfolio = {}) =>
  buildPortfolio({ pieces: new Set(pieces), portfolio, travelerName: 'Viajante', year: 2026 });

describe('portfólio do viajante', () => {
  it('começa vazio e ganha peças a cada trilha', () => {
    expect(build([]).html).toContain('(seu site ainda está vazio)');
    expect(build([]).html).toContain('<title>Documento sem título</title>');
    const hero = build(['files', 'title', 'hero'], { name: 'Ana', bio: 'Dev', title: 'Ana · Dev' });
    expect(hero.html).toContain('<h1>Ana</h1>');
    expect(hero.html).toContain('<title>Ana · Dev</title>');
    expect(hero.css).toBe('');
    expect(hero.js).toBe('');
  });

  it('com todas as peças: seções, CSS com a cor escolhida, saudação e modo escuro', () => {
    const all = build(['files', 'title', 'hero', 'links', 'sections', 'color', 'cards', 'flex', 'greet', 'dark'], {
      name: 'Ana',
      color: 'rgb(255, 99, 71)',
      links: [{ href: 'https://github.com/ana', t: 'GitHub' }],
    });
    expect(all.html).toContain('<header>');
    expect(all.html).toContain('<link rel="stylesheet" href="style.css">');
    expect(all.html).toContain('<script src="script.js"></script>');
    expect(all.css).toContain('--destaque: rgb(255, 99, 71)');
    expect(all.css).toContain('display: flex');
    expect(all.js).toContain('classList.toggle("escuro")');
    expect(all.srcdoc).toContain('<style>:root');
    expect(all.srcdoc).not.toContain('href="style.css"');
    expect(all.html).toContain('© 2026 Ana');
  });

  it('escapa o texto do viajante e recusa cor estranha', () => {
    const p = build(['hero', 'color'], { name: '<script>x</script>', color: 'red;}body{display:none' });
    expect(p.html).not.toContain('<script>x');
    expect(p.html).toContain('&lt;script&gt;');
    expect(p.css).toContain('--destaque: #ff6ad5');
  });

  it('endereço de brincadeira sem acento nem espaço', () => {
    expect(portfolioHost('Ána Souza')).toBe('anasouza.github.io');
    expect(portfolioHost('')).toBe('voce.github.io');
  });
});
