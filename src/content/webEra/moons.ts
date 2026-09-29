import type { WebMoon } from '@/domain/webEra';
import { BASE_CARDS } from './era';

/** Uma função ou objeto que o código do viajante deixou na janela da prévia. */
const globalOf = (win: Window, name: string): unknown => (win as unknown as Record<string, unknown>)[name];

/**
 * As 3 luas que nascem da vitória sobre o Eco (protótipo: `MOONS`). Cada uma tem 5 trilhas,
 * um chefe e uma insígnia exclusiva. Elas orbitam o portal da Era da Web no mapa principal.
 */
export const webMoons: WebMoon[] = [
  {
    id: 'mh',
    name: 'Lua HTML',
    short: 'HTML',
    color: '#ff7a3d',
    description: 'Formulários, tabelas, mídia, acessibilidade e SEO, e o chefe O Silenciador, que apaga o significado das tags.',
    boss: {
      id: 'mh-chefe',
      name: 'O Silenciador',
      face: '< />',
      say: ['O Silenciador apaga o significado das tags. Leitores de tela ficam mudos.'],
      rounds: [
        {
          type: 'bug',
          title: 'Significado roubado',
          sub: 'Ache as 3 falhas.',
          time: 22,
          lines: ['<div class="menu">', '<nav>', '<img src="eu.png">', '<h1>Ana</h1>', '<input type="mail">'],
          bad: [0, 2, 4],
        },
        {
          type: 'code',
          lang: 'html',
          title: 'Devolva a voz',
          sub: 'Um <form> com <label for> ligado a um <input type="email" id>.',
          start: '<form>\n\n</form>',
          hint: '<label for="e">E-mail</label><input type="email" id="e">',
          solution: '<form>\n<label for="e">E-mail</label><input type="email" id="e">\n</form>',
          check: ({ doc }) => {
            const l = doc.querySelector('form label[for]');
            const i = (l ? doc.getElementById(l.getAttribute('for') ?? '') : null) as HTMLInputElement | null;
            return i?.type === 'email' || 'Ligue o label ao input type="email".';
          },
        },
        {
          type: 'catch',
          title: 'Última onda',
          sub: 'Só semânticas!',
          time: 18,
          need: 8,
          maxErr: 2,
          good: ['<header>', '<nav>', '<main>', '<article>', '<footer>', '<label>', '<figure>', '<table>'],
          bad: ['<div>', '<span>', '<font>', '<center>', '<b>'],
        },
      ],
    },
    gem: { badgeId: 'web-coroa-marcacao', name: 'Coroa da Marcação', icon: 'crown', sides: 8, c1: '#ffb38a', c2: '#9a3412', tier: 'lua' },
    trails: [
      {
        id: 'mh1',
        title: 'Formulários',
        icon: 'form',
        say: ['Formulário é como o site escuta o visitante.'],
        doc: { label: 'MDN · Formulários', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Extensions/Forms/Your_first_form' },
        rounds: [
          {
            type: 'catch',
            title: 'Tipos de <input>',
            sub: 'Pegue os type que existem.',
            time: 22,
            need: 7,
            maxErr: 3,
            good: ['email', 'password', 'number', 'date', 'checkbox', 'radio', 'color', 'range'],
            bad: ['mail', 'senha', 'numero', 'texto', 'clique'],
          },
          {
            type: 'code',
            lang: 'html',
            title: 'Form de contato',
            sub: 'Um <form> com <input type="email"> e um <button>.',
            start: '<form>\n  \n</form>',
            hint: '<input type="email" placeholder="seu@email.com">\n<button>Enviar</button>',
            solution: '<form>\n  <input type="email" placeholder="seu@email.com">\n  <button>Enviar</button>\n</form>',
            check: ({ doc }) =>
              doc.querySelector('form input[type=email]') && doc.querySelector('form button') ? true : 'Falta o input de e-mail ou o botão dentro do form.',
          },
        ],
      },
      {
        id: 'mh2',
        title: 'Tabelas',
        icon: 'table',
        say: ['Tabela é para dados em linhas e colunas. Não para layout!'],
        doc: { label: 'MDN · Tabelas', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Structuring_content/HTML_table_basics' },
        rounds: [
          {
            type: 'order',
            title: 'Monte a tabela',
            sub: 'Uma linha com cabeçalho.',
            preview: true,
            block: true,
            tokens: ['<table>', '<tr>', '<th>Projeto</th>', '<th>Ano</th>', '</tr>', '<tr>', '<td>Portfólio</td>', '<td>2026</td>', '</tr>', '</table>'],
          },
          {
            type: 'sort',
            title: 'Peças da tabela',
            sub: 'Toque rápido.',
            time: 22,
            maxErr: 2,
            buckets: [
              { id: 'tr', label: '<tr>', tone: 'html' },
              { id: 'th', label: '<th>', tone: 'js' },
              { id: 'td', label: '<td>', tone: 'css' },
            ],
            items: [
              ['uma linha inteira', 'tr'],
              ['título da coluna', 'th'],
              ['um dado comum', 'td'],
              ['“Nome”, no topo', 'th'],
              ['o valor “2026”', 'td'],
              ['agrupa células lado a lado', 'tr'],
            ],
          },
        ],
      },
      {
        id: 'mh3',
        title: 'Listas e Mídia',
        icon: 'play',
        say: ['Listas organizam, vídeo e áudio dão vida.'],
        doc: { label: 'MDN · Listas e Mídia', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Structuring_content/HTML_video_and_audio' },
        rounds: [
          {
            type: 'code',
            lang: 'html',
            title: 'Lista de skills',
            sub: 'Um <ul> com 3 <li>.',
            start: '<ul>\n  \n</ul>',
            hint: '<li>HTML</li><li>CSS</li><li>JS</li>',
            solution: '<ul>\n  <li>HTML</li><li>CSS</li><li>JS</li>\n</ul>',
            check: ({ doc }) => doc.querySelectorAll('ul > li').length >= 3 || 'Preciso ver 3 <li> dentro do <ul>.',
          },
          {
            type: 'bug',
            title: 'Mídia quebrada',
            sub: 'Toque nos 2 erros.',
            time: 25,
            lines: ['<video src="demo.mp4" controls></video>', '<audio scr="tema.mp3" controls></audio>', '<ol><li>Primeiro</li></ol>', '<ul><p>Item</p></ul>'],
            bad: [1, 3],
            why: ['', 'é src, não scr', '', 'dentro de <ul> vai <li>'],
          },
        ],
      },
      {
        id: 'mh4',
        title: 'Acessibilidade',
        icon: 'a11y',
        say: ['Site bom é site que todo mundo consegue usar.'],
        doc: { label: 'MDN · Acessibilidade', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Accessibility/HTML' },
        rounds: [
          {
            type: 'bug',
            title: 'Barreiras',
            sub: 'Toque nas 3 barreiras.',
            time: 28,
            lines: ['<img src="foto.jpg">', '<button>Enviar</button>', '<button></button>', '<label for="email">E-mail</label>', '<div onclick="abrir()">Menu</div>'],
            bad: [0, 2, 4],
            why: ['falta alt', '', 'botão sem texto', '', 'use <button>, não div clicável'],
          },
          {
            type: 'code',
            lang: 'html',
            title: 'Rótulo ligado',
            sub: 'Um <label for="nome"> e um <input id="nome">.',
            start: '',
            hint: '<label for="nome">Nome</label>\n<input id="nome">',
            solution: '<label for="nome">Nome</label>\n<input id="nome">',
            check: ({ doc }) => {
              const l = doc.querySelector('label[for]');
              return l && doc.getElementById(l.getAttribute('for') ?? '') ? true : 'O for do label precisa bater com o id do input.';
            },
          },
        ],
      },
      {
        id: 'mh5',
        title: 'Meta e SEO',
        icon: 'meta',
        say: ['As metas no <head> dizem ao Google e ao celular quem é seu site.'],
        doc: { label: 'MDN · Meta e SEO', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata' },
        rounds: [
          {
            type: 'order',
            title: 'Head turbinado',
            sub: 'Na ordem.',
            block: true,
            tokens: ['<head>', '<meta charset="utf-8">', '<meta name="viewport" content="width=device-width">', '<meta name="description" content="Portfólio de Ana">', '<title>Ana · Dev</title>', '</head>'],
          },
          {
            type: 'catch',
            title: 'Metas reais',
            sub: 'Pegue os name de meta válidos.',
            time: 20,
            need: 6,
            maxErr: 3,
            good: ['description', 'viewport', 'author', 'keywords', 'theme-color', 'robots'],
            bad: ['descricao', 'tela', 'dono', 'cor', 'google'],
          },
        ],
      },
    ],
  },
  {
    id: 'mc',
    name: 'Lua CSS',
    short: 'CSS',
    color: '#3db8ff',
    description: 'Grid, responsivo, variáveis, animações e posicionamento, e o chefe Glitch Cromático, que bagunça cores e layouts.',
    boss: {
      id: 'mc-chefe',
      name: 'Glitch Cromático',
      face: '#!?',
      say: ['O Glitch Cromático bagunçou cores e layouts de todos os sites.'],
      rounds: [
        {
          type: 'tune',
          title: 'Recalibrar grid',
          sub: 'Rápido!',
          mode: 'grid',
          time: 25,
          ctrls: [
            { p: 'grid-template-columns', o: ['1fr', '1fr 1fr', '1fr 1fr 1fr', '2fr 1fr'] },
            { p: 'gap', o: ['0px', '6px', '16px'] },
          ],
          target: { 'grid-template-columns': '1fr 1fr 1fr', gap: '6px' },
        },
        {
          type: 'bug',
          title: 'CSS corrompido',
          sub: '3 bugs.',
          time: 22,
          lines: ['h1 { color: var(--cor) }', '.card { paddin: 10px; }', '@media (max-width: 600px) { }', '.btn { transition: .3s }', 'p { color: red', '.a { position: absolut; }'],
          bad: [1, 4, 5],
        },
        {
          type: 'code',
          lang: 'css',
          title: 'Golpe cromático',
          sub: 'Use uma variável --c no :root e aplique como background do body.',
          html: '<p>Cor restaurada</p>',
          start: '',
          hint: ':root{--c:#0ea5e9} body{background:var(--c)}',
          solution: ':root { --c: #0ea5e9; }\nbody { background: var(--c); }',
          check: ({ win, doc, src }) =>
            (/var\(--c\)/.test(src) && win.getComputedStyle(doc.body).backgroundColor !== 'rgba(0, 0, 0, 0)') || 'Crie --c e use em background do body.',
        },
      ],
    },
    gem: { badgeId: 'web-prisma-cascata', name: 'Prisma Cascata', icon: 'prism', sides: 8, c1: '#9be3ff', c2: '#1e3a8a', tier: 'lua' },
    trails: [
      {
        id: 'mc1',
        title: 'Grid',
        icon: 'grid',
        say: ['Grid é layout em linhas E colunas ao mesmo tempo.'],
        doc: { label: 'MDN · Grid', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/CSS_layout/Grids' },
        rounds: [
          {
            type: 'tune',
            title: 'Arena Grid',
            sub: 'Igual ao alvo.',
            mode: 'grid',
            ctrls: [
              { p: 'grid-template-columns', o: ['1fr', '1fr 1fr', '1fr 1fr 1fr', '2fr 1fr'] },
              { p: 'gap', o: ['0px', '6px', '16px'] },
            ],
            target: { 'grid-template-columns': '2fr 1fr', gap: '16px' },
          },
          {
            type: 'code',
            lang: 'css',
            title: 'Galeria',
            sub: '.grade em grid com 3 colunas iguais.',
            html: BASE_CARDS,
            start: '.grade {\n  \n}',
            hint: 'display: grid; grid-template-columns: repeat(3, 1fr);',
            solution: '.grade {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}',
            check: ({ win, doc }) => {
              const grade = doc.querySelector('.grade');
              if (!grade) return 'Cadê a .grade?';
              const s = win.getComputedStyle(grade);
              return (s.display === 'grid' && s.gridTemplateColumns.split(' ').length === 3) || 'Use display: grid e 3 colunas.';
            },
          },
        ],
      },
      {
        id: 'mc2',
        title: 'Responsivo',
        icon: 'phone',
        say: ['A maioria abre seu site no celular. Media query adapta.'],
        doc: { label: 'MDN · Responsivo', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/CSS_layout/Media_queries' },
        rounds: [
          {
            type: 'order',
            title: 'Monte a media query',
            sub: 'Celular empilha os cards.',
            tokens: ['@media', '(max-width: 600px)', '{', ' .grade { flex-direction: column; }', '}'],
          },
          {
            type: 'code',
            lang: 'css',
            title: 'Tela de celular',
            sub: 'A prévia tem 360px. Faça a .grade virar coluna só em telas até 600px.',
            narrow: true,
            html: BASE_CARDS,
            start: '.grade { display: flex; gap: 8px; }\n\n',
            hint: '@media (max-width: 600px) { .grade { flex-direction: column; } }',
            solution: '.grade { display: flex; gap: 8px; }\n\n@media (max-width: 600px) { .grade { flex-direction: column; } }',
            check: ({ win, doc, src }) => {
              const grade = doc.querySelector('.grade');
              if (!grade) return 'Cadê a .grade?';
              return (win.getComputedStyle(grade).flexDirection === 'column' && /@media/.test(src)) || 'Use @media (max-width: 600px) com flex-direction: column.';
            },
          },
        ],
      },
      {
        id: 'mc3',
        title: 'Variáveis CSS',
        icon: 'vars',
        say: ['Defina a cor uma vez, use em todo lugar.'],
        doc: { label: 'MDN · Variáveis CSS', url: 'https://developer.mozilla.org/pt-BR/docs/Web/CSS/Using_CSS_custom_properties' },
        rounds: [
          {
            type: 'catch',
            title: 'Uso correto',
            sub: 'Pegue só sintaxe válida.',
            time: 20,
            need: 6,
            maxErr: 3,
            good: ['--cor: #f0f', 'var(--cor)', '--espaco: 8px', 'var(--espaco)', ':root', '--fonte: serif'],
            bad: ['$cor', 'var(cor)', '-cor: red', '@cor', 'var[--cor]'],
          },
          {
            type: 'code',
            lang: 'css',
            title: 'Tema com variável',
            sub: 'Crie --destaque no :root e use no h1.',
            html: '<h1>Ana</h1>',
            start: ':root {\n  \n}\nh1 {\n  \n}',
            hint: ':root { --destaque: hotpink; }  h1 { color: var(--destaque); }',
            solution: ':root {\n  --destaque: hotpink;\n}\nh1 {\n  color: var(--destaque);\n}',
            check: ({ win, doc, src }) => {
              const h = doc.querySelector('h1');
              return (/var\(--/.test(src) && h !== null && win.getComputedStyle(h).color !== win.getComputedStyle(doc.body).color) || 'Use var(--destaque) no h1.';
            },
          },
        ],
      },
      {
        id: 'mc4',
        title: 'Animações',
        icon: 'wave',
        say: ['Transição suaviza, animação dá vida.'],
        doc: { label: 'MDN · Animações', url: 'https://developer.mozilla.org/pt-BR/docs/Web/CSS/CSS_animations/Using_CSS_animations' },
        rounds: [
          {
            type: 'order',
            title: 'Keyframes',
            sub: 'Monte a animação.',
            block: true,
            tokens: ['@keyframes pulo {', '  from { transform: translateY(0); }', '  to { transform: translateY(-10px); }', '}'],
          },
          {
            type: 'code',
            lang: 'css',
            title: 'Botão suave',
            sub: 'Dê transition ao .btn.',
            html: '<button class="btn">Contrate-me</button>',
            start: '.btn {\n  \n}\n.btn:hover { transform: scale(1.1); }',
            hint: 'transition: transform .3s;',
            solution: '.btn {\n  transition: transform .3s;\n}\n.btn:hover { transform: scale(1.1); }',
            check: ({ win, doc }) => {
              const btn = doc.querySelector('.btn');
              return (btn !== null && parseFloat(win.getComputedStyle(btn).transitionDuration) > 0) || 'Falta a transition no .btn.';
            },
          },
        ],
      },
      {
        id: 'mc5',
        title: 'Posicionamento',
        icon: 'pin',
        say: ['position tira a caixa do fluxo normal.'],
        doc: { label: 'MDN · Posicionamento', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/CSS_layout/Positioning' },
        rounds: [
          {
            type: 'tune',
            title: 'Selo no canto',
            sub: 'Leve o selo ao alvo.',
            mode: 'pos',
            ctrls: [
              { p: 'position', o: ['static', 'absolute'] },
              { p: 'top', o: ['0px', '40px', 'auto'] },
              { p: 'right', o: ['0px', '40px', 'auto'] },
            ],
            target: { position: 'absolute', top: '0px', right: '0px' },
          },
          {
            type: 'sort',
            title: 'Qual position?',
            sub: 'Toque rápido.',
            time: 22,
            maxErr: 2,
            buckets: [
              { id: 'r', label: 'relative', tone: 'css' },
              { id: 'a', label: 'absolute', tone: 'html' },
              { id: 'f', label: 'fixed', tone: 'js' },
              { id: 's', label: 'sticky', tone: 'neon' },
            ],
            items: [
              ['menu que fica preso ao rolar a seção', 's'],
              ['botão “voltar ao topo” sempre na tela', 'f'],
              ['selo no canto do card', 'a'],
              ['referência pro filho absolute', 'r'],
              ['chat flutuante', 'f'],
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mj',
    name: 'Lua JS',
    short: 'JS',
    color: '#ffe14d',
    description: 'Arrays, funções, JSON, fetch e localStorage, e o chefe Loop Infinito, que prende o navegador girando para sempre.',
    boss: {
      id: 'mj-chefe',
      name: 'Loop Infinito',
      face: '∞',
      say: ['O Loop Infinito prende o navegador girando para sempre. Só lógica limpa quebra o ciclo.'],
      rounds: [
        {
          type: 'bug',
          title: 'Ciclo infinito',
          sub: '3 bugs.',
          time: 22,
          lines: ['for (let i = 0; i < 3; i--) {}', 'const lista = [1, 2, 3];', 'while (true) {}', 'lista.forEach(n => console.log(n));', 'const x = JSON.parse("{nome:1}");'],
          bad: [0, 2, 4],
        },
        {
          type: 'order',
          title: 'Quebre o loop',
          sub: 'Monte certo.',
          tokens: ['for', '(let i = 0;', 'i < lista.length;', 'i++)', '{ total += lista[i] }'],
        },
        {
          type: 'code',
          lang: 'js',
          title: 'Golpe final',
          sub: 'Crie function total(arr) que soma os números do array.',
          html: '',
          start: 'function total(arr) {\n  \n}',
          hint: 'return arr.reduce((a, b) => a + b, 0);',
          solution: 'function total(arr) {\n  return arr.reduce((a, b) => a + b, 0);\n}',
          check: ({ win }) => {
            if (win.__err) return 'Erro: ' + win.__err;
            const total = globalOf(win, 'total');
            return (typeof total === 'function' && total([1, 2, 3]) === 6 && total([]) === 0) || 'total([1,2,3]) precisa dar 6 e total([]) dar 0.';
          },
        },
      ],
    },
    gem: { badgeId: 'web-motor-eventos', name: 'Motor de Eventos', icon: 'infinity', sides: 10, c1: '#fff08a', c2: '#854d0e', tier: 'lua' },
    trails: [
      {
        id: 'mj1',
        title: 'Arrays e Loops',
        icon: 'loop',
        say: ['Array guarda uma lista; loop passa por cada item.'],
        doc: { label: 'MDN · Arrays e Loops', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Scripting/Loops' },
        rounds: [
          { type: 'order', title: 'Monte o for', sub: 'Conte de 0 a 2.', tokens: ['for', '(let i = 0;', 'i < 3;', 'i++)', '{ console.log(i) }'] },
          {
            type: 'code',
            lang: 'js',
            title: 'Lista de projetos',
            sub: 'Para cada item do array, crie um <li> no #lista.',
            html: '<ul id="lista"></ul>',
            start: 'const projetos = ["Portfólio", "Calculadora", "To-do"];\nconst lista = document.querySelector("#lista");\n\nprojetos.forEach(p => {\n  \n});',
            hint: 'lista.innerHTML += `<li>${p}</li>`;',
            solution:
              'const projetos = ["Portfólio", "Calculadora", "To-do"];\nconst lista = document.querySelector("#lista");\n\nprojetos.forEach(p => {\n  lista.innerHTML += `<li>${p}</li>`;\n});',
            check: ({ win, doc }) => (win.__err ? 'Erro: ' + win.__err : doc.querySelectorAll('#lista li').length === 3 || 'Preciso de 3 <li> no #lista.'),
          },
        ],
      },
      {
        id: 'mj2',
        title: 'Funções',
        icon: 'fn',
        say: ['Função é uma receita: entra algo, sai algo.'],
        doc: { label: 'MDN · Funções', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Scripting/Functions' },
        rounds: [
          {
            type: 'code',
            lang: 'js',
            title: 'Função dobro',
            sub: 'Crie function dobro(n) que retorna n * 2.',
            html: '',
            start: 'function dobro(n) {\n  \n}',
            hint: 'return n * 2;',
            solution: 'function dobro(n) {\n  return n * 2;\n}',
            check: ({ win }) => {
              if (win.__err) return 'Erro: ' + win.__err;
              const dobro = globalOf(win, 'dobro');
              return (typeof dobro === 'function' && dobro(4) === 8 && dobro(-1) === -2) || 'dobro(4) precisa dar 8.';
            },
          },
          {
            type: 'bug',
            title: 'Funções quebradas',
            sub: 'Toque nos 2 erros.',
            time: 22,
            lines: ['const soma = (a, b) => a + b;', 'function oi() { return "oi" }', 'const x = soma(2 3);', 'funtion tchau() {}'],
            bad: [2, 3],
          },
        ],
      },
      {
        id: 'mj3',
        title: 'Objetos e JSON',
        icon: 'obj',
        say: ['Objeto junta dados com nome. JSON é como eles viajam.'],
        doc: { label: 'MDN · Objetos e JSON', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Scripting/JSON' },
        rounds: [
          {
            type: 'catch',
            title: 'JSON válido',
            sub: 'Pegue só JSON certo.',
            time: 22,
            need: 6,
            maxErr: 3,
            good: ['{"nome":"Ana"}', '[1,2,3]', '{"ok":true}', '"texto"', '{"idade":20}', 'null'],
            bad: ["{nome:'Ana'}", "{'a':1}", '[1,2,]', '{ok:true}', 'undefined'],
          },
          {
            type: 'code',
            lang: 'js',
            title: 'Seu perfil',
            sub: 'Crie const perfil com nome (string) e skills (array).',
            html: '',
            start: 'const perfil = {\n  \n};\nwindow.perfil = perfil;',
            hint: 'nome: "Ana", skills: ["HTML","CSS","JS"]',
            solution: 'const perfil = {\n  nome: "Ana", skills: ["HTML", "CSS", "JS"]\n};\nwindow.perfil = perfil;',
            check: ({ win }) => {
              if (win.__err) return 'Erro: ' + win.__err;
              const perfil = globalOf(win, 'perfil') as { nome?: unknown; skills?: unknown } | undefined;
              return (Boolean(perfil) && typeof perfil?.nome === 'string' && Array.isArray(perfil?.skills)) || 'perfil precisa de nome e skills.';
            },
          },
        ],
      },
      {
        id: 'mj4',
        title: 'Fetch e Async',
        icon: 'cloud',
        say: ['fetch busca dados de outro lugar. await espera chegar.'],
        doc: { label: 'MDN · Fetch e Async', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Scripting/Network_requests' },
        rounds: [
          {
            type: 'order',
            title: 'Monte a busca',
            sub: 'Na ordem.',
            block: true,
            tokens: ['async function carregar() {', '  const r = await fetch("/api/projetos");', '  const dados = await r.json();', '  console.log(dados);', '}'],
          },
          {
            type: 'bug',
            title: 'Promessas quebradas',
            sub: 'Toque nos 2 erros.',
            time: 22,
            lines: ['const r = fetch(url);', 'const r = await fetch(url);', 'const d = r.json;', 'const d = await r.json();'],
            bad: [0, 2],
            why: ['faltou await', '', 'json é função: r.json()', ''],
          },
        ],
      },
      {
        id: 'mj5',
        title: 'Memória Local',
        icon: 'disk',
        say: ['localStorage guarda dados no navegador, mesmo fechando a aba.'],
        doc: { label: 'MDN · localStorage', url: 'https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage' },
        rounds: [
          { type: 'order', title: 'Salvar o tema', sub: 'Monte a linha.', tokens: ['localStorage', '.setItem(', '"tema",', '"escuro"', ')'] },
          {
            type: 'sort',
            title: 'Salvar ou ler?',
            sub: 'Toque rápido.',
            time: 20,
            maxErr: 2,
            buckets: [
              { id: 's', label: 'setItem', s: 'salvar', tone: 'js' },
              { id: 'g', label: 'getItem', s: 'ler', tone: 'css' },
              { id: 'r', label: 'removeItem', s: 'apagar', tone: 'bad' },
            ],
            items: [
              ['guardar o nome do jogador', 's'],
              ['saber o tema ao abrir', 'g'],
              ['sair da conta', 'r'],
              ['lembrar a pontuação', 's'],
              ['mostrar recorde salvo', 'g'],
            ],
          },
        ],
      },
    ],
  },
];
