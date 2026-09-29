/**
 * Falas da Senhorita Sintaxe e textos da Era da Web (protótipo). Regra da era: mais ação,
 * menos leitura — no máximo 2 frases curtas por tela.
 */
export const webEraCopy = {
  /** Intro da era (toca uma vez; um balão por toque). */
  intro: [
    'Oi, viajante! Eu sou a Senhorita Sintaxe.',
    'Uma variante sua, o Eco, fugiu para 1991 e está apagando a Web: HTML, CSS e JavaScript.',
    'Se ele vencer, ninguém mais terá página própria. Nem você.',
    'Vamos consertar a história e, no caminho, construir o SEU portfólio.',
  ],
  /** Balão do topo da era, conforme o avanço. */
  story(p: { name: string; nextTitle?: string; nextYear?: string; done: number; ecoDefeated: boolean; moonsDone: boolean }): string {
    if (p.nextTitle) {
      return p.done === 0
        ? `${p.name}, próximo portal: ${p.nextTitle} (${p.nextYear}). O Eco já começou a apagar tudo!`
        : `${p.name}, próximo portal: ${p.nextTitle} (${p.nextYear}). Seu portfólio está ${p.done * 10}% restaurado.`;
    }
    if (!p.ecoDefeated) return 'Todas as peças no lugar. O Eco está te esperando. Não perca corações e a insígnia lendária é sua!';
    if (!p.moonsDone) return 'Você venceu o Eco! Três luas nasceram: HTML, CSS e JS. Elas orbitam o portal da era no mapa.';
    return 'As três luas brilham. Um Evento Nexus abriu as Ramificações: os frameworks.';
  },
  ecoDefeated: 'Com o Eco derrotado, os fragmentos da Web viraram três luas: HTML, CSS e JS. Elas já estão orbitando o mapa.',
  nexus: 'As três luas se alinharam. EVENTO NEXUS: as Ramificações se abriram!',
  gameOver: 'A linha do tempo ramificou!',
  retryHint: 'Respira. Você tem mais uma chance!',
  closedPortal: 'Portal fechado. Termine o anterior!',
  moonsLocked: 'As luas nascem quando o Eco cair.',
  branchOpen: (name: string) => `Evento Nexus! O portal do ${name} está se formando. 5 trilhas, desafios e um chefe, tudo pela documentação oficial.`,
  branchLocked: 'Esse portal só abre quando as três luas estiverem vencidas.',
  branchFuture: 'Node.js leva o JavaScript para o servidor. Ele abre a próxima era: a do Back-end.',
  portfolioTip: 'Cada trilha concluída adiciona uma peça. No fim, cole os 3 arquivos numa pasta e publique grátis no GitHub Pages ou na Vercel.',
  cheers: ['Boa!', 'Mandou bem!', 'Isso aí!', 'Perfeito!'],
};
