import type { GemIcon, GemSpec } from '@/domain/webEra';

/**
 * Ícones das insígnias-gema (Era da Web), desenhados em branco numa caixa 100×100.
 * SVG próprio do projeto (porte do protótipo `docs/eras/web/Era_da_Web.html`), nunca
 * logotipos oficiais.
 */
export const GEM_ICONS: Record<GemIcon, string> = {
  globe: '<circle cx="50" cy="50" r="17" fill="none" stroke="#fff" stroke-width="4"/><ellipse cx="50" cy="50" rx="7" ry="17" fill="none" stroke="#fff" stroke-width="3.5"/><path d="M33 50h34M36 41h28M36 59h28" stroke="#fff" stroke-width="3"/>',
  skeleton: '<path d="M38 36l-12 14 12 14M62 36l12 14-12 14M55 31l-10 38" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
  h1: '<text x="50" y="61" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="30" fill="#fff">H1</text>',
  link: '<rect x="27" y="41" width="26" height="18" rx="9" fill="none" stroke="#fff" stroke-width="5" transform="rotate(-35 40 50)"/><rect x="47" y="41" width="26" height="18" rx="9" fill="none" stroke="#fff" stroke-width="5" transform="rotate(-35 60 50)"/>',
  layout: '<rect x="30" y="30" width="40" height="40" rx="4" fill="none" stroke="#fff" stroke-width="4"/><path d="M30 40h40M30 62h40M44 40v22" stroke="#fff" stroke-width="3.5"/>',
  brush: '<path d="M60 28l12 12-20 20-12-12z" fill="#fff"/><path d="M38 50c-8 0-10 6-10 10 0 5-3 8-3 8s14 2 19-5c3-4 2-8 1-9z" fill="#fff" opacity=".85"/>',
  box: '<rect x="26" y="26" width="48" height="48" rx="3" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="5 4"/><rect x="34" y="34" width="32" height="32" rx="3" fill="none" stroke="#fff" stroke-width="4"/><rect x="42" y="42" width="16" height="16" rx="2" fill="#fff"/>',
  flex: '<rect x="26" y="40" width="12" height="20" rx="2" fill="#fff"/><rect x="44" y="40" width="12" height="20" rx="2" fill="#fff"/><rect x="62" y="40" width="12" height="20" rx="2" fill="#fff"/><path d="M26 32h48M26 68h48" stroke="#fff" stroke-width="3" stroke-dasharray="4 4"/>',
  bolt: '<path d="M54 24L32 54h15l-4 22 23-31H51z" fill="#fff"/>',
  tree: '<circle cx="50" cy="30" r="6" fill="#fff"/><circle cx="34" cy="56" r="6" fill="#fff"/><circle cx="66" cy="56" r="6" fill="#fff"/><circle cx="26" cy="74" r="4.5" fill="#fff"/><circle cx="42" cy="74" r="4.5" fill="#fff"/><path d="M50 36v6M50 42L34 50M50 42l16 8M34 62l-8 8M34 62l8 8" stroke="#fff" stroke-width="3" fill="none"/>',
  portfolio: '<rect x="26" y="34" width="48" height="36" rx="5" fill="none" stroke="#fff" stroke-width="4"/><path d="M42 34v-5h16v5" fill="none" stroke="#fff" stroke-width="4"/><path d="M36 52l6-6M36 52l6 6M64 52l-6-6M64 52l-6 6" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>',
  www: '<text x="50" y="58" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="20" fill="#fff">www</text>',
  form: '<rect x="28" y="30" width="44" height="10" rx="3" fill="none" stroke="#fff" stroke-width="3.5"/><rect x="28" y="46" width="44" height="10" rx="3" fill="none" stroke="#fff" stroke-width="3.5"/><rect x="44" y="62" width="28" height="10" rx="3" fill="#fff"/>',
  table: '<rect x="27" y="30" width="46" height="40" rx="3" fill="none" stroke="#fff" stroke-width="4"/><path d="M27 43h46M27 56h46M42 30v40M57 30v40" stroke="#fff" stroke-width="3"/>',
  play: '<circle cx="50" cy="50" r="22" fill="none" stroke="#fff" stroke-width="4"/><path d="M45 39l14 11-14 11z" fill="#fff"/>',
  a11y: '<circle cx="50" cy="30" r="5" fill="#fff"/><path d="M32 40h36M50 40v16l-8 16M50 56l8 16" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round"/>',
  meta: '<circle cx="46" cy="46" r="13" fill="none" stroke="#fff" stroke-width="4.5"/><path d="M56 56l14 14" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
  grid: '<rect x="28" y="28" width="19" height="19" rx="3" fill="#fff"/><rect x="53" y="28" width="19" height="19" rx="3" fill="#fff" opacity=".7"/><rect x="28" y="53" width="19" height="19" rx="3" fill="#fff" opacity=".7"/><rect x="53" y="53" width="19" height="19" rx="3" fill="#fff"/>',
  phone: '<rect x="38" y="24" width="24" height="44" rx="4" fill="none" stroke="#fff" stroke-width="4"/><rect x="58" y="44" width="16" height="30" rx="3" fill="#fff" opacity=".85"/><rect x="24" y="52" width="26" height="20" rx="3" fill="none" stroke="#fff" stroke-width="3"/>',
  vars: '<text x="50" y="59" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="22" fill="#fff">--x</text>',
  wave: '<path d="M24 58c8-16 14-16 20 0s12 16 20 0 10-10 12-6" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="72" cy="40" r="5" fill="#fff"/>',
  pin: '<path d="M50 24c-10 0-17 7-17 17 0 12 17 33 17 33s17-21 17-33c0-10-7-17-17-17z" fill="none" stroke="#fff" stroke-width="4.5"/><circle cx="50" cy="41" r="6" fill="#fff"/>',
  loop: '<path d="M34 42a16 16 0 0 1 30-6M66 58a16 16 0 0 1-30 6" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M66 26v12H54M34 74V62h12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
  fn: '<text x="50" y="60" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="30" fill="#fff">f()</text>',
  obj: '<text x="50" y="61" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="28" fill="#fff">{ }</text>',
  cloud: '<path d="M36 64h30a11 11 0 0 0 0-22 16 16 0 0 0-30-3 12 12 0 0 0 0 25z" fill="none" stroke="#fff" stroke-width="4.5"/><path d="M50 48v14M44 56l6 6 6-6" stroke="#fff" stroke-width="3.5" fill="none"/>',
  disk: '<ellipse cx="50" cy="34" rx="18" ry="6" fill="none" stroke="#fff" stroke-width="4"/><path d="M32 34v30c0 3 8 6 18 6s18-3 18-6V34M32 49c0 3 8 6 18 6s18-3 18-6" fill="none" stroke="#fff" stroke-width="4"/>',
  crown: '<path d="M28 64l-2-26 13 11 11-17 11 17 13-11-2 26z" fill="#fff"/><rect x="28" y="66" width="44" height="6" rx="2" fill="#fff"/>',
  prism: '<path d="M50 26l22 40H28z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round"/><path d="M50 50l24-6M50 50l24 2M50 50l24 10" stroke="#fff" stroke-width="3" opacity=".8"/>',
  infinity: '<path d="M50 50c-6-8-10-12-16-12a12 12 0 0 0 0 24c6 0 10-4 16-12s10-12 16-12a12 12 0 0 1 0 24c-6 0-10-4-16-12z" fill="none" stroke="#fff" stroke-width="5"/>',
};

type Pt = [number, number];

function gemPts(n: number, r: number, rot = -90, cx = 50, cy = 50): Pt[] {
  const p: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180;
    p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return p;
}

const ptsStr = (p: Pt[]) => p.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
const FACET_OPACITY = [0.28, 0.08, 0.18, 0.02, 0.22, 0.06, 0.14, 0.1, 0.2, 0.05, 0.16, 0.12];

/** Estrela de `n` pontas alternando raio externo e interno. */
function star(n: number, outer: number, inner: number): Pt[] {
  const o = gemPts(n, outer);
  const i = gemPts(n, inner);
  return o.map((p, k) => (k % 2 ? i[k]! : p));
}

const escAttr = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Animação da lendária (raios girando + brilho), desligada com `prefers-reduced-motion`. */
const LEGENDARY_STYLE =
  '<style>.lg-rays{transform-box:view-box;transform-origin:50% 50%;animation:lg-spin 16s linear infinite}' +
  '.lg-shine{animation:lg-shine 2.8s ease-in-out infinite}' +
  '@keyframes lg-spin{to{transform:rotate(360deg)}}' +
  '@keyframes lg-shine{from{transform:skewX(-20deg) translateX(0)}60%,to{transform:skewX(-20deg) translateX(220px)}}' +
  '@media (prefers-reduced-motion:reduce){.lg-rays,.lg-shine{animation:none}}</style>';

/**
 * Gera o SVG de uma insígnia-gema: gema lapidada com ícone, e as variações rara (estrela
 * roxa atrás), lendária (raios dourados girando + brilho passando) e lua (moldura crescente).
 * `uid` deixa os ids de gradiente únicos quando várias aparecem na mesma página.
 * Porte fiel de `badgeSVG` do protótipo.
 */
export function gemSvg(gem: GemSpec, uid: string): string {
  const id = `g${uid.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const n = gem.sides;
  const { c1, c2 } = gem;
  const outer = gemPts(n, 44, -90 + 180 / n);
  const inner = gemPts(n, 31, -90 + 180 / n);
  let facets = '';
  for (let i = 0; i < n; i++) {
    const quad = [outer[i]!, outer[(i + 1) % n]!, inner[(i + 1) % n]!, inner[i]!];
    facets += `<polygon points="${ptsStr(quad)}" fill="#fff" opacity="${FACET_OPACITY[i % 12]}"/>`;
  }
  let extra = '';
  let under = '';
  if (gem.tier === 'rara') {
    under = `<polygon points="${ptsStr(star(16, 49, 40))}" fill="url(#${id}r)" opacity=".95"/>`;
    extra = `<defs><linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9cf0"/><stop offset="1" stop-color="#7a2cff"/></linearGradient></defs>`;
  }
  if (gem.tier === 'lendaria') {
    under = `<g class="lg-rays"><polygon points="${ptsStr(star(24, 50, 41))}" fill="url(#${id}l)"/></g>`;
    extra =
      LEGENDARY_STYLE +
      `<defs><linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#ffcf40"/><stop offset="1" stop-color="#b86b00"/></linearGradient>` +
      `<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
  }
  if (gem.tier === 'lua') {
    under = `<path d="M50 2a48 48 0 1 0 38 78A40 40 0 1 1 50 2z" fill="${c1}" opacity=".9"/><circle cx="82" cy="18" r="4" fill="#fff"/><circle cx="90" cy="32" r="2.5" fill="#fff"/>`;
  }
  const shine =
    gem.tier === 'lendaria'
      ? `<rect class="lg-shine" x="-60" y="0" width="40" height="100" fill="url(#${id}s)" transform="skewX(-20)" clip-path="url(#${id}c)"/>`
      : '';
  return (
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escAttr(gem.name)}">` +
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` +
    `<radialGradient id="${id}i" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}" stop-opacity=".9"/></radialGradient>` +
    `<clipPath id="${id}c"><polygon points="${ptsStr(outer)}"/></clipPath></defs>${extra}` +
    under +
    `<polygon points="${ptsStr(outer)}" fill="url(#${id})" stroke="${c1}" stroke-width="1.5"/>` +
    facets +
    `<polygon points="${ptsStr(inner)}" fill="url(#${id}i)" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>` +
    `<polygon points="${ptsStr(inner)}" fill="#000" opacity=".28"/>` +
    `<g style="filter:drop-shadow(0 0 3px ${c1})">${GEM_ICONS[gem.icon] ?? ''}</g>` +
    shine +
    '</svg>'
  );
}
