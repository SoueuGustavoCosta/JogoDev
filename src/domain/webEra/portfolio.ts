import type { PortfolioPiece, WebPortfolio } from './types';

export type BuiltPortfolio = {
  /** index.html, como o viajante vai publicar (com `<link>` e `<script src>`). */
  html: string;
  /** style.css (vazio até a trilha de cores). */
  css: string;
  /** script.js (vazio até a trilha de eventos). */
  js: string;
  /** Tudo num arquivo só, para a prévia num iframe `srcdoc`. */
  srcdoc: string;
};

const PROJECTS = ['Portfólio pessoal', 'Calculadora', 'Lista de tarefas'];
const SCRIPT_CLOSE = '</' + 'script>';

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Cor segura para o CSS (o valor veio do navegador, mas nunca confie num texto salvo). */
function safeColor(c: string | undefined): string {
  return c && /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i.test(c.trim()) ? c.trim() : '#ff6ad5';
}

/**
 * Gera o portfólio do viajante a partir do que ele escreveu nas missões e das peças já
 * liberadas (uma por trilha concluída). Porte fiel de `buildPortfolio` do protótipo.
 */
export function buildPortfolio(params: {
  pieces: ReadonlySet<PortfolioPiece>;
  portfolio: WebPortfolio | undefined;
  travelerName: string;
  year: number;
}): BuiltPortfolio {
  const has = (p: PortfolioPiece) => params.pieces.has(p);
  const pf = params.portfolio ?? {};
  const name = esc(pf.name || params.travelerName || 'Seu Nome');
  const bio = esc(pf.bio || 'Estudante de programação.');
  const color = safeColor(pf.color);
  const links = pf.links?.length ? pf.links : [{ href: 'https://github.com', t: 'GitHub' }];
  const linksHtml = links.map((l) => `<a href="${esc(l.href)}" target="_blank">${esc(l.t)}</a>`).join('\n        ');

  let body: string;
  if (!has('hero')) body = '  <p>(seu site ainda está vazio)</p>';
  else if (!has('sections')) body = `  <h1>${name}</h1>\n  <p>${bio}</p>\n  ${has('links') ? linksHtml : ''}`;
  else
    body = `  <header>
    <h1>${name}</h1>
    <nav>
        ${linksHtml}
    </nav>${has('dark') ? '\n    <button id="tema">Modo escuro</button>' : ''}
  </header>
  <main>
    <section id="sobre">
      <h2>${has('greet') ? '<span id="saudacao">Olá</span>! ' : ''}Sobre mim</h2>
      <p>${bio}</p>
    </section>
    <section id="projetos">
      <h2>Projetos</h2>
      <div class="grade">
${PROJECTS.map((p) => `        <article class="card">${p}</article>`).join('\n')}
      </div>
    </section>
  </main>
  <footer>© ${params.year} ${name}</footer>`;

  const title = has('title') ? pf.title || `Portfólio de ${pf.name || params.travelerName}` : 'Documento sem título';
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  ${has('color') ? '<link rel="stylesheet" href="style.css">' : ''}
</head>
<body>
${body}
  ${has('greet') ? `<script src="script.js">${SCRIPT_CLOSE}` : ''}
</body>
</html>`;

  let css = '';
  if (has('color')) {
    css += `:root { --destaque: ${color}; }\nbody { font-family: system-ui, sans-serif; margin: 0; padding: 24px; line-height: 1.6; }\nh1 { color: var(--destaque); margin: 0; }\nnav a { color: var(--destaque); margin-right: 12px; }\n`;
    if (has('cards')) css += '.card { padding: 20px; border: 2px solid var(--destaque); border-radius: 14px; margin-bottom: 12px; }\n';
    if (has('flex'))
      css +=
        '.grade { display: flex; gap: 12px; flex-wrap: wrap; }\n.card { flex: 1 1 160px; margin: 0; }\nheader { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }\n';
    if (has('dark'))
      css +=
        '.escuro { background: #0b0f1a; color: #e5e7eb; }\n#tema { border: 0; border-radius: 99px; padding: 8px 14px; background: var(--destaque); color: #fff; cursor: pointer; }\n';
  }

  let js = '';
  if (has('greet'))
    js +=
      'const hora = new Date().getHours();\nconst saudacao = document.querySelector("#saudacao");\nif (saudacao) saudacao.textContent = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";\n';
  if (has('dark'))
    js += '\nconst tema = document.querySelector("#tema");\ntema.addEventListener("click", () => {\n  document.body.classList.toggle("escuro");\n});\n';

  const srcdoc = html
    .replace('<link rel="stylesheet" href="style.css">', `<style>${css}</style>`)
    .replace(`<script src="script.js">${SCRIPT_CLOSE}`, `<script>${js}${SCRIPT_CLOSE}`);
  return { html, css, js, srcdoc };
}

/** Endereço de brincadeira na barra do navegador da prévia (ex.: `anasouza.github.io`). */
export function portfolioHost(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return `${slug || 'voce'}.github.io`;
}
