/** Cópia e coordenadas do Mini Mapa do Tempo (referência: prototypes/Mapa_do_Tempo_Teste.html). */

export const MAP_W = 1000;
export const MAP_H = 1300;
export const HUB = { x: 500, y: 660 };

export type EraStatus = 'ativo' | 'novo' | 'breve' | 'nevoa';
export type EraIcon = 'db' | 'log' | 'code' | 'git' | 'cloud' | 'web' | 'ia';

/** Linguagem "satélite" que ainda vai ganhar ilha própria — ver `LanguageSatellite`. */
export type SatelliteIcon = 'py' | 'java' | 'c' | 'php';

export type MapEra = {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  icon: EraIcon;
  status: EraStatus;
  years: string;
  description: string;
  /** Ilha (Trail) que esta era abre; só existe para eras com conteúdo. */
  trailId?: string;
  /** Luas apagadas em volta da era, cada uma "em breve" (ver `SATELLITE_ICON_PATHS`). */
  satellites?: LanguageSatellite[];
};

export type LanguageSatellite = {
  id: string;
  name: string;
  icon: SatelliteIcon;
  /** Ângulo em graus (0 = direita, 90 = abaixo) ao redor do centro da era-mãe. */
  angle: number;
};

/**
 * Símbolos próprios e simples que só sugerem cada linguagem (nunca os logotipos oficiais,
 * ver seção 8 do CLAUDE.md) — desenhados apagados/dessaturados de propósito, pra dar
 * curiosidade sem prometer nada ainda: essas linguagens não têm ilha, só o gancho visual.
 */
export const SATELLITE_ICON_PATHS: Record<SatelliteIcon, string> = {
  // Python: duas curvas entrelaçadas, ecoando as "duas cobras" do símbolo real.
  py: 'M-1 -9a5 5 0 1 0 0 10a5 5 0 1 1 0 8',
  // Java: xícara com pires e duas baforadas de vapor.
  java: 'M-6 -2h12v5a6 5 0 0 1 -12 0zM-8 3h16M6 -1c3 0 4 3 2 5M-3 -9c1 2 -1 3 0 5M2 -9c1 2 -1 3 0 5',
  // C: um anel aberto, a própria letra.
  c: 'M7 -6a8 8 0 1 0 0 12',
  // PHP: o óvalo do logotipo, sem o texto.
  php: 'M-9 0a9 5 0 1 0 18 0a9 5 0 1 0 -18 0',
};

const SATELLITE_RADIUS = 118;

/** Posição (x,y) de um satélite, a partir do centro da era-mãe. */
export function satellitePosition(era: MapEra, satellite: LanguageSatellite): { x: number; y: number } {
  const rad = (satellite.angle * Math.PI) / 180;
  return {
    x: era.x + SATELLITE_RADIUS * Math.cos(rad),
    y: era.y + SATELLITE_RADIUS * Math.sin(rad),
  };
}

export const ICON_PATHS: Record<EraIcon, string> = {
  db: 'M-12 -9a12 5 0 1 0 24 0a12 5 0 1 0 -24 0M-12 -9v18c0 3 5 5 12 5s12-2 12-5v-18M-12 0c0 3 5 5 12 5s12-2 12-5',
  log: 'M0 -15l13 13-13 13-13-13zM0 11v6M-6 17h12',
  code: 'M-8 -9l-9 9 9 9M8 -9l9 9-9 9M3 -13l-6 26',
  git: 'M-8 -7v14M10 0c0 8-14 4-18 11M-11.5 -11a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0M-11.5 11a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0M6.5 -4a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0',
  cloud: 'M-13 9a8 8 0 010-16 11 11 0 0121-3 9 9 0 011 19z',
  web: 'M-14 0a14 14 0 1 0 28 0a14 14 0 1 0 -28 0M-14 0h28M0 -14c-8 8-8 20 0 28M0 -14c8 8 8 20 0 28',
  ia: 'M0 -14c-8 0-14 6-14 13s5 9 8 9c0 4 3 6 6 6s6-2 6-6c3 0 8-2 8-9S8 -14 0 -14z',
};

export const ERAS: MapEra[] = [
  {
    id: 'dados',
    name: 'Era dos Dados',
    x: 220,
    y: 520,
    color: '#5ee7ff',
    icon: 'db',
    status: 'ativo',
    years: '1963 → hoje',
    trailId: 'banco-de-dados',
    description:
      'Bancos de dados: do foguete Saturn V e da primeira lista de peças ao PostgreSQL. Aqui moram os 22 módulos de SQL e o laboratório na Máquina do Tempo.',
  },
  {
    id: 'logica',
    name: 'Era da Lógica',
    x: 520,
    y: 340,
    color: '#2dff8a',
    icon: 'log',
    status: 'ativo',
    years: 'ERA 2',
    trailId: 'logica',
    description: 'Como pensar um problema passo a passo: variáveis, condições, laços e funções.',
    satellites: [
      { id: 'py', name: 'Python', icon: 'py', angle: -45 },
      { id: 'java', name: 'Java', icon: 'java', angle: 45 },
      { id: 'c', name: 'C', icon: 'c', angle: 135 },
      { id: 'php', name: 'PHP', icon: 'php', angle: -135 },
    ],
  },
  {
    id: 'ling',
    name: 'Era das Linguagens',
    x: 790,
    y: 480,
    color: '#ff6b1f',
    icon: 'code',
    status: 'breve',
    years: 'ERA 3',
    description:
      'Java, Python e PHP. Cada linguagem nasceu para resolver um problema, e todas compartilham a mesma base de sintaxe.',
  },
  {
    id: 'git',
    name: 'Código Compartilhado',
    x: 810,
    y: 830,
    color: '#ffa36b',
    icon: 'git',
    status: 'ativo',
    years: 'ERA 4',
    trailId: 'git-github',
    description: 'Git e GitHub: como times escrevem juntos sem se atropelar. Do primeiro commit ao primeiro push, com laboratório de terminal.',
  },
  {
    id: 'nuvem',
    name: 'Era das Nuvens',
    x: 520,
    y: 990,
    color: '#7aa8ff',
    icon: 'cloud',
    status: 'breve',
    years: 'ERA 5',
    description: 'Docker, containers e deploy: colocar o seu código no ar.',
  },
  {
    id: 'web',
    name: 'Era da Web',
    x: 200,
    y: 850,
    color: '#3ee0a1',
    icon: 'web',
    status: 'breve',
    years: 'ERA 6',
    description: 'HTML, CSS, JavaScript e APIs: como os sites funcionam.',
  },
  {
    id: 'ia',
    name: 'Névoa da Inteligência',
    x: 520,
    y: 120,
    color: '#ffd479',
    icon: 'ia',
    status: 'nevoa',
    years: 'ERA 7',
    description: 'Ainda inexplorada. A Senhorita Sintaxe diz que a névoa só abre quando o mapa estiver mais completo.',
  },
];

export type MapCharacter = {
  glyph: string;
  name: string;
  x: number;
  y: number;
  color: string;
  role: string;
  text: string;
};

export const CHARACTERS: MapCharacter[] = [
  {
    glyph: ';',
    name: 'Dona Vírgula',
    x: 400,
    y: 585,
    color: '#5ee7ff',
    role: 'Guardiã das regras de escrita',
    text: 'Eu cuido dos pontos, vírgulas e parênteses. Uma vírgula fora do lugar e o computador faz bico! Vem, eu te ensino onde cada símbolo mora.',
  },
  {
    glyph: '{ }',
    name: 'Seu Bloco',
    x: 640,
    y: 400,
    color: '#ff6b1f',
    role: 'Guarda de blocos e escopo',
    text: 'Tudo que fica entre as minhas chaves pertence a um mesmo bloco. Função, laço, condição: cada um vive na sua casinha. Entrou, fechou, saiu.',
  },
  {
    glyph: '◈',
    name: 'Compila',
    x: 640,
    y: 1040,
    color: '#7aa8ff',
    role: 'Construtora de programas',
    text: 'Eu transformo o seu código em algo que roda de verdade. Quando eu apito vermelho, é erro; quando fico azul, está pronto para ir ao ar.',
  },
];

/** Curva luminosa da Praça da Sintaxe até a era. */
export function pathToEra(era: MapEra): string {
  const mx = (HUB.x + era.x) / 2;
  const my = (HUB.y + era.y) / 2;
  const dx = era.x - HUB.x;
  const dy = era.y - HUB.y;
  return `M${HUB.x} ${HUB.y} Q${mx - dy * 0.18} ${my + dx * 0.18} ${era.x} ${era.y}`;
}
