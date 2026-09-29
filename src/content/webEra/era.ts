import type { GemSpec, WebBoss, WebEraTrail } from '@/domain/webEra';

/**
 * Era da Web: as 10 trilhas, o chefe Eco e as insígnias especiais. Porte fiel do protótipo
 * aprovado (`docs/eras/web/Era_da_Web.html`, fonte da verdade de textos e regras). Os links
 * de documentação são da MDN e do W3C.
 */

export const TAGS_HTML = ['<p>', '<h1>', '<h2>', '<body>', '<head>', '<title>', '<a>', '<img>', '<ul>', '<li>', '<main>', '<nav>', '<footer>', '<section>', '<button>'];
export const TAGS_FAKE = ['<pp>', '<titel>', '<bold>', '<hed>', '<imagem>', '<paragrafo>', '<botao>', '<lnk>', '<bodi>', '<h7>'];

export const BASE_CARDS = `<div class="grade">
  <div class="projeto">Projeto 1</div>
  <div class="projeto">Projeto 2</div>
  <div class="outro">Rascunho</div>
</div>`;

/** Cada trilha: missões curtas (ação) + 1 peça do portfólio. */
export const webEraTrails: WebEraTrail[] = [
  {
    id: 'w1',
    title: 'A Faísca da Web',
    year: '1989–1997',
    color: '#c3a6ff',
    gem: { badgeId: 'web-faisca', name: 'Faísca da Web', icon: 'globe', sides: 8, c1: '#d9c6ff', c2: '#5b2bd6', tier: 'comum' },
    piece: 'files',
    pieceName: 'pasta do projeto',
    say: [
      'CERN, 1989. Tim Berners-Lee queria que cientistas ligassem documentos por links.',
      'O Eco, a sua variante, está apagando essa linha do tempo. Bora consertar!',
    ],
    doc: { label: 'W3C · história do CSS', url: 'https://www.w3.org/Style/CSS20/history.html' },
    rounds: [
      {
        type: 'order',
        title: 'Coloque a história em ordem',
        sub: 'Do mais antigo pro mais novo.',
        block: true,
        tokens: [
          '1989 · Tim propõe a Web no CERN',
          '1991 · “HTML Tags”: 18 tags',
          '1994 · Håkon Lie propõe o CSS',
          '1995 · JavaScript nasce na Netscape',
          '1996 · CSS1 vira recomendação do W3C',
          '1997 · JS padronizado como ECMAScript',
        ],
      },
      {
        type: 'sort',
        title: 'Quem faz o quê?',
        sub: 'Toque rápido no dono de cada peça.',
        time: 30,
        maxErr: 3,
        buckets: [
          { id: 'h', label: 'HTML', s: 'estrutura', tone: 'html' },
          { id: 'c', label: 'CSS', s: 'aparência', tone: 'css' },
          { id: 'j', label: 'JS', s: 'comportamento', tone: 'js' },
        ],
        items: [
          ['título da página', 'h'],
          ['cor de fundo', 'c'],
          ['menu que abre ao clicar', 'j'],
          ['parágrafo de texto', 'h'],
          ['fonte maior', 'c'],
          ['contador de cliques', 'j'],
          ['link para outra página', 'h'],
          ['sombra no botão', 'c'],
          ['validar e-mail antes de enviar', 'j'],
          ['imagem', 'h'],
        ],
      },
      {
        type: 'catch',
        title: 'Pegue os arquivos da Web',
        sub: 'Só os que um site usa.',
        time: 25,
        need: 8,
        maxErr: 3,
        good: ['index.html', 'style.css', 'script.js', '.html', '.css', '.js', 'sobre.html', 'app.js'],
        bad: ['.exe', '.docx', '.mp3', '.psd', '.zip', '.pdf', '.xlsx'],
      },
    ],
  },
  {
    id: 'w2',
    title: 'Esqueleto HTML',
    year: '1991',
    color: '#ff7a3d',
    gem: { badgeId: 'web-esqueleto', name: 'Esqueleto de Tags', icon: 'skeleton', sides: 6, c1: '#ffb38a', c2: '#c2410c', tier: 'comum' },
    piece: 'title',
    pieceName: 'título da aba',
    say: ['Todo site nasce de um esqueleto. Sem ele, o navegador fica perdido.', 'Monta rápido, viajante!'],
    doc: {
      label: 'MDN · estrutura de um documento',
      url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax',
    },
    rounds: [
      {
        type: 'order',
        title: 'Monte o esqueleto',
        sub: 'Toque na ordem de cima pra baixo.',
        block: true,
        preview: true,
        tokens: ['<!DOCTYPE html>', '<html lang="pt-BR">', '<head>', '<title>Meu Portfólio</title>', '</head>', '<body>', '<h1>Olá!</h1>', '</body>', '</html>'],
        extra: ['<bodi>', '</title>'],
      },
      { type: 'catch', title: 'Chuva de tags', sub: 'Pegue só tags que existem.', time: 25, need: 9, maxErr: 3, good: TAGS_HTML, bad: TAGS_FAKE },
      {
        type: 'code',
        lang: 'html',
        title: 'Dê nome à aba',
        sub: 'Escreva um <title> com o seu nome.',
        start: '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  \n</head>\n<body></body>\n</html>',
        hint: 'Dentro do <head>: <title>Portfólio de Ana</title>',
        solution: '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <title>Portfólio de Ana</title>\n</head>\n<body></body>\n</html>',
        check: ({ doc }) => doc.title.trim().length > 2 || 'O navegador ainda não achou um <title> com texto.',
        capture: ({ doc }) => ({ title: doc.title.trim() }),
      },
    ],
  },
  {
    id: 'w3',
    title: 'Títulos e Textos',
    year: '1991',
    color: '#ff7a3d',
    gem: { badgeId: 'web-voz-h1', name: 'Voz do H1', icon: 'h1', sides: 8, c1: '#ffc38a', c2: '#d9480f', tier: 'comum' },
    piece: 'hero',
    pieceName: 'seu nome + bio',
    say: ['Agora o portfólio precisa falar quem você é.', 'Tudo que você escrever aqui vai pro SEU site.'],
    doc: {
      label: 'MDN · títulos e parágrafos',
      url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Structuring_content/Headings_and_paragraphs',
    },
    rounds: [
      {
        type: 'code',
        lang: 'html',
        title: 'Seu nome em destaque',
        sub: 'Crie um <h1> com seu nome.',
        start: '',
        hint: '<h1>Seu Nome</h1>',
        solution: '<h1>Ana Souza</h1>',
        check: ({ doc }) => {
          const h = doc.querySelector('h1');
          return (h !== null && (h.textContent ?? '').trim().length > 1) || 'Falta um <h1> com texto dentro.';
        },
        capture: ({ doc }) => ({ name: doc.querySelector('h1')?.textContent?.trim() }),
      },
      {
        type: 'bug',
        title: 'Caça aos bugs',
        sub: 'Toque nas 3 linhas quebradas.',
        time: 30,
        lines: ['<h1>Ana Souza</h2>', '<p>Dev em formação.</p>', '<p>Eu crio <strong>sites<strong></p>', '<h2>Projetos</h2>', '<p>Moro em Ipatinga<p>'],
        bad: [0, 2, 4],
      },
      {
        type: 'code',
        lang: 'html',
        title: 'Escreva sua bio',
        sub: 'Um <p> contando o que você faz.',
        start: '<h1>Eu</h1>\n',
        hint: '<p>Estudo programação e crio sites.</p>',
        solution: '<h1>Eu</h1>\n<p>Estudo programação e crio sites.</p>',
        check: ({ doc }) => {
          const p = doc.querySelector('p');
          return (p !== null && (p.textContent ?? '').trim().length >= 12) || 'Crie um <p> com pelo menos uma frase.';
        },
        capture: ({ doc }) => ({ bio: doc.querySelector('p')?.textContent?.trim() }),
      },
    ],
  },
  {
    id: 'w4',
    title: 'Links e Imagens',
    year: '1991–93',
    color: '#ff7a3d',
    gem: { badgeId: 'web-elo-hipertexto', name: 'Elo do Hipertexto', icon: 'link', sides: 10, c1: '#ffd08a', c2: '#b45309', tier: 'comum' },
    piece: 'links',
    pieceName: 'seus links',
    say: ['O “H” de HTML é de Hiper: texto que pula pra outro texto.', 'Links são o coração da Web.'],
    doc: {
      label: 'MDN · criando links',
      url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Structuring_content/Creating_links',
    },
    rounds: [
      {
        type: 'order',
        title: 'Monte o link',
        sub: 'Um link pro GitHub.',
        preview: true,
        tokens: ['<a', 'href="https://github.com"', 'target="_blank">', 'Meu GitHub', '</a>'],
        extra: ['src="github"'],
      },
      {
        type: 'bug',
        title: 'Links quebrados',
        sub: 'Toque nos 3 erros.',
        time: 30,
        lines: [
          '<a href="https://linkedin.com">LinkedIn</a>',
          '<img src="eu.png">',
          '<a src="https://github.com">GitHub</a>',
          '<img src="logo.png" alt="Logo">',
          '<a href=https://site.com>Site</a>',
        ],
        bad: [1, 2, 4],
        why: ['', 'img sem alt: leitor de tela não sabe o que é', 'link usa href, não src', '', 'aspas no valor do atributo'],
      },
      {
        type: 'code',
        lang: 'html',
        title: 'Seu link de verdade',
        sub: 'Crie um <a> com href começando em https://',
        start: '',
        hint: '<a href="https://github.com/seuusuario">GitHub</a>',
        solution: '<a href="https://github.com/seuusuario">GitHub</a>',
        check: ({ doc }) => {
          const a = doc.querySelector('a[href^="http"]');
          return a !== null && (a.textContent ?? '').trim() ? true : 'Falta um <a href="https://..."> com texto.';
        },
        capture: ({ doc }) => ({
          links: [...doc.querySelectorAll('a[href^="http"]')].slice(0, 4).map((a) => ({
            href: a.getAttribute('href') ?? '',
            t: (a.textContent ?? '').trim(),
          })),
        }),
      },
    ],
  },
  {
    id: 'w5',
    title: 'Semântica',
    year: '2014 · HTML5',
    color: '#ff7a3d',
    gem: { badgeId: 'web-arquiteto-semantico', name: 'Arquiteto Semântico', icon: 'layout', sides: 6, c1: '#ffa06b', c2: '#9a3412', tier: 'comum' },
    piece: 'sections',
    pieceName: 'seções do site',
    say: ['Tags com significado ajudam o Google e quem usa leitor de tela.', 'Divida o site em partes com nome.'],
    doc: {
      label: 'MDN · estrutura do site',
      url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Structuring_content/Structuring_documents',
    },
    rounds: [
      {
        type: 'order',
        title: 'Planta do site',
        sub: 'De cima pra baixo.',
        block: true,
        tokens: ['<header> logo e nome', '<nav> menu', '<main> conteúdo principal', '<footer> rodapé'],
      },
      {
        type: 'sort',
        title: 'Onde isso mora?',
        sub: 'Toque onde cada parte mora.',
        time: 30,
        maxErr: 3,
        buckets: [
          { id: 'h', label: '<header>', tone: 'html' },
          { id: 'n', label: '<nav>', tone: 'violet' },
          { id: 'm', label: '<main>', tone: 'css' },
          { id: 'f', label: '<footer>', tone: 'js' },
        ],
        items: [
          ['nome e logo', 'h'],
          ['links: Sobre · Projetos · Contato', 'n'],
          ['lista de projetos', 'm'],
          ['© 2026 Ana', 'f'],
          ['texto “sobre mim”', 'm'],
          ['menu hambúrguer', 'n'],
        ],
      },
      {
        type: 'catch',
        title: 'Só tags semânticas',
        sub: '<div> e <span> não contam!',
        time: 25,
        need: 8,
        maxErr: 3,
        good: ['<header>', '<nav>', '<main>', '<section>', '<article>', '<footer>', '<aside>', '<figure>'],
        bad: ['<div>', '<span>', '<b>', '<font>', '<center>', '<i>'],
      },
    ],
  },
  {
    id: 'w6',
    title: 'Seletores e Cores',
    year: '1994 · CSS',
    color: '#3db8ff',
    gem: { badgeId: 'web-pincel-neon', name: 'Pincel Neon', icon: 'brush', sides: 8, c1: '#8ad8ff', c2: '#1d4ed8', tier: 'comum' },
    piece: 'color',
    pieceName: 'cor do seu site',
    say: ['10 de outubro de 1994: Håkon Lie propõe o CSS. A Web era só texto cru.', 'Separe o conteúdo da aparência!'],
    doc: {
      label: 'MDN · seletores CSS',
      url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Styling_basics/Basic_selectors',
    },
    rounds: [
      {
        type: 'code',
        lang: 'css',
        title: 'Pinte seu nome',
        sub: 'Dê uma cor ao h1. Essa vira a cor do seu site!',
        html: '<h1>Seu Nome</h1><p>Portfólio</p>',
        start: 'h1 {\n  color: ;\n}',
        hint: 'h1 { color: #ff6ad5; }  (ou tomato, deepskyblue...)',
        solution: 'h1 {\n  color: tomato;\n}',
        check: ({ win, doc }) => {
          // Compara com a cor herdada do body (no protótipo, comparar com preto deixava passar sem cor nenhuma).
          const h = doc.querySelector('h1');
          return (h !== null && win.getComputedStyle(h).color !== win.getComputedStyle(doc.body).color) || 'O h1 ainda está preto. Tente color: tomato;';
        },
        capture: ({ win, doc }) => {
          const h = doc.querySelector('h1');
          return h ? { color: win.getComputedStyle(h).color } : {};
        },
      },
      {
        type: 'catch',
        title: 'Seletores válidos',
        sub: 'Pegue só CSS que funciona.',
        time: 25,
        need: 8,
        maxErr: 3,
        good: ['h1', '.card', '#topo', 'nav a', 'p:hover', '*', '.btn.ativo', 'ul > li'],
        bad: ['..card', '#', '<p>', 'h1{', 'cor:azul', '.', '@@'],
      },
      {
        type: 'code',
        lang: 'css',
        title: 'Mira no alvo',
        sub: 'Só os .projeto ganham borda. O “Rascunho” não!',
        html: BASE_CARDS,
        start: '\n',
        hint: '.projeto { border: 2px solid deeppink; }',
        solution: '.projeto { border: 2px solid deeppink; }',
        check: ({ win, doc }) => {
          const projetos = [...doc.querySelectorAll('.projeto')].every((e) => parseFloat(win.getComputedStyle(e).borderTopWidth) > 0);
          const outro = doc.querySelector('.outro');
          const limpo = outro !== null && parseFloat(win.getComputedStyle(outro).borderTopWidth) === 0;
          return (projetos && limpo) || (!projetos ? 'Os .projeto ainda estão sem borda.' : 'O Rascunho também pegou borda. Use o seletor de classe .projeto');
        },
      },
    ],
  },
  {
    id: 'w7',
    title: 'Box Model',
    year: '1996 · CSS1',
    color: '#3db8ff',
    gem: { badgeId: 'web-caixa-perfeita', name: 'Caixa Perfeita', icon: 'box', sides: 4, c1: '#9be3ff', c2: '#0e7490', tier: 'comum' },
    piece: 'cards',
    pieceName: 'cards de projeto',
    say: ['Para o CSS, tudo é uma caixa: conteúdo, padding, borda e margem.', 'Ajuste até ficar igual ao alvo.'],
    doc: { label: 'MDN · box model', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Styling_basics/Box_model' },
    rounds: [
      {
        type: 'sort',
        title: 'Camadas da caixa',
        sub: 'Toque na camada certa.',
        time: 28,
        maxErr: 3,
        buckets: [
          { id: 'c', label: 'content', tone: 'js' },
          { id: 'p', label: 'padding', tone: 'neon' },
          { id: 'b', label: 'border', tone: 'html' },
          { id: 'm', label: 'margin', tone: 'css' },
        ],
        items: [
          ['o texto do card', 'c'],
          ['espaço DENTRO da borda', 'p'],
          ['a linha em volta', 'b'],
          ['espaço FORA da borda', 'm'],
          ['respiro entre dois cards', 'm'],
          ['distância do texto até a borda', 'p'],
        ],
      },
      {
        type: 'tune',
        title: 'Copie o card',
        sub: 'Deixe igual ao alvo.',
        mode: 'box',
        ctrls: [
          { p: 'padding', o: ['0px', '8px', '16px', '28px'] },
          { p: 'border-width', o: ['0px', '2px', '6px'] },
          { p: 'border-radius', o: ['0px', '8px', '20px'] },
        ],
        target: { padding: '28px', 'border-width': '2px', 'border-radius': '20px' },
      },
      {
        type: 'code',
        lang: 'css',
        title: 'Card de projeto',
        sub: 'Dê padding: 20px e cantos arredondados ao .card',
        html: '<div class="card">Meu projeto</div>',
        start: '.card {\n  border: 2px solid #3db8ff;\n  \n}',
        hint: 'padding: 20px;  border-radius: 12px;',
        solution: '.card {\n  border: 2px solid #3db8ff;\n  padding: 20px;\n  border-radius: 12px;\n}',
        check: ({ win, doc }) => {
          const card = doc.querySelector('.card');
          if (!card) return 'Cadê o .card?';
          const s = win.getComputedStyle(card);
          return (s.paddingTop === '20px' && parseFloat(s.borderTopLeftRadius) > 0) || 'Precisa de padding: 20px e border-radius maior que 0.';
        },
      },
    ],
  },
  {
    id: 'w8',
    title: 'Flexbox',
    year: '2009+',
    color: '#3db8ff',
    gem: { badgeId: 'web-mestre-flex', name: 'Mestre do Flex', icon: 'flex', sides: 8, c1: '#7cc7ff', c2: '#4338ca', tier: 'comum' },
    piece: 'flex',
    pieceName: 'projetos lado a lado',
    say: ['Flexbox alinha caixas numa linha ou coluna, sem gambiarra.', 'Mova as peças até o alvo!'],
    doc: { label: 'MDN · flexbox', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/CSS_layout/Flexbox' },
    rounds: [
      {
        type: 'tune',
        title: 'Arena Flex 1',
        sub: 'Leve os blocos até as marcas.',
        mode: 'flex',
        ctrls: [{ p: 'justify-content', o: ['flex-start', 'center', 'flex-end', 'space-between'] }],
        target: { 'justify-content': 'flex-end' },
      },
      {
        type: 'tune',
        title: 'Arena Flex 2',
        sub: 'Agora em dois eixos.',
        mode: 'flex',
        ctrls: [
          { p: 'justify-content', o: ['flex-start', 'center', 'space-between', 'space-around'] },
          { p: 'align-items', o: ['flex-start', 'center', 'flex-end'] },
        ],
        target: { 'justify-content': 'space-around', 'align-items': 'center' },
      },
      {
        type: 'tune',
        title: 'Arena Flex 3',
        sub: 'Virou coluna!',
        mode: 'flex',
        ctrls: [
          { p: 'flex-direction', o: ['row', 'column'] },
          { p: 'justify-content', o: ['flex-start', 'center', 'flex-end'] },
          { p: 'align-items', o: ['flex-start', 'center', 'flex-end'] },
        ],
        target: { 'flex-direction': 'column', 'justify-content': 'center', 'align-items': 'flex-end' },
      },
      {
        type: 'code',
        lang: 'css',
        title: 'Projetos lado a lado',
        sub: 'Faça a .grade virar flex, com gap.',
        html: BASE_CARDS,
        start: '.grade {\n  \n}\n.projeto, .outro { padding: 16px; background: #e0f2fe; }',
        hint: '.grade { display: flex; gap: 12px; }',
        solution: '.grade {\n  display: flex;\n  gap: 12px;\n}\n.projeto, .outro { padding: 16px; background: #e0f2fe; }',
        check: ({ win, doc }) => {
          const grade = doc.querySelector('.grade');
          if (!grade) return 'Cadê a .grade?';
          const s = win.getComputedStyle(grade);
          return (s.display === 'flex' && parseFloat(s.columnGap || s.gap) > 0) || 'Use display: flex e gap na .grade';
        },
      },
    ],
  },
  {
    id: 'w9',
    title: 'Variáveis e Eventos',
    year: '1995 · JS',
    color: '#ffe14d',
    gem: { badgeId: 'web-raio-eich', name: 'Raio de Eich', icon: 'bolt', sides: 6, c1: '#fff08a', c2: '#ca8a04', tier: 'comum' },
    piece: 'greet',
    pieceName: 'saudação viva',
    say: [
      'Maio de 1995: Brendan Eich cria o JavaScript na Netscape, em cerca de 10 dias.',
      'Nome antes: Mocha, depois LiveScript. Agora dá vida a página!',
    ],
    doc: { label: 'MDN · eventos', url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Scripting/Events' },
    rounds: [
      {
        type: 'sort',
        title: 'Qual o tipo?',
        sub: 'Toque rápido!',
        time: 25,
        maxErr: 3,
        buckets: [
          { id: 's', label: 'string', s: 'texto', tone: 'neon' },
          { id: 'n', label: 'number', s: 'número', tone: 'css' },
          { id: 'b', label: 'boolean', s: 'sim/não', tone: 'pink' },
        ],
        items: [
          ['"Ana"', 's'],
          ['42', 'n'],
          ['true', 'b'],
          ['"42"', 's'],
          ['3.14', 'n'],
          ['false', 'b'],
          ["'oi'", 's'],
          ['-7', 'n'],
        ],
      },
      {
        type: 'order',
        title: 'Pegue o botão',
        sub: 'Monte a linha de JS.',
        tokens: ['const', 'botao', '=', 'document.querySelector("button")', ';'],
        extra: ['var=', 'querySelector'],
      },
      {
        type: 'code',
        lang: 'js',
        title: 'Contador de cliques',
        sub: 'Cada clique soma +1 no número.',
        html: '<button>Curtir</button> <span id="n">0</span>',
        start:
          'const botao = document.querySelector("button");\nconst n = document.querySelector("#n");\nlet cliques = 0;\n\nbotao.addEventListener("click", () => {\n  // some 1 e mostre no span\n  \n});',
        hint: 'cliques++;  n.textContent = cliques;',
        solution:
          'const botao = document.querySelector("button");\nconst n = document.querySelector("#n");\nlet cliques = 0;\n\nbotao.addEventListener("click", () => {\n  cliques++;\n  n.textContent = cliques;\n});',
        check: ({ win, doc }) => {
          if (win.__err) return 'Erro: ' + win.__err;
          const b = doc.querySelector('button');
          b?.click();
          b?.click();
          return (doc.querySelector('#n')?.textContent ?? '').trim() === '2' || 'Cliquei 2 vezes, mas o número não virou 2.';
        },
      },
    ],
  },
  {
    id: 'w10',
    title: 'DOM Vivo',
    year: '1998 · DOM',
    color: '#ffe14d',
    gem: { badgeId: 'web-raiz-dom', name: 'Raiz do DOM', icon: 'tree', sides: 10, c1: '#ffe98a', c2: '#a16207', tier: 'comum' },
    piece: 'dark',
    pieceName: 'modo escuro',
    say: ['O DOM é a árvore da página. O JS mexe nela ao vivo.', 'Último passo antes do chefe!'],
    doc: {
      label: 'MDN · manipulando o DOM',
      url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Scripting/DOM_scripting',
    },
    rounds: [
      {
        type: 'bug',
        title: 'Bugs no script',
        sub: 'Toque nas 3 linhas erradas.',
        time: 30,
        mono: true,
        lines: [
          'const titulo = document.querySelector("#titulo");',
          'titulo.textContent = "Oi!";',
          'document.querySelecter("p");',
          'botao.addEventListener("clik", abrir);',
          'const x = 5;',
          'x = 6;',
        ],
        bad: [2, 3, 5],
        why: ['', '', 'querySelector com “o”', 'o evento é "click"', '', 'const não pode ser reatribuída'],
      },
      {
        type: 'code',
        lang: 'js',
        title: 'Troque o título',
        sub: 'Mude o texto do #titulo pelo seu nome.',
        html: '<h1 id="titulo">Carregando...</h1>',
        start: 'const titulo = document.querySelector("#titulo");\n',
        hint: 'titulo.textContent = "Ana Souza";',
        solution: 'const titulo = document.querySelector("#titulo");\ntitulo.textContent = "Ana Souza";',
        check: ({ win, doc }) => {
          if (win.__err) return 'Erro: ' + win.__err;
          const t = (doc.querySelector('#titulo')?.textContent ?? '').trim();
          return (t !== '' && t !== 'Carregando...') || 'O título ainda diz Carregando...';
        },
      },
      {
        type: 'code',
        lang: 'js',
        title: 'Modo escuro',
        sub: 'Ao clicar em #tema, alterne a classe "escuro" no body.',
        html: '<style>.escuro{background:#111;color:#eee}</style><button id="tema">Tema</button><p>Meu portfólio</p>',
        start: 'const tema = document.querySelector("#tema");\n\ntema.addEventListener("click", () => {\n  \n});',
        hint: 'document.body.classList.toggle("escuro");',
        solution: 'const tema = document.querySelector("#tema");\n\ntema.addEventListener("click", () => {\n  document.body.classList.toggle("escuro");\n});',
        check: ({ win, doc }) => {
          if (win.__err) return 'Erro: ' + win.__err;
          const b = doc.querySelector<HTMLElement>('#tema');
          b?.click();
          const on = doc.body.classList.contains('escuro');
          b?.click();
          const off = !doc.body.classList.contains('escuro');
          return (on && off) || 'Clique deve ligar E desligar a classe "escuro" (toggle).';
        },
      },
    ],
  },
];

/** O chefe da era: o Eco, a variante do próprio viajante. */
export const ecoBoss: WebBoss = {
  id: 'eco',
  name: 'Eco',
  face: 'E C O',
  say: [
    'Ele chegou. O Eco tem a sua cara, mas espalha erro 404 por onde passa. Ele apagou seu portfólio!',
    'Cada golpe certo devolve um pedaço. Sem perder coração = insígnia lendária.',
  ],
  rounds: [
    { type: 'catch', title: 'Fragmentos do Eco', sub: 'Pegue só tags reais. Rápido!', time: 18, need: 9, maxErr: 2, good: TAGS_HTML, bad: [...TAGS_FAKE, '404', '<null>'] },
    {
      type: 'order',
      title: 'Reerga o esqueleto',
      sub: 'Sem errar!',
      block: true,
      time: 40,
      tokens: ['<!DOCTYPE html>', '<html>', '<head>', '<link rel="stylesheet" href="style.css">', '</head>', '<body>', '<script src="script.js"></script>', '</body>', '</html>'],
    },
    {
      type: 'bug',
      title: 'Código corrompido',
      sub: '4 bugs, 3 linguagens.',
      time: 30,
      lines: [
        '<img src="eu.jpg">',
        'h1 { color: tomato }',
        '.card { padding 12px; }',
        '<a href="#contato">Contato</a>',
        'botao.addEventListener("click", abrir);',
        'document.querySelectorAll(".card").forEach(c => c.remove();',
        '<p>Olá<p>',
      ],
      bad: [0, 2, 5, 6],
    },
    {
      type: 'tune',
      title: 'Realinhe os projetos',
      sub: 'Encaixe no alvo.',
      mode: 'flex',
      time: 30,
      ctrls: [
        { p: 'flex-direction', o: ['row', 'column'] },
        { p: 'justify-content', o: ['flex-start', 'center', 'space-between'] },
        { p: 'align-items', o: ['flex-start', 'center', 'flex-end'] },
      ],
      target: { 'flex-direction': 'row', 'justify-content': 'space-between', 'align-items': 'flex-end' },
    },
    {
      type: 'sort',
      title: 'Separe o caos',
      sub: 'HTML, CSS ou JS?',
      time: 22,
      maxErr: 2,
      buckets: [
        { id: 'h', label: 'HTML', tone: 'html' },
        { id: 'c', label: 'CSS', tone: 'css' },
        { id: 'j', label: 'JS', tone: 'js' },
      ],
      items: [
        ['<section>', 'h'],
        ['display: flex', 'c'],
        ['addEventListener', 'j'],
        ['<nav>', 'h'],
        ['border-radius', 'c'],
        ['const', 'j'],
        ['alt="foto"', 'h'],
        [':hover', 'c'],
        ['classList.toggle', 'j'],
      ],
    },
    {
      type: 'code',
      lang: 'js',
      title: 'Golpe final',
      sub: 'Faça o #tema alternar a classe "escuro" no body.',
      html: '<style>.escuro{background:#111;color:#eee}</style><button id="tema">Tema</button><p>O Eco não passará</p>',
      start: '',
      hint: 'document.querySelector("#tema").addEventListener("click", () => document.body.classList.toggle("escuro"));',
      solution: 'document.querySelector("#tema").addEventListener("click", () => document.body.classList.toggle("escuro"));',
      check: ({ win, doc }) => {
        if (win.__err) return 'Erro: ' + win.__err;
        const b = doc.querySelector<HTMLElement>('#tema');
        b?.click();
        const on = doc.body.classList.contains('escuro');
        b?.click();
        return (on && !doc.body.classList.contains('escuro')) || 'Ainda não alterna.';
      },
    },
  ],
};

/** Insígnias especiais do Eco: rara (venceu) e lendária (venceu sem perder coração). */
export const webSpecialGems: { rara: GemSpec; lendaria: GemSpec } = {
  rara: { badgeId: 'web-guardiao-portfolio', name: 'Guardião do Portfólio', icon: 'portfolio', sides: 8, c1: '#ffb0f2', c2: '#6d28d9', tier: 'rara' },
  lendaria: { badgeId: 'web-tecelao-www', name: 'Tecelão da World Wide Web', icon: 'www', sides: 12, c1: '#fff3b0', c2: '#b45309', tier: 'lendaria' },
};
