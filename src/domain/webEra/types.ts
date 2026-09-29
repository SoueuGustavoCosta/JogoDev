/**
 * Era da Web (HTML, CSS e JavaScript). Diferente das outras eras, aqui não há lição + quiz:
 * cada trilha é uma sequência curta de missões de ação ("mais ação, menos leitura"), jogadas
 * por seis motores (ordenar, classificar, pegar, caçar bugs, código ao vivo e ajustar CSS).
 * Fonte da verdade do conteúdo e das regras: `docs/eras/web/Era_da_Web.html`.
 */

/** Cor de apoio de um balde ou peça, resolvida pela apresentação nos tokens da era. */
export type WebTone = 'html' | 'css' | 'js' | 'violet' | 'neon' | 'pink' | 'bad';

type MissionBase = {
  title: string;
  sub: string;
  /** Tempo da missão em segundos (barra de tempo). Sem tempo = sem pressa. */
  time?: number;
  /** Dica da Sintaxe, mostrada depois de um erro. */
  hint?: string;
};

/** Toque as peças na ordem certa. Acerto encaixa, erro treme; 3 erros = falha. */
export type OrderMission = MissionBase & {
  type: 'order';
  /** Peças na ordem certa. */
  tokens: string[];
  /** Peças que sobram (distratoras). */
  extra?: string[];
  /** Peças empilhadas, uma por linha (esqueleto, blocos). */
  block?: boolean;
  /** Mostra a prévia do HTML montado até agora. */
  preview?: boolean;
};

export type SortBucket = { id: string; label: string; s?: string; tone: WebTone };

/** Uma carta por vez: toque no balde certo. */
export type SortMission = MissionBase & {
  type: 'sort';
  maxErr?: number;
  buckets: SortBucket[];
  /** [texto da carta, id do balde certo]. */
  items: [string, string][];
};

/** Itens caindo: toque só nos certos até pegar `need`. */
export type CatchMission = MissionBase & {
  type: 'catch';
  need: number;
  maxErr?: number;
  good: string[];
  bad: string[];
};

/** Toque nas linhas com bug. */
export type BugMission = MissionBase & {
  type: 'bug';
  lines: string[];
  /** Linhas com bug (começa em 0). */
  bad: number[];
  /** Explicação de cada linha com bug, pela posição (vazio nas linhas certas). */
  why?: string[];
  maxErr?: number;
  mono?: boolean;
};

/**
 * O que a conferência de uma missão de código enxerga: a janela e o documento da prévia
 * (um iframe isolado, na apresentação) e o código digitado. Só tipos: o domínio nunca toca
 * o DOM, quem executa a conferência é a tela.
 */
export type CodeCheckContext = {
  win: Window & { __err?: string | null };
  doc: Document;
  src: string;
};

/** `true` = passou; texto = o que ainda falta (aparece embaixo da prévia). */
export type CodeCheck = (ctx: CodeCheckContext) => true | string;

/** Guarda no portfólio do viajante algo que ele escreveu na missão. */
export type CodeCapture = (ctx: CodeCheckContext) => Partial<WebPortfolio>;

export type WebLang = 'html' | 'css' | 'js';

/** Editor + prévia ao vivo; a conferência roda sozinha enquanto a pessoa digita. */
export type CodeMission = MissionBase & {
  type: 'code';
  lang: WebLang;
  /** HTML fixo da prévia (missões de CSS e JS). */
  html?: string;
  /** Código inicial do editor. */
  start?: string;
  /** Prévia estreita (360px), para media queries. */
  narrow?: boolean;
  /** Uma resposta certa, conferida nos testes de conteúdo (nunca mostrada ao viajante). */
  solution: string;
  check: CodeCheck;
  capture?: CodeCapture;
};

export type TuneMode = 'box' | 'flex' | 'grid' | 'pos';
export type TuneControl = { p: string; o: string[] };

/** Arena com alvo tracejado: ajuste as propriedades CSS até encaixar. */
export type TuneMission = MissionBase & {
  type: 'tune';
  mode: TuneMode;
  ctrls: TuneControl[];
  target: Record<string, string>;
};

export type WebMission = OrderMission | SortMission | CatchMission | BugMission | CodeMission | TuneMission;
export type WebMissionType = WebMission['type'];

/** Nível visual da insígnia-gema (ver `GemBadge`). */
export type GemTier = 'comum' | 'rara' | 'lendaria' | 'lua';

export type GemIcon =
  | 'globe' | 'skeleton' | 'h1' | 'link' | 'layout' | 'brush' | 'box' | 'flex' | 'bolt' | 'tree'
  | 'portfolio' | 'www' | 'form' | 'table' | 'play' | 'a11y' | 'meta' | 'grid' | 'phone' | 'vars'
  | 'wave' | 'pin' | 'loop' | 'fn' | 'obj' | 'cloud' | 'disk' | 'crown' | 'prism' | 'infinity';

/** Uma insígnia-gema: lapidada com `sides` faces, gradiente de `c1` a `c2` e um ícone. */
export type GemSpec = {
  /** Id no catálogo compartilhado de insígnias (`content/badges/catalog.ts`). */
  badgeId: string;
  name: string;
  icon: GemIcon;
  sides: number;
  c1: string;
  c2: string;
  tier: GemTier;
};

export type DocLink = { label: string; url: string };

/** Uma das 10 trilhas da era. Concluir libera uma peça do portfólio. */
export type WebEraTrail = {
  id: string;
  title: string;
  year: string;
  color: string;
  /** Falas da Sintaxe na entrada: no máximo 2 frases curtas por tela. */
  say: string[];
  doc: DocLink;
  gem: GemSpec;
  /** Peça do portfólio que esta trilha libera. */
  piece: PortfolioPiece;
  pieceName: string;
  rounds: WebMission[];
};

export type WebBoss = {
  id: string;
  name: string;
  /** Rosto glitch do chefe. */
  face: string;
  say: string[];
  rounds: WebMission[];
};

export type WebMoonTrail = {
  id: string;
  title: string;
  icon: GemIcon;
  say: string[];
  doc: DocLink;
  rounds: WebMission[];
};

/** Lua que nasce depois do Eco (HTML, CSS, JS): 5 trilhas + chefe e 1 insígnia exclusiva. */
export type WebMoon = {
  id: string;
  name: string;
  short: string;
  color: string;
  boss: WebBoss;
  gem: GemSpec;
  /** Uma frase sobre a lua (cartão no mapa). */
  description: string;
  trails: WebMoonTrail[];
};

/** Ramificação aberta pelo Evento Nexus da Era da Web (frameworks). */
export type WebBranch = {
  id: string;
  name: string;
  color: string;
  since: string;
  /** Ramo de outra Ramificação (Next.js sai do React). */
  parent?: string;
  doc: string;
  /** Porta para uma era futura: aparece sempre bloqueada (Node.js → Era do Back-end). */
  future?: boolean;
  /** Trilhas planejadas (o conteúdo ainda está em construção). */
  trails: string[];
};

/** Peças do portfólio, uma por trilha da era. */
export type PortfolioPiece = 'files' | 'title' | 'hero' | 'links' | 'sections' | 'color' | 'cards' | 'flex' | 'greet' | 'dark';

export type PortfolioLink = { href: string; t: string };

/** O que o viajante escreveu nas missões e vira o portfólio dele. */
export type WebPortfolio = {
  name?: string;
  bio?: string;
  title?: string;
  color?: string;
  links?: PortfolioLink[];
};

/** Uma etapa vencida (trilha, chefe, trilha de lua ou chefe de lua). */
export type WebStageResult = {
  /** Instante ISO da primeira vitória. */
  at: string;
  /** XP ganho (missões + bônus da etapa), guardado para o total não depender do conteúdo. */
  xp: number;
};

/** Progresso da Era da Web, dentro de `Progress.webEra` (sobe para a nuvem com o resto). */
export type WebEraProgress = {
  /** Etapas vencidas, por id (`w1`…`w10`, `eco`, `mh1`…, `mh-chefe`…). */
  done: Record<string, WebStageResult>;
  portfolio?: WebPortfolio;
  /** Quando o portfólio mudou por último (o merge entre aparelhos fica com o mais novo). */
  portfolioAt?: string;
  /** A Sintaxe já apresentou a era (a intro longa toca uma vez). */
  introSeen?: boolean;
};

/** Tipo de etapa que o palco (runner) joga. */
export type WebStageKind = 'trail' | 'boss' | 'moon' | 'moonboss';
